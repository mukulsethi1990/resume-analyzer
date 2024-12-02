from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict
from utils.text_analyzer import TextAnalyzer
from utils.resume_processor import ResumeProcessor
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize processors
text_analyzer = TextAnalyzer()
resume_processor = ResumeProcessor()

# Store uploaded resumes in memory
resumes = {}

class JobDescription(BaseModel):
    text: str

class MatchResult(BaseModel):
    filename: str
    score: float
    matching_skills: List[str]
    skill_match_percentage: float
    experience_match: Dict
    education_match: bool
    overall_rank: int

@app.post("/analyze-job/")
async def analyze_job_description(job_description: JobDescription):
    """Analyze job description for key requirements"""
    try:
        analysis = {
            "skills": text_analyzer.extract_skills(job_description.text),
            "experience": text_analyzer.extract_experience(job_description.text),
            "education": text_analyzer.extract_education(job_description.text)
        }
        return analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/upload-resume/")
async def upload_resume(file: UploadFile = File(...)):
    """Upload and process a resume"""
    try:
        contents = await file.read()
        processed_resume = resume_processor.process_resume(contents, file.filename)
        
        # Extract key information
        text = processed_resume["text"]
        skills = text_analyzer.extract_skills(text)
        experience = text_analyzer.extract_experience(text)
        education = text_analyzer.extract_education(text)
        
        # Store processed resume
        resumes[file.filename] = {
            "text": text,
            "skills": skills,
            "experience": experience,
            "education": education
        }
        
        return {
            "filename": file.filename,
            "status": "success",
            "skills_found": skills,
            "experience": experience,
            "education": education
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/match/", response_model=List[MatchResult])
async def match_resumes(job_description: JobDescription):
    """Match resumes against job description"""
    if not resumes:
        raise HTTPException(status_code=400, detail="No resumes uploaded")
    
    try:
        # Analyze job description
        job_skills = text_analyzer.extract_skills(job_description.text)
        job_experience = text_analyzer.extract_experience(job_description.text)
        job_education = text_analyzer.extract_education(job_description.text)
        
        # Prepare for TF-IDF
        vectorizer = TfidfVectorizer(stop_words='english')
        documents = [job_description.text] + [resume['text'] for resume in resumes.values()]
        tfidf_matrix = vectorizer.fit_transform(documents)
        
        # Calculate content similarity
        content_similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:])[0]
        
        # Prepare results
        results = []
        for idx, (filename, resume) in enumerate(resumes.items()):
            # Calculate skill match percentage
            matching_skills = set(resume['skills']).intersection(set(job_skills))
            skill_match_pct = len(matching_skills) / len(job_skills) if job_skills else 0
            
            # Check experience match
            exp_match = {
                "meets_minimum": resume['experience']['minimum_years'] >= job_experience['minimum_years'],
                "years_difference": resume['experience']['minimum_years'] - job_experience['minimum_years']
            }
            
            # Check education match
            edu_match = any(job_edu.lower() in ' '.join(resume['education']).lower() 
                          for job_edu in job_education)
            
            # Calculate weighted score
            weights = {
                'content_similarity': 0.4,
                'skill_match': 0.3,
                'experience_match': 0.2,
                'education_match': 0.1
            }
            
            weighted_score = (
                content_similarity[idx] * weights['content_similarity'] +
                skill_match_pct * weights['skill_match'] +
                (1 if exp_match['meets_minimum'] else 0) * weights['experience_match'] +
                (1 if edu_match else 0) * weights['education_match']
            )
            
            results.append(MatchResult(
                filename=filename,
                score=float(weighted_score),
                matching_skills=list(matching_skills),
                skill_match_percentage=float(skill_match_pct * 100),
                experience_match=exp_match,
                education_match=edu_match,
                overall_rank=0  # Will be set after sorting
            ))
        
        # Sort by score and set ranks
        results.sort(key=lambda x: x.score, reverse=True)
        for i, result in enumerate(results):
            result.overall_rank = i + 1
            
        return results
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
