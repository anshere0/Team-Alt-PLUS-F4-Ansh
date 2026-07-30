'use client';

import React from 'react';
import { UploadCloud } from 'lucide-react';
import { UploadForm } from '@/components/ingestion/UploadForm';

export default function IngestionPage() {
  return (
    <div className="space-y-8 pb-20 font-sans">
      {/* Executive Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-default)] pb-6">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-[var(--text-primary)] flex items-center gap-2 font-sans">
            <UploadCloud className="w-5 h-5 text-[var(--accent-blue)]" />
            Data Ingestion Hub
          </h1>
          <p className="text-xs text-[var(--text-muted)] font-sans mt-1">
            Batch import historical telemetry (CSV) and field audit logs (PDF)
          </p>
        </div>
      </div>

      <div className="max-w-3xl">
        <UploadForm />
      </div>
    </div>
  );
}
