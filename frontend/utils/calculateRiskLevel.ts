export type RiskLevel = 'NOMINAL' | 'WARNING' | 'HIGH_RISK' | 'CRITICAL';

export function calculateRiskLevel(riskScore: number): {
  level: RiskLevel;
  label: string;
  badgeClass: string;
  colorHex: string;
} {
  const score = riskScore ?? 0;
  if (score >= 0.85) {
    return {
      level: 'CRITICAL',
      label: 'CRITICAL THEFT',
      badgeClass: 'bg-red-500/20 text-red-400 border border-red-500/40 glow-crimson-border',
      colorHex: '#FF2A5F',
    };
  }
  if (score >= 0.65) {
    return {
      level: 'HIGH_RISK',
      label: 'HIGH RISK',
      badgeClass: 'bg-orange-500/20 text-orange-400 border border-orange-500/40',
      colorHex: '#FFB800',
    };
  }
  if (score >= 0.35) {
    return {
      level: 'WARNING',
      label: 'ELEVATED NTL',
      badgeClass: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40',
      colorHex: '#FFB800',
    };
  }
  return {
    level: 'NOMINAL',
    label: 'NOMINAL',
    badgeClass: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 glow-emerald-border',
    colorHex: '#00E676',
  };
}
