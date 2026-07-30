'use client';

import React, { useState } from 'react';
import { gridService } from '../../services/gridService';
import { useNotificationStore } from '../../store/notificationStore';
import { GridAlert, AnomalyType } from '../../types/alert';
import { Zap, Snowflake, Anchor, Scale, Sparkles } from 'lucide-react';

const SCENARIOS = [
  { id: 'PARTIAL_BYPASS', label: 'Partial Bypass (Meter #44822)', icon: Zap, color: 'hover:text-amber-400 border-slate-800' },
  { id: 'METER_FREEZE', label: 'Meter Freeze / Flatline', icon: Snowflake, color: 'hover:text-blue-400 border-slate-800' },
  { id: 'DIRECT_HOOKING', label: 'Direct Hooking Anomaly', icon: Anchor, color: 'hover:text-rose-400 border-slate-800' },
  { id: 'PHASE_IMBALANCE', label: 'Phase Neutral Imbalance', icon: Scale, color: 'hover:text-indigo-400 border-slate-800' },
];

export const SimulationBar: React.FC = () => {
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const handleTriggerScenario = async (scenarioId: string) => {
    setIsSimulating(true);
    setActiveScenario(scenarioId);
    try {
      await gridService.simulateTheftScenario(scenarioId, 'MTR-44822');

      const simulatedAlert: GridAlert = {
        alert_id: `alt-sim-${Date.now()}`,
        meter_id: 'MTR-44822',
        consumer_name: 'Apex Industrial Complex',
        transformer_id: 'TR-102',
        feeder_id: 'FDR-04',
        substation_id: 'SUB-01',
        severity: 'CRITICAL',
        anomaly_type: scenarioId as AnomalyType,
        risk_score: 0.96,
        financial_loss_estimate: scenarioId === 'DIRECT_HOOKING' ? 120000 : 95000,
        message: `Simulation trigger: ${scenarioId.replace(/_/g, ' ')} detected on Meter #44822.`,
        timestamp: new Date().toISOString(),
        is_acknowledged: false,
      };

      useNotificationStore.getState().addAlert(simulatedAlert);
    } catch {
      const fallbackAlert: GridAlert = {
        alert_id: `alt-sim-${Date.now()}`,
        meter_id: 'MTR-44822',
        consumer_name: 'Apex Industrial Complex',
        transformer_id: 'TR-102',
        feeder_id: 'FDR-04',
        substation_id: 'SUB-01',
        severity: 'CRITICAL',
        anomaly_type: scenarioId as AnomalyType,
        risk_score: 0.96,
        financial_loss_estimate: 95000,
        message: `Simulation trigger: ${scenarioId.replace(/_/g, ' ')} detected on Meter #44822.`,
        timestamp: new Date().toISOString(),
        is_acknowledged: false,
      };
      useNotificationStore.getState().addAlert(fallbackAlert);
    } finally {
      setTimeout(() => {
        setIsSimulating(false);
        setActiveScenario(null);
      }, 1200);
    }
  };

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 max-w-4xl w-[92%] sm:w-auto font-sans">
      <div className="glass-panel p-2 sm:px-4 sm:py-2 border border-slate-800 rounded-full flex items-center justify-between gap-3 overflow-x-auto shadow-xl bg-slate-900/90 backdrop-blur-xl">
        <div className="flex items-center gap-2 pr-2 border-r border-slate-800 shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-xs font-sans font-medium text-slate-300 hidden sm:inline">Demo Simulator</span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          {SCENARIOS.map((sc) => {
            const Icon = sc.icon;
            const isSelected = activeScenario === sc.id;
            return (
              <button
                key={sc.id}
                onClick={() => handleTriggerScenario(sc.id)}
                disabled={isSimulating}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all shrink-0 ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-500 font-medium shadow-sm scale-105'
                    : `bg-slate-950/60 text-slate-300 ${sc.color} hover:bg-slate-800`
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{sc.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
