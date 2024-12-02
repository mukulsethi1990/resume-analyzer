import React from 'react';
import { Card } from '@/components/ui/card';

interface OverallStatsProps {
  results: Array<{
    score: number;
    skill_match_percentage: number;
    experience_match: {
      meets_minimum: boolean;
    };
    education_match: boolean;
  }>;
}

export const OverallStats = ({ results }: OverallStatsProps) => {
  if (!results.length) return null;

  const calculateStats = () => {
    const totalCandidates = results.length;
    const avgScore = results.reduce((acc, curr) => acc + curr.score, 0) / totalCandidates;
    const avgSkillMatch = results.reduce((acc, curr) => acc + curr.skill_match_percentage, 0) / totalCandidates;
    const experienceMatchCount = results.filter(r => r.experience_match.meets_minimum).length;
    const educationMatchCount = results.filter(r => r.education_match).length;

    return {
      avgScore: avgScore * 100,
      avgSkillMatch,
      experienceMatchPercentage: (experienceMatchCount / totalCandidates) * 100,
      educationMatchPercentage: (educationMatchCount / totalCandidates) * 100,
      totalCandidates
    };
  };

  const stats = calculateStats();

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Overall Statistics</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard
          title="Average Match"
          value={`${stats.avgScore.toFixed(1)}%`}
        />
        <StatCard
          title="Average Skill Match"
          value={`${stats.avgSkillMatch.toFixed(1)}%`}
        />
        <StatCard
          title="Experience Match"
          value={`${stats.experienceMatchPercentage.toFixed(1)}%`}
        />
        <StatCard
          title="Education Match"
          value={`${stats.educationMatchPercentage.toFixed(1)}%`}
        />
        <StatCard
          title="Total Candidates"
          value={stats.totalCandidates.toString()}
        />
      </div>
    </Card>
  );
};

const StatCard = ({ title, value }: { title: string; value: string }) => (
  <div className="bg-gray-50 p-4 rounded-lg">
    <h3 className="text-sm font-medium text-gray-500">{title}</h3>
    <p className="text-2xl font-semibold mt-1">{value}</p>
  </div>
);