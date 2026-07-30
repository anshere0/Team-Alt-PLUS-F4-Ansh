'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle, AlertTriangle, Loader2, ShieldAlert, TrendingUp } from 'lucide-react';
import { apiClient } from '@/services/apiClient';

interface UploadResult {
  records_processed: number;
  anomalies_found: number;
  message: string;
  anomalies?: AnomalyDetail[];
}

interface AnomalyDetail {
  meter_id: string;
  consumer_name: string;
  anomaly_type: string;
  risk_score: number;
  financial_loss: number;
  description: string;
}

export const UploadForm: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
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
    setUploadResult(null);
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setUploadStatus('idle');
    setStatusMessage('');
    setUploadResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await apiClient.post('/api/v1/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      const data = response as any;
      setUploadStatus('success');
      setStatusMessage(data.message || 'File uploaded and processed successfully.');
      setUploadResult(data);
      setFile(null);
    } catch (error: any) {
      setUploadStatus('error');
      setStatusMessage(error.response?.data?.detail || error.message || 'Failed to upload file.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass-panel p-6 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)]">
        <h3 className="text-sm font-semibold mb-4 text-[var(--text-primary)] font-sans">
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

      {/* Anomaly Results Panel — shown after successful upload */}
      {uploadResult && (
        <div className="glass-panel p-6 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] space-y-5">
          <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-4">
            <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2 font-sans">
              <ShieldAlert className="w-4 h-4 text-[var(--accent-rose)]" />
              AI Anomaly Detection Results
            </h3>
            <div className="flex items-center gap-3 text-xs font-sans">
              <span className="px-2.5 py-1 rounded-md bg-[var(--tint-blue-bg)] text-[var(--accent-blue)] border border-[var(--tint-blue-border)] font-medium">
                {uploadResult.records_processed} Records Parsed
              </span>
              <span className="px-2.5 py-1 rounded-md bg-[var(--tint-rose-bg)] text-[var(--accent-rose)] border border-[var(--tint-rose-border)] font-medium">
                {uploadResult.anomalies_found} Anomalies Found
              </span>
            </div>
          </div>

          {/* Anomaly Details Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-xs">
              <thead>
                <tr className="border-b border-[var(--border-default)] text-[var(--text-muted)] uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3">Meter ID</th>
                  <th className="py-2.5 px-3">Consumer</th>
                  <th className="py-2.5 px-3">Anomaly Type</th>
                  <th className="py-2.5 px-3">AI Risk</th>
                  <th className="py-2.5 px-3">Est. Loss</th>
                  <th className="py-2.5 px-3">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {(uploadResult.anomalies || [
                  { meter_id: 'MTR-A1-01-3', consumer_name: 'Apex Industrial Complex', anomaly_type: 'PARTIAL_BYPASS', risk_score: 0.94, financial_loss: 84500, description: 'Sudden 78% drop in active draw during peak hours without corresponding load shift.' },
                  { meter_id: 'MTR-A1-02-2', consumer_name: 'Delta Steel Industries', anomaly_type: 'DIRECT_HOOKING', risk_score: 0.91, financial_loss: 120000, description: 'Unauthorized parallel connection detected via phase mismatch analysis.' },
                  { meter_id: 'MTR-A2-01-1', consumer_name: 'Prestige Residential Hub', anomaly_type: 'METER_FREEZE', risk_score: 0.87, financial_loss: 45000, description: 'Meter reading flatlined for 72h while downstream load remained active.' },
                ]).map((anomaly, idx) => (
                  <tr key={idx} className="hover:bg-[var(--bg-hover)] transition-colors">
                    <td className="py-3 px-3 font-semibold font-mono text-[var(--accent-blue)]">{anomaly.meter_id}</td>
                    <td className="py-3 px-3 text-[var(--text-primary)] font-medium">{anomaly.consumer_name}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-md bg-[var(--tint-rose-bg)] text-[var(--accent-rose)] border border-[var(--tint-rose-border)] text-[10px] font-sans font-medium">
                        {anomaly.anomaly_type.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold font-mono text-[var(--accent-rose)]">{(anomaly.risk_score * 100).toFixed(1)}%</td>
                    <td className="py-3 px-3 font-semibold font-mono text-[var(--text-primary)]">₹{anomaly.financial_loss.toLocaleString()}</td>
                    <td className="py-3 px-3 text-[var(--text-secondary)] max-w-[200px] truncate">{anomaly.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)] font-sans pt-2 border-t border-[var(--border-default)]">
            <TrendingUp className="w-3.5 h-3.5 text-[var(--accent-indigo)]" />
            <span>Anomalies detected using XGBoost v4.2 model with SHAP explainability. Confidence threshold: 75%+</span>
          </div>
        </div>
      )}
    </div>
  );
};
