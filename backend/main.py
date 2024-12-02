from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import spacy
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import PyPDF2
import docx
import io
import os

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load spaCy model
try:
    nlp = spacy.load("en_core_web_sm")
except:
    os.system("python -m spacy download en_core_web_sm")
    nlp = spacy.load("en_core_web_sm")

class JobDescription(BaseModel):
    text: str

class MatchResult(BaseModel):
    filename: str
    score: float
    matching_skills: List[str]

# Store uploaded resumes in memory
resumes = {}

def extract_text_from_pdf(file_bytes):
    pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))
    text = ""
    for page in pdf_reader.pages:
        text += page.extract_text() + "\n"
    return text

def extract_text_from_docx(file_bytes):
    doc = docx.Document(io.BytesIO(file_bytes))
    text = ""
    for paragraph in doc.paragraphs:
        text += paragraph.text + "\n"
    return text

def extract_skills(text):
    doc = nlp(text.lower())
    # This is a simple skill extraction. In production, you'd want a more comprehensive skill database
    skills = set()
    for ent in doc.ents:
        if ent.label_ in ["ORG", "PRODUCT"]:
            skills.add(ent.text)
    return list(skills)

@app.post("/upload-resume/")
async def upload_resume(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        
        if file.filename.endswith('.pdf'):
            text = extract_text_from_pdf(contents)
        elif file.filename.endswith('.docx'):
            text = extract_text_from_docx(contents)
        elif file.filename.endswith('.txt'):
            text = contents.decode()
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format")
        
        # Store the processed resume
        resumes[file.filename] = {
            'text': text,
            'skills': extract_skills(text)
        }
        
        return {"filename": file.filename, "status": "success"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/match/", response_model=List[MatchResult])
async def match_resumes(job_description: JobDescription):
    if not resumes:
        raise HTTPException(status_code=400, detail="No resumes uploaded")
    
    try:
        # Create TF-IDF vectorizer
        vectorizer = TfidfVectorizer(stop_words='english')
        
        # Prepare documents for comparison
        documents = [job_description.text] + [resume['text'] for resume in resumes.values()]
        tfidf_matrix = vectorizer.fit_transform(documents)
        
        # Calculate similarity scores
        similarity_scores = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:])[0]
        
        # Prepare results
        results = []
        for (filename, resume), score in zip(resumes.items(), similarity_scores):
            matching_skills = list(set(resume['skills']).intersection(
                set(extract_skills(job_description.text))
            ))
            
            results.append(MatchResult(
                filename=filename,
                score=float(score),
                matching_skills=matching_skills
            ))
        
        # Sort by score descending
        results.sort(key=lambda x: x.score, reverse=True)
        return results
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)