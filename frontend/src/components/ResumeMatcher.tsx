import React, { useState } from 'react';
import axios from 'axios';

interface MatchResult {
  filename: string;
  score: number;
  matching_skills: string[];
}

export default function ResumeMatcher() {
  const [jobDescription, setJobDescription] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [results, setResults] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setLoading(true);
    setError('');

    try {
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append('file', files[i]);

        const response = await axios.post('http://localhost:8000/upload-resume/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        setUploadedFiles(prev => [...prev, response.data.filename]);
      }
    } catch (err) {
      setError('Error uploading files');
      console.error(err);
    }

    setLoading(false);
  };

  const handleMatch = async () => {
    if (!jobDescription) {
      setError('Please enter a job description');
      return;
    }

    if (uploadedFiles.length === 0) {
      setError('Please upload at least one resume');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:8000/match/', {
        text: jobDescription
      });

      setResults(response.data);
    } catch (err) {
      setError('Error matching resumes');
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          Job Description
          <textarea
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
            rows={6}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Enter the job description..."
          />
        </label>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          Upload Resumes
          <input
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleFileUpload}
            className="mt-1 block w-full"
          />
        </label>

        {uploadedFiles.length > 0 && (
          <div className="mt-2">
            <h3 className="text-sm font-medium">Uploaded Files:</h3>
            <ul className="list-disc pl-5">
              {uploadedFiles.map((file, index) => (
                <li key={index}>{file}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <button
        onClick={handleMatch}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
      >
        {loading ? 'Processing...' : 'Match Resumes'}
      </button>

      {error && (
        <div className="mt-4 text-red-500">
          {error}
        </div>
      )}

      {results.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Results</h2>
          <div className="space-y-4">
            {results.map((result, index) => (
              <div key={index} className="border rounded-lg p-4">
                <h3 className="font-medium">{result.filename}</h3>
                <p className="text-gray-600">Match Score: {(result.score * 100).toFixed(1)}%</p>
                {result.matching_skills.length > 0 && (
                  <div className="mt-2">
                    <h4 className="text-sm font-medium">Matching Skills:</h4>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {result.matching_skills.map((skill, skillIndex) => (
                        <span
                          key={skillIndex}
                          className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
