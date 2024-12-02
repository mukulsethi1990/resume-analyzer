import React from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface MatchResult {
  filename: string;
  score: number;
  matching_skills: string[];
  skill_match_percentage: number;
  experience_match: {
    meets_minimum: boolean;
    years_difference: number;
  };
  education_match: boolean;
  overall_rank: number;
}

interface MatchResultsProps {
  results: MatchResult[];
  loading: boolean;
}

export const MatchResults = ({ results, loading }: MatchResultsProps) => {
  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (!results.length) return null;

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Match Results</h2>
      <div className="space-y-4">
        {results.map((result) => (
          <Card key={result.filename} className="p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-medium">{result.filename}</h3>
                <p className="text-sm text-gray-500">Rank: #{result.overall_rank}</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold">
                  {(result.score * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-500">
                  Overall Match
                </div>
              </div>
            </div>

            <Progress value={result.score * 100} className="mb-4" />

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm font-medium">Skills Match</p>
                <p className="text-lg">{result.skill_match_percentage.toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-sm font-medium">Experience</p>
                <p className="text-lg">
                  {result.experience_match.meets_minimum ? '✓' : '✗'}
                  {result.experience_match.years_difference >= 0 
                    ? ` (+${result.experience_match.years_difference} years)`
                    : ` (${result.experience_match.years_difference} years)`}
                </p>
              </div>
            </div>

            {result.matching_skills.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Matching Skills:</p>
                <div className="flex flex-wrap gap-2">
                  {result.matching_skills.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </Card>
  );
};