'use client';

import React, { useState } from 'react';
import { gridService } from '../../services/gridService';
import { useNotificationStore } from '../../store/notificationStore';
import { GridAlert, AnomalyType } from '../../types/alert';
import { Zap, Snowflake, Anchor, Scale, Sparkles } from 'lucide-react';

const SCENARIOS = [
  { id: 'PARTIAL_BYPASS', label: 'Partial Bypass (Meter #44822)', icon: Zap, color: 'hover:text-[var(--accent-amber)]' },
  { id: 'METER_FREEZE', label: 'Meter Freeze / Flatline', icon: Snowflake, color: 'hover:text-[var(--accent-blue)]' },
  { id: 'DIRECT_HOOKING', label: 'Direct Hooking Anomaly', icon: Anchor, color: 'hover:text-[var(--accent-rose)]' },
  { id: 'PHASE_IMBALANCE', label: 'Phase Neutral Imbalance', icon: Scale, color: 'hover:text-[var(--accent-indigo)]' },
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
      <div className="glass-panel p-2 sm:px-4 sm:py-2 border border-[var(--border-default)] rounded-full flex items-center justify-between gap-3 overflow-x-auto shadow-xl bg-[var(--bg-surface)]/90 backdrop-blur-xl">
        <div className="flex items-center gap-2 pr-2 border-r border-[var(--border-default)] shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-[var(--accent-blue)]" />
          <span className="text-xs font-sans font-medium text-[var(--text-secondary)] hidden sm:inline">Demo Simulator</span>
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
                    ? 'bg-[var(--accent-blue)] text-white border-[var(--accent-blue)] font-medium shadow-sm scale-105'
                    : `bg-[var(--bg-inset)] text-[var(--text-secondary)] border-[var(--border-default)] ${sc.color} hover:bg-[var(--bg-raised)]`
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
