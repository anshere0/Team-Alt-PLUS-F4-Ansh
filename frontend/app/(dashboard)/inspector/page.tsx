'use client';

import React, { useState } from 'react';
import { ClipboardList, UserCheck, FileText, Filter } from 'lucide-react';
import { MOCK_ALERTS } from '@/services/mockData';

export default function InspectorPage() {
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [assignedModal, setAssignedModal] = useState<string | null>(null);

  return (
    <div className="space-y-5 pb-16 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3.5">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2 font-sans">
            <ClipboardList className="w-5 h-5 text-blue-400" />
            Field Inspector Worklist
          </h1>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Prioritized theft audit dispatch table based on AI SHAP risk score &amp; financial revenue at risk
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans font-medium bg-blue-950/60 text-blue-300 border border-blue-500/30 hover:bg-blue-900/60 transition-colors">
            <FileText className="w-3.5 h-3.5" />
            <span>Export Inspection PDF</span>
          </button>
        </div>
      </div>

      {/* Action Table */}
      <div className="glass-panel p-4 space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-sans">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400 font-medium">Status Filter:</span>
            {['All', 'Pending', 'Dispatched', 'Verified Theft'].map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status.toUpperCase())}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                  selectedStatus === status.toUpperCase() || (selectedStatus === 'ALL' && status === 'All')
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
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
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-sans">
                <th className="py-2.5 px-3">Meter ID</th>
                <th className="py-2.5 px-3">Consumer Name</th>
                <th className="py-2.5 px-3">Anomaly Type</th>
                <th className="py-2.5 px-3">AI Risk Score</th>
                <th className="py-2.5 px-3">Est. Financial Loss</th>
                <th className="py-2.5 px-3 text-right">Action Dispatch</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {MOCK_ALERTS.map((alert) => (
                <tr key={alert.alert_id} className="hover:bg-slate-900/60 transition-colors">
                  <td className="py-3 px-3 font-semibold font-mono text-blue-300">{alert.meter_id}</td>
                  <td className="py-3 px-3 text-slate-200">{alert.consumer_name || 'Apex Complex'}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-md bg-rose-950/40 text-rose-400 border border-rose-500/20 text-[10px] font-sans">
                      {alert.anomaly_type.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-semibold font-mono text-rose-400">{alert.risk_score}</td>
                  <td className="py-3 px-3 font-semibold font-mono text-white">₹{alert.financial_loss_estimate.toLocaleString()}</td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => setAssignedModal(alert.meter_id)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors font-medium"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-blue-400" />
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
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="glass-panel p-5 max-w-md w-full border-slate-800 space-y-4 bg-slate-900 font-sans">
            <h3 className="font-semibold text-sm text-white flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-blue-400" />
              Dispatch Audit Team — <span className="font-mono">{assignedModal}</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Assign field inspector squad to perform ground-truth audit &amp; seal verification.
            </p>
            <div className="space-y-1.5 text-xs">
              <label className="text-slate-300 block font-medium">Select Field Inspector Squad:</label>
              <select className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-sans">
                <option>Squad Alpha (Delhi Central Region)</option>
                <option>Squad Bravo (Industrial Sector 4)</option>
                <option>Squad Charlie (Rapid Audit Unit)</option>
              </select>
            </div>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setAssignedModal(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-950 text-slate-400 hover:text-white text-xs font-medium border border-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={() => setAssignedModal(null)}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs"
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
