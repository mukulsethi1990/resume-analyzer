import React, { useState } from 'react';
import { JobDescriptionInput } from './JobDescriptionInput';
import { ResumeUploader } from './ResumeUploader';
import { MatchResults } from './MatchResults';
import { SkillsChart } from './SkillsChart';
import { ExperienceChart } from './ExperienceChart';
import { OverallStats } from './OverallStats';

interface JobAnalysis {
  skills: string[];
  experience: {
    minimum_years: number;
    found_matches: string[];
  };
  education: string[];
}

export const Dashboard = () => {
  const [jobAnalysis, setJobAnalysis] = useState<JobAnalysis | null>(null);
  const [matchResults, setMatchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Input Section */}
        <div className="space-y-6">
          <JobDescriptionInput 
            onAnalysis={setJobAnalysis}
            setLoading={setLoading}
          />
          <ResumeUploader
            jobAnalysis={jobAnalysis}
            setMatchResults={setMatchResults}
            setLoading={setLoading}
          />
        </div>

        {/* Right Column - Analysis Section */}
        <div className="space-y-6">
          {jobAnalysis && matchResults.length > 0 && (
            <>
              <OverallStats results={matchResults} />
              <SkillsChart 
                requiredSkills={jobAnalysis.skills}
                matchResults={matchResults}
              />
              <ExperienceChart 
                results={matchResults}
                requiredYears={jobAnalysis.experience.minimum_years}
              />
            </>
          )}
        </div>
      </div>

      {/* Bottom Section - Results */}
      <div className="mt-6">
        <MatchResults 
          results={matchResults}
          loading={loading}
        />
      </div>
    </div>
  );
};