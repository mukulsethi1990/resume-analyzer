import React, { useState } from 'react';
import axios from 'axios';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface JobDescriptionInputProps {
  onAnalysis: (analysis: any) => void;
  setLoading: (loading: boolean) => void;
}

export const JobDescriptionInput = ({ onAnalysis, setLoading }: JobDescriptionInputProps) => {
  const [jobDescription, setJobDescription] = useState('');
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      setError('Please enter a job description');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:8000/analyze-job/', {
        text: jobDescription
      });

      onAnalysis(response.data);
    } catch (err) {
      setError('Error analyzing job description');
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Job Description</h2>
      <Textarea
        className="min-h-[200px] mb-4"
        placeholder="Paste the job description here..."
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
      />
      <Button onClick={handleAnalyze} className="w-full">
        Analyze Requirements
      </Button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </Card>
  );
};