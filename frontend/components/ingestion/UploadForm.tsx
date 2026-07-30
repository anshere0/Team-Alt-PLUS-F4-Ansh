'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { apiClient } from '@/services/apiClient';

export const UploadForm: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleFileSelection = (selectedFile: File) => {
    const validTypes = ['text/csv', 'application/pdf'];
    if (!validTypes.includes(selectedFile.type) && !selectedFile.name.endsWith('.csv') && !selectedFile.name.endsWith('.pdf')) {
      setUploadStatus('error');
      setStatusMessage('Invalid file type. Please select a CSV or PDF file.');
      return;
    }
    setFile(selectedFile);
    setUploadStatus('idle');
    setStatusMessage('');
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setUploadStatus('idle');
    setStatusMessage('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await apiClient.post('/api/v1/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setUploadStatus('success');
      setStatusMessage((response as any).message || 'File uploaded successfully.');
      setFile(null);
    } catch (error: any) {
      setUploadStatus('error');
      setStatusMessage(error.response?.data?.detail || error.message || 'Failed to upload file.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="glass-panel p-6 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)]">
      <h3 className="text-sm font-semibold mb-4 text-[var(--text-primary)]">
        Upload Historical Data & Audit Logs
      </h3>
      
      <div
        className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all ${
          isDragging 
            ? 'border-[var(--accent-blue)] bg-[var(--tint-blue-bg)]' 
            : 'border-[var(--border-muted)] hover:border-[var(--accent-blue)] bg-[var(--bg-inset)]'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".csv, .pdf"
          className="hidden"
        />
        
        {file ? (
          <div className="flex flex-col items-center text-center">
            <FileText className="w-10 h-10 text-[var(--accent-blue)] mb-3" />
            <p className="text-sm font-medium text-[var(--text-primary)]">{file.name}</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center cursor-pointer">
            <UploadCloud className="w-10 h-10 text-[var(--text-muted)] mb-3 group-hover:text-[var(--accent-blue)] transition-colors" />
            <p className="text-sm font-medium text-[var(--text-primary)]">
              Drag & drop a file here, or click to browse
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Supports .csv (Telemetry) and .pdf (Field Audits) up to 50MB
            </p>
          </div>
        )}
      </div>

      {uploadStatus === 'success' && (
        <div className="mt-4 p-3 rounded-lg bg-[var(--tint-emerald-bg)] border border-[var(--tint-emerald-border)] flex items-start gap-2">
          <CheckCircle className="w-4 h-4 text-[var(--accent-emerald)] shrink-0 mt-0.5" />
          <p className="text-xs text-[var(--accent-emerald)] font-medium leading-relaxed">
            {statusMessage}
          </p>
        </div>
      )}

      {uploadStatus === 'error' && (
        <div className="mt-4 p-3 rounded-lg bg-[var(--tint-rose-bg)] border border-[var(--tint-rose-border)] flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-[var(--accent-rose)] shrink-0 mt-0.5" />
          <p className="text-xs text-[var(--accent-rose)] font-medium leading-relaxed">
            {statusMessage}
          </p>
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleUpload}
          disabled={!file || isUploading}
          className="px-4 py-2 bg-[var(--accent-blue)] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-semibold transition-opacity flex items-center gap-2"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing...
            </>
          ) : (
            'Process File'
          )}
        </button>
      </div>
    </div>
  );
};
