import React, { useState } from 'react';
import axios from 'axios';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, File } from 'lucide-react';

interface ResumeUploaderProps {
  jobAnalysis: any;
  setMatchResults: (results: any) => void;
  setLoading: (loading: boolean) => void;
}

export const ResumeUploader = ({ jobAnalysis, setMatchResults, setLoading }: ResumeUploaderProps) => {
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
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

        await axios.post('http://localhost:8000/upload-resume/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        setUploadedFiles(prev => [...prev, files[i].name]);
      }

      if (jobAnalysis) {
        const matchResponse = await axios.post('http://localhost:8000/match/', {
          text: jobAnalysis.text
        });
        setMatchResults(matchResponse.data);
      }
    } catch (err) {
      setError('Error processing files');
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Upload Resumes</h2>
      
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">Drag and drop files or</p>
        <input
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.txt"
          onChange={handleFileUpload}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload">
          <Button variant="outline" className="mt-2">
            Select Files
          </Button>
        </label>
      </div>

      {uploadedFiles.length > 0 && (
        <div className="mt-4">
          <h3 className="font-medium mb-2">Uploaded Files:</h3>
          <div className="space-y-2">
            {uploadedFiles.map((filename, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <File className="h-4 w-4" />
                <span>{filename}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && <p className="text-red-500 mt-2">{error}</p>}
    </Card>
  );
};