'use client';

import React, { useState } from 'react';
import { ClipboardList, UserCheck, FileText, Filter } from 'lucide-react';
import { MOCK_ALERTS } from '@/services/mockData';

export default function InspectorPage() {
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [assignedModal, setAssignedModal] = useState<string | null>(null);

  return (
    <div className="space-y-5 pb-16 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-default)] pb-3.5">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-[var(--text-primary)] flex items-center gap-2 font-sans">
            <ClipboardList className="w-5 h-5 text-[var(--accent-blue)]" />
            Field Inspector Worklist
          </h1>
          <p className="text-xs text-[var(--text-muted)] font-sans mt-0.5">
            Prioritized theft audit dispatch table based on AI SHAP risk score &amp; financial revenue at risk
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans font-medium bg-[var(--tint-blue-bg)] text-[var(--accent-blue)] border border-[var(--tint-blue-border)] hover:opacity-90 transition-colors">
            <FileText className="w-3.5 h-3.5" />
            <span>Export Inspection PDF</span>
          </button>
        </div>
      </div>

      {/* Action Table */}
      <div className="glass-panel p-4 space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-sans">
            <Filter className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            <span className="text-[var(--text-muted)] font-medium">Status Filter:</span>
            {['All', 'Pending', 'Dispatched', 'Verified Theft'].map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status.toUpperCase())}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                  selectedStatus === status.toUpperCase() || (selectedStatus === 'ALL' && status === 'All')
                    ? 'bg-[var(--accent-blue)] text-white font-semibold'
                    : 'bg-[var(--bg-raised)] text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--border-default)]'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-xs">
            <thead>
              <tr className="border-b border-[var(--border-default)] text-[var(--text-muted)] uppercase text-[10px] tracking-wider font-sans">
                <th className="py-2.5 px-3">Meter ID</th>
                <th className="py-2.5 px-3">Consumer Name</th>
                <th className="py-2.5 px-3">Anomaly Type</th>
                <th className="py-2.5 px-3">AI Risk Score</th>
                <th className="py-2.5 px-3">Est. Financial Loss</th>
                <th className="py-2.5 px-3 text-right">Action Dispatch</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {MOCK_ALERTS.map((alert) => (
                <tr key={alert.alert_id} className="hover:bg-[var(--bg-hover)] transition-colors">
                  <td className="py-3 px-3 font-semibold font-mono text-[var(--accent-blue)]">{alert.meter_id}</td>
                  <td className="py-3 px-3 text-[var(--text-primary)]">{alert.consumer_name || 'Apex Complex'}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-md bg-[var(--tint-rose-bg)] text-[var(--accent-rose)] border border-[var(--tint-rose-border)] text-[10px] font-sans">
                      {alert.anomaly_type.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-semibold font-mono text-[var(--accent-rose)]">{alert.risk_score}</td>
                  <td className="py-3 px-3 font-semibold font-mono text-[var(--text-primary)]">₹{alert.financial_loss_estimate.toLocaleString()}</td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => setAssignedModal(alert.meter_id)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--bg-raised)] hover:bg-[var(--bg-inset)] text-[var(--text-primary)] border border-[var(--border-default)] transition-colors font-medium"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-[var(--accent-blue)]" />
                      <span>Assign Team</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assignment Modal */}
      {assignedModal && (
        <div className="fixed inset-0 bg-[var(--bg-overlay)] backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="glass-panel p-5 max-w-md w-full border-[var(--border-emphasis)] space-y-4 bg-[var(--bg-modal)] font-sans">
            <h3 className="font-semibold text-sm text-[var(--text-primary)] flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[var(--accent-blue)]" />
              Dispatch Audit Team — <span className="font-mono">{assignedModal}</span>
            </h3>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Assign field inspector squad to perform ground-truth audit &amp; seal verification.
            </p>
            <div className="space-y-1.5 text-xs">
              <label className="text-[var(--text-secondary)] block font-medium">Select Field Inspector Squad:</label>
              <select className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg p-2.5 text-[var(--text-primary)] font-sans">
                <option>Squad Alpha (Delhi Central Region)</option>
                <option>Squad Bravo (Industrial Sector 4)</option>
                <option>Squad Charlie (Rapid Audit Unit)</option>
              </select>
            </div>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setAssignedModal(null)}
                className="px-3 py-1.5 rounded-lg bg-[var(--bg-inset)] text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xs font-medium border border-[var(--border-default)]"
              >
                Cancel
              </button>
              <button
                onClick={() => setAssignedModal(null)}
                className="px-3 py-1.5 rounded-lg bg-[var(--accent-blue)] hover:opacity-90 text-white font-semibold text-xs"
              >
                Confirm Dispatch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
