import React from 'react';
import { 
  TrendingUp, 
  AlertOctagon, 
  CheckCircle2, 
  DollarSign, 
  Layers, 
  Activity,
  ArrowUpRight,
  ShieldAlert,
  Flame,
  Zap,
  Filter,
  Eye
} from 'lucide-react';
import { ClaimRecord, RiskTier } from '../types/insurance';
import { getPolicyCategoryIcon, getRiskTierIcon } from '../utils/insuranceIcons';

interface DashboardOverviewProps {
  claims: ClaimRecord[];
  onFilterRiskTier: (tier: RiskTier | 'ALL') => void;
  onFilterStatus: (status: string | 'ALL') => void;
  onSelectClaim: (claim: ClaimRecord) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  claims,
  onFilterRiskTier,
  onFilterStatus,
  onSelectClaim,
}) => {
  // Aggregate Metrics
  const totalClaims = claims.length;
  const totalExposure = claims.reduce((sum, c) => sum + (c.claimAmount || 0), 0);
  const avgRiskScore = totalClaims > 0
    ? (claims.reduce((sum, c) => sum + c.fraudRiskScore, 0) / totalClaims) * 100
    : 0;

  const criticalAndElevated = claims.filter(c => c.riskTier === 'Critical' || c.riskTier === 'Elevated');
  const criticalCount = claims.filter(c => c.riskTier === 'Critical').length;
  const elevatedCount = claims.filter(c => c.riskTier === 'Elevated').length;
  const moderateCount = claims.filter(c => c.riskTier === 'Moderate').length;
  const lowCount = claims.filter(c => c.riskTier === 'Low').length;

  const fastTrackCount = claims.filter(c => c.status === 'Fast-Track Approved' || c.status === 'Settled').length;
  const siuCount = claims.filter(c => c.status === 'Referred to SIU').length;
  const pendingCount = claims.filter(c => c.status === 'Pending Triage').length;

  // Inter-model divergence count (where XGB and RF diverge >= 12%)
  const highDivergenceCount = claims.filter(c => Math.abs((c.rfRiskScore || 0.3) - c.fraudRiskScore) >= 0.12).length;

  // Potential savings from flagged anomalous claims
  const potentialSavings = criticalAndElevated.reduce((sum, c) => sum + c.claimAmount, 0);

  // Unified Product Lines breakdown
  const categoryKeys = ['Vehicle', 'Property', 'Health', 'Life', 'Travel'];

  const policyBreakdown = categoryKeys.map(cat => {
    const typeClaims = claims.filter(c => {
      const prod = c.productCategory || (c.policyType.includes('Auto') ? 'Vehicle' : c.policyType.includes('Home') ? 'Property' : c.policyType.includes('Health') ? 'Health' : c.policyType.includes('Life') ? 'Life' : 'Travel');
      return prod.toLowerCase().includes(cat.toLowerCase());
    });
    const count = typeClaims.length;
    const amount = typeClaims.reduce((sum, c) => sum + c.claimAmount, 0);
    const avgScore = count > 0
      ? (typeClaims.reduce((sum, c) => sum + c.fraudRiskScore, 0) / count) * 100
      : 0;
    return { type: cat, count, amount, avgScore };
  });

  // Recent high-priority flagged claims for quick triage
  const priorityQueue = claims
    .filter(c => c.fraudRiskScore >= 0.65 || c.status === 'Pending Triage')
    .slice(0, 4);

  return (
    <div className="space-y-6">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Portfolio Claims */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Cohort Exposure</span>
            <div className="p-1.5 rounded-md bg-slate-800 text-slate-300">
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <div className="text-2xl font-bold font-sans text-white tracking-tight">
            ${totalExposure.toLocaleString()}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-mono">{totalClaims} total claims</span>
            <span className="text-emerald-400 flex items-center font-medium">
              100% Ingested
            </span>
          </div>
          <div className="w-full bg-slate-800 h-1 rounded-full mt-3 overflow-hidden">
            <div className="bg-indigo-500 h-full rounded-full" style={{ width: '100%' }} />
          </div>
        </div>

        {/* Card 2: High Risk & Anomaly Flag Rate */}
        <div 
          onClick={() => onFilterRiskTier('Critical')}
          className="bg-slate-900 border border-rose-900/40 hover:border-rose-700/60 transition cursor-pointer rounded-xl p-4 shadow-sm group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-rose-400">High Risk & Anomalies</span>
            <div className="p-1.5 rounded-md bg-rose-950/80 text-rose-400 border border-rose-900/60">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-sans text-rose-300 tracking-tight flex items-baseline gap-2">
            {criticalAndElevated.length}
            <span className="text-sm font-normal text-rose-400/80 font-mono">
              ({totalClaims > 0 ? ((criticalAndElevated.length / totalClaims) * 100).toFixed(1) : 0}%)
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-mono">{criticalCount} Critical · {elevatedCount} Elevated</span>
            <span className="text-rose-400 flex items-center group-hover:translate-x-0.5 transition-transform">
              Filter <ArrowUpRight className="w-3 h-3 ml-0.5" />
            </span>
          </div>
          <div className="w-full bg-slate-800 h-1 rounded-full mt-3 overflow-hidden">
            <div 
              className="bg-rose-500 h-full rounded-full" 
              style={{ width: `${totalClaims > 0 ? (criticalAndElevated.length / totalClaims) * 100 : 0}%` }} 
            />
          </div>
        </div>

        {/* Card 3: Fast-Track Auto-Adjudication Rate */}
        <div 
          onClick={() => onFilterStatus('Fast-Track Approved')}
          className="bg-slate-900 border border-emerald-900/40 hover:border-emerald-700/60 transition cursor-pointer rounded-xl p-4 shadow-sm group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-emerald-400">Fast-Track Payouts</span>
            <div className="p-1.5 rounded-md bg-emerald-950/80 text-emerald-400 border border-emerald-900/60">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-sans text-emerald-300 tracking-tight flex items-baseline gap-2">
            {fastTrackCount}
            <span className="text-sm font-normal text-emerald-400/80 font-mono">
              ({totalClaims > 0 ? ((fastTrackCount / totalClaims) * 100).toFixed(1) : 0}%)
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-mono">SLA &lt; 24h digital approval</span>
            <span className="text-emerald-400 flex items-center group-hover:translate-x-0.5 transition-transform">
              Filter <ArrowUpRight className="w-3 h-3 ml-0.5" />
            </span>
          </div>
          <div className="w-full bg-slate-800 h-1 rounded-full mt-3 overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full" 
              style={{ width: `${totalClaims > 0 ? (fastTrackCount / totalClaims) * 100 : 0}%` }} 
            />
          </div>
        </div>

        {/* Card 4: Model Divergence Hotspots */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-amber-400">Divergent Cohorts</span>
            <div className="p-1.5 rounded-md bg-amber-950/80 text-amber-400 border border-amber-900/60">
              <Flame className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          <div className="text-2xl font-bold font-sans text-amber-300 tracking-tight">
            {highDivergenceCount} Claims
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-mono">|XGB - RF| ≥ 12% Gap</span>
            <span className="text-indigo-400 font-mono font-medium">Dual Audited</span>
          </div>
          <div className="w-full bg-slate-800 h-1 rounded-full mt-3 overflow-hidden">
            <div 
              className="bg-amber-500 h-full rounded-full" 
              style={{ width: `${totalClaims > 0 ? (highDivergenceCount / totalClaims) * 100 : 0}%` }} 
            />
          </div>
        </div>
      </div>

      {/* Analytics Breakdown: Risk Distribution & Line of Business Exposure */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Distribution Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white tracking-tight">Risk Tier Distribution</h3>
              <p className="text-xs text-slate-400 mt-0.5">XGBoost calibrated risk score tiers</p>
            </div>
            <Activity className="w-4 h-4 text-indigo-400" />
          </div>

          <div className="space-y-3.5">
            {/* Critical */}
            <div 
              onClick={() => onFilterRiskTier('Critical')}
              className="group cursor-pointer p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 hover:border-rose-700/60 transition"
            >
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-medium text-rose-400 flex items-center gap-1.5">
                  {getRiskTierIcon('Critical', { className: 'w-3.5 h-3.5 text-rose-400' })}
                  Critical (≥ 0.82)
                </span>
                <span className="font-mono text-slate-300 font-semibold">{criticalCount} claims</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-rose-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${totalClaims > 0 ? (criticalCount / totalClaims) * 100 : 0}%` }}
                />
              </div>
              <div className="flex justify-between items-center mt-1 text-[11px] text-slate-400">
                <span>Immediate SIU escalation & freeze</span>
                <span className="font-mono">{totalClaims > 0 ? ((criticalCount / totalClaims) * 100).toFixed(0) : 0}%</span>
              </div>
            </div>

            {/* Elevated */}
            <div 
              onClick={() => onFilterRiskTier('Elevated')}
              className="group cursor-pointer p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 hover:border-amber-700/60 transition"
            >
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-medium text-amber-400 flex items-center gap-1.5">
                  {getRiskTierIcon('Elevated', { className: 'w-3.5 h-3.5 text-amber-400' })}
                  Elevated (0.65 - 0.81)
                </span>
                <span className="font-mono text-slate-300 font-semibold">{elevatedCount} claims</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-amber-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${totalClaims > 0 ? (elevatedCount / totalClaims) * 100 : 0}%` }}
                />
              </div>
              <div className="flex justify-between items-center mt-1 text-[11px] text-slate-400">
                <span>Senior manual adjuster audit required</span>
                <span className="font-mono">{totalClaims > 0 ? ((elevatedCount / totalClaims) * 100).toFixed(0) : 0}%</span>
              </div>
            </div>

            {/* Moderate */}
            <div 
              onClick={() => onFilterRiskTier('Moderate')}
              className="group cursor-pointer p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 hover:border-blue-700/60 transition"
            >
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-medium text-blue-400 flex items-center gap-1.5">
                  {getRiskTierIcon('Moderate', { className: 'w-3.5 h-3.5 text-blue-400' })}
                  Moderate (0.30 - 0.64)
                </span>
                <span className="font-mono text-slate-300 font-semibold">{moderateCount} claims</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${totalClaims > 0 ? (moderateCount / totalClaims) * 100 : 0}%` }}
                />
              </div>
              <div className="flex justify-between items-center mt-1 text-[11px] text-slate-400">
                <span>Standard verification workflow</span>
                <span className="font-mono">{totalClaims > 0 ? ((moderateCount / totalClaims) * 100).toFixed(0) : 0}%</span>
              </div>
            </div>

            {/* Low */}
            <div 
              onClick={() => onFilterRiskTier('Low')}
              className="group cursor-pointer p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 hover:border-emerald-700/60 transition"
            >
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-medium text-emerald-400 flex items-center gap-1.5">
                  {getRiskTierIcon('Low', { className: 'w-3.5 h-3.5 text-emerald-400' })}
                  Low Risk (&lt; 0.30)
                </span>
                <span className="font-mono text-slate-300 font-semibold">{lowCount} claims</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${totalClaims > 0 ? (lowCount / totalClaims) * 100 : 0}%` }}
                />
              </div>
              <div className="flex justify-between items-center mt-1 text-[11px] text-slate-400">
                <span>Eligible for straight-through approval</span>
                <span className="font-mono">{totalClaims > 0 ? ((lowCount / totalClaims) * 100).toFixed(0) : 0}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Line of Business Exposure Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white tracking-tight">Risk Distribution by Line of Business</h3>
              <p className="text-xs text-slate-400 mt-0.5">Exposure volume and average fraud probability</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-mono bg-indigo-950/60 px-2.5 py-1 rounded-md border border-indigo-900/60">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>ROC-AUC: 0.892</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-mono text-[11px]">
                  <th className="pb-2.5 font-medium">Line of Business</th>
                  <th className="pb-2.5 font-medium text-right">Volume</th>
                  <th className="pb-2.5 font-medium text-right">Total Exposure</th>
                  <th className="pb-2.5 font-medium text-center">Avg Risk Index</th>
                  <th className="pb-2.5 font-medium text-right">Distribution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {policyBreakdown.map((row) => {
                  const maxExposure = Math.max(...policyBreakdown.map(p => p.amount), 1);
                  const barWidth = Math.round((row.amount / maxExposure) * 100);
                  
                  return (
                    <tr key={row.type} className="hover:bg-slate-800/40 transition">
                      <td className="py-2.5 font-medium text-slate-200 flex items-center gap-2">
                        {getPolicyCategoryIcon(row.type, { className: 'w-3.5 h-3.5 text-indigo-400' })}
                        <span>{row.type}</span>
                      </td>
                      <td className="py-2.5 text-right font-mono text-slate-300">
                        {row.count} claims
                      </td>
                      <td className="py-2.5 text-right font-mono font-medium text-white">
                        ${row.amount.toLocaleString()}
                      </td>
                      <td className="py-2.5 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-mono font-medium ${
                          row.avgScore >= 60 
                            ? 'bg-rose-950/80 text-rose-300 border border-rose-800/50' 
                            : row.avgScore >= 35 
                            ? 'bg-amber-950/80 text-amber-300 border border-amber-800/50'
                            : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/50'
                        }`}>
                          {row.avgScore.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-2.5 text-right w-36">
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden inline-block align-middle">
                          <div 
                            className="bg-indigo-500 h-full rounded-full" 
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Quick Filter Buttons */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-slate-400 font-medium">Quick Triage Queues:</span>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => onFilterRiskTier('Critical')}
                className="px-2.5 py-1 rounded-md bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 transition text-xs font-mono cursor-pointer flex items-center gap-1"
              >
                {getRiskTierIcon('Critical', { className: 'w-3 h-3 text-rose-400' })}
                <span>Critical Risk ({criticalCount})</span>
              </button>
              <button
                onClick={() => onFilterStatus('Referred to SIU')}
                className="px-2.5 py-1 rounded-md bg-amber-950/60 hover:bg-amber-900/60 text-amber-300 border border-amber-800/60 transition text-xs font-mono cursor-pointer flex items-center gap-1"
              >
                <ShieldAlert className="w-3 h-3 text-amber-400" />
                <span>SIU Queue ({siuCount})</span>
              </button>
              <button
                onClick={() => onFilterStatus('Pending Triage')}
                className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition text-xs font-mono cursor-pointer flex items-center gap-1"
              >
                <Filter className="w-3 h-3 text-slate-400" />
                <span>Pending Triage ({pendingCount})</span>
              </button>
              <button
                onClick={() => onFilterStatus('ALL')}
                className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700 transition text-xs font-mono cursor-pointer"
              >
                View All ({totalClaims})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Priority Triage Queue Preview */}
      {priorityQueue.length > 0 && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <h4 className="text-xs font-semibold uppercase tracking-wider text-rose-300">
                Action Required: High-Risk Triage Candidates
              </h4>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Auto-flagged for human underwriting or claims investigation
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {priorityQueue.map((c) => (
              <div
                key={c.id}
                onClick={() => onSelectClaim(c)}
                className="p-3 rounded-lg bg-slate-950 border border-slate-800 hover:border-indigo-600/80 transition cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-mono font-medium text-white group-hover:text-indigo-300 transition flex items-center gap-1.5">
                      {getPolicyCategoryIcon(c.productCategory || c.policyType, { className: 'w-3.5 h-3.5 text-indigo-400' })}
                      {c.claimNumber}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                      c.riskTier === 'Critical' 
                        ? 'bg-rose-950 text-rose-300 border border-rose-800/80' 
                        : 'bg-amber-950 text-amber-300 border border-amber-800/80'
                    }`}>
                      {(c.fraudRiskScore * 100).toFixed(0)}% Risk
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-medium truncate">{c.policyHolderName}</p>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {c.anomalyFlags && c.anomalyFlags[0] ? c.anomalyFlags[0] : c.description}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs">
                  <span className="font-mono text-white font-medium">
                    ${c.claimAmount.toLocaleString()}
                  </span>
                  <span className="text-[11px] text-indigo-400 group-hover:underline flex items-center">
                    Review Case <ArrowUpRight className="w-3 h-3 ml-0.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
