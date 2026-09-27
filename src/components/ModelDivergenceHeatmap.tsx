import React, { useState, useMemo } from 'react';
import { 
  Flame, 
  AlertTriangle, 
  Info, 
  CheckCircle2, 
  ArrowRight, 
  ExternalLink, 
  ShieldAlert, 
  Sparkles, 
  Filter, 
  Layers, 
  FileSpreadsheet, 
  Download, 
  Eye, 
  SlidersHorizontal,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  Cpu,
  Trees,
  CheckCheck
} from 'lucide-react';
import { ClaimRecord, RiskTier } from '../types/insurance';
import { 
  getPolicyCategoryIcon, 
  getClaimTypeIcon, 
  getSeverityIcon, 
  getRegionIcon, 
  getChannelIcon,
  getRiskTierIcon
} from '../utils/insuranceIcons';

interface ModelDivergenceHeatmapProps {
  claims: ClaimRecord[];
  onSelectClaim?: (claim: ClaimRecord) => void;
}

type MatrixRowDimension = 'category' | 'region';
type MatrixColDimension = 'claimType' | 'severity' | 'tenure' | 'channel';
type DivergenceMetric = 'meanDelta' | 'disagreementRate' | 'divergentCount' | 'maxDelta';

interface HeatmapCellData {
  rowKey: string;
  rowLabel: string;
  colKey: string;
  colLabel: string;
  claims: ClaimRecord[];
  count: number;
  avgXgb: number;
  avgRf: number;
  meanDelta: number; // |avgRf - avgXgb| in %
  signedDelta: number; // (avgRf - avgXgb) in %
  maxDelta: number; // max |rf - xgb| in %
  disagreementRate: number; // % claims with different risk tier
  divergentCount: number; // claims with |delta| >= 12%
  riskCategory: 'low' | 'moderate' | 'high' | 'critical';
  topDivergentClaim: ClaimRecord | null;
  actuarialDriver: string;
}

export const ModelDivergenceHeatmap: React.FC<ModelDivergenceHeatmapProps> = ({
  claims,
  onSelectClaim,
}) => {
  const [rowDimension, setRowDimension] = useState<MatrixRowDimension>('category');
  const [colDimension, setColDimension] = useState<MatrixColDimension>('claimType');
  const [activeMetric, setActiveMetric] = useState<DivergenceMetric>('meanDelta');
  const [selectedCell, setSelectedCell] = useState<HeatmapCellData | null>(null);
  const [minClaimsFilter, setMinClaimsFilter] = useState<number>(1);
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [isExported, setIsExported] = useState(false);

  // Define row keys & labels
  const rowDefinitions = useMemo(() => {
    if (rowDimension === 'category') {
      return [
        { key: 'Vehicle', label: 'Vehicle / Auto', icon: getPolicyCategoryIcon('Vehicle', { className: 'w-4 h-4 text-sky-400' }) },
        { key: 'Property', label: 'Property & Casualty', icon: getPolicyCategoryIcon('Property', { className: 'w-4 h-4 text-emerald-400' }) },
        { key: 'Health', label: 'Health & Medical', icon: getPolicyCategoryIcon('Health', { className: 'w-4 h-4 text-rose-400' }) },
        { key: 'Life', label: 'Life & Disability', icon: getPolicyCategoryIcon('Life', { className: 'w-4 h-4 text-indigo-400' }) },
        { key: 'Travel', label: 'Travel & Cargo', icon: getPolicyCategoryIcon('Travel', { className: 'w-4 h-4 text-amber-400' }) },
      ];
    } else {
      return [
        { key: 'North', label: 'North Region', icon: getRegionIcon('North', { className: 'w-4 h-4 text-blue-400' }) },
        { key: 'South', label: 'South Region', icon: getRegionIcon('South', { className: 'w-4 h-4 text-amber-400' }) },
        { key: 'East', label: 'East Region', icon: getRegionIcon('East', { className: 'w-4 h-4 text-teal-400' }) },
        { key: 'West', label: 'West Region', icon: getRegionIcon('West', { className: 'w-4 h-4 text-indigo-400' }) },
        { key: 'Central', label: 'Central Region', icon: getRegionIcon('Central', { className: 'w-4 h-4 text-purple-400' }) },
      ];
    }
  }, [rowDimension]);

  // Define column keys & labels
  const colDefinitions = useMemo(() => {
    if (colDimension === 'claimType') {
      return [
        { key: 'Collision Impact', label: 'Collision Impact', icon: getClaimTypeIcon('Collision Impact', { className: 'w-3.5 h-3.5 text-sky-400' }) },
        { key: 'Hit and Run', label: 'Hit & Run', icon: getClaimTypeIcon('Hit and Run', { className: 'w-3.5 h-3.5 text-rose-400' }) },
        { key: 'Water Damage', label: 'Water / Plumbing', icon: getClaimTypeIcon('Water Damage', { className: 'w-3.5 h-3.5 text-cyan-400' }) },
        { key: 'Storm / Wind', label: 'Storm & Microburst', icon: getClaimTypeIcon('Storm', { className: 'w-3.5 h-3.5 text-amber-400' }) },
        { key: 'Fire / Arson', label: 'Fire & Arson', icon: getClaimTypeIcon('Fire', { className: 'w-3.5 h-3.5 text-orange-400' }) },
        { key: 'Accidental Injury', label: 'Injury / Casualty', icon: getClaimTypeIcon('Injury', { className: 'w-3.5 h-3.5 text-emerald-400' }) },
        { key: 'Theft / Burglary', label: 'Theft & Burglary', icon: getClaimTypeIcon('Theft', { className: 'w-3.5 h-3.5 text-purple-400' }) },
        { key: 'Hospital Inpatient', label: 'Inpatient / Surgery', icon: getClaimTypeIcon('Hospital', { className: 'w-3.5 h-3.5 text-pink-400' }) },
      ];
    } else if (colDimension === 'severity') {
      return [
        { key: 'Minor', label: 'Minor (< $5K)', icon: getSeverityIcon('Minor', { className: 'w-3.5 h-3.5 text-emerald-400' }) },
        { key: 'Moderate', label: 'Moderate ($5K-$25K)', icon: getSeverityIcon('Moderate', { className: 'w-3.5 h-3.5 text-sky-400' }) },
        { key: 'Major', label: 'Major ($25K-$75K)', icon: getSeverityIcon('Major', { className: 'w-3.5 h-3.5 text-amber-400' }) },
        { key: 'Catastrophic', label: 'Catastrophic (> $75K)', icon: getSeverityIcon('Catastrophic', { className: 'w-3.5 h-3.5 text-rose-400' }) },
      ];
    } else if (colDimension === 'tenure') {
      return [
        { key: 'Early (< 3 mos)', label: 'Early (<= 3 mos)', icon: <Layers className="w-3.5 h-3.5 text-rose-400" /> },
        { key: 'Year 1 (4-12 mos)', label: 'Year 1 (4-12 mos)', icon: <Layers className="w-3.5 h-3.5 text-amber-400" /> },
        { key: 'Established (1-3 yrs)', label: 'Established (1-3 yrs)', icon: <Layers className="w-3.5 h-3.5 text-blue-400" /> },
        { key: 'Mature (> 3 yrs)', label: 'Mature (> 3 yrs)', icon: <Layers className="w-3.5 h-3.5 text-emerald-400" /> },
      ];
    } else {
      return [
        { key: 'Online', label: 'Online Portal', icon: getChannelIcon('Online', { className: 'w-3.5 h-3.5 text-indigo-400' }) },
        { key: 'Agent', label: 'Dedicated Agent', icon: getChannelIcon('Agent', { className: 'w-3.5 h-3.5 text-sky-400' }) },
        { key: 'Branch', label: 'Physical Branch', icon: getChannelIcon('Branch', { className: 'w-3.5 h-3.5 text-emerald-400' }) },
        { key: 'Call Center', label: 'Call Center / Phone', icon: getChannelIcon('Call Center', { className: 'w-3.5 h-3.5 text-amber-400' }) },
      ];
    }
  }, [colDimension]);

  // Compute 2D Matrix Data
  const matrixData = useMemo(() => {
    const cells: Record<string, HeatmapCellData> = {};

    rowDefinitions.forEach((row) => {
      colDefinitions.forEach((col) => {
        const key = `${row.key}__${col.key}`;

        // Match claims
        const matchingClaims = claims.filter((c) => {
          // Row check
          let rowMatch = false;
          if (rowDimension === 'category') {
            const prod = c.productCategory || (c.policyType.includes('Auto') ? 'Vehicle' : c.policyType.includes('Home') ? 'Property' : c.policyType.includes('Health') ? 'Health' : c.policyType.includes('Life') ? 'Life' : 'Travel');
            rowMatch = prod.toLowerCase().includes(row.key.toLowerCase());
          } else {
            rowMatch = (c.region || 'North').toLowerCase() === row.key.toLowerCase();
          }

          if (!rowMatch) return false;

          // Col check
          if (colDimension === 'claimType') {
            const inc = (c.incidentCategory || c.description || '').toLowerCase();
            const colK = col.key.toLowerCase();
            if (colK.includes('collision')) return inc.includes('collision') || inc.includes('accident') || inc.includes('impact') || inc.includes('scrape');
            if (colK.includes('hit and run')) return inc.includes('hit') || inc.includes('run') || inc.includes('fled');
            if (colK.includes('water')) return inc.includes('water') || inc.includes('plumb') || inc.includes('pipe') || inc.includes('leak');
            if (colK.includes('storm')) return inc.includes('storm') || inc.includes('microburst') || inc.includes('wind') || inc.includes('hail') || inc.includes('lightning');
            if (colK.includes('fire')) return inc.includes('fire') || inc.includes('arson') || inc.includes('smoke');
            if (colK.includes('injury')) return inc.includes('injury') || inc.includes('contusion') || inc.includes('slip') || inc.includes('fall');
            if (colK.includes('theft')) return inc.includes('theft') || inc.includes('burglar') || inc.includes('stolen');
            if (colK.includes('inpatient')) return inc.includes('hospital') || inc.includes('surgery') || inc.includes('append') || inc.includes('medical');
            return true;
          } else if (colDimension === 'severity') {
            const sev = c.severityCategory || (c.claimAmount > 30000 ? 'Major' : c.claimAmount > 10000 ? 'Moderate' : 'Minor');
            return sev.toLowerCase().includes(col.key.toLowerCase());
          } else if (colDimension === 'tenure') {
            if (col.key.includes('Early')) return c.policyAgeMonths <= 3;
            if (col.key.includes('Year 1')) return c.policyAgeMonths > 3 && c.policyAgeMonths <= 12;
            if (col.key.includes('Established')) return c.policyAgeMonths > 12 && c.policyAgeMonths <= 36;
            return c.policyAgeMonths > 36;
          } else {
            return (c.submissionChannel || 'Online').toLowerCase() === col.key.toLowerCase();
          }
        });

        const count = matchingClaims.length;
        let avgXgb = 0;
        let avgRf = 0;
        let meanDelta = 0;
        let signedDelta = 0;
        let maxDelta = 0;
        let disagreementCount = 0;
        let divergentCount = 0;
        let topClaim: ClaimRecord | null = null;
        let maxSingleDelta = -1;

        if (count > 0) {
          let sumXgb = 0;
          let sumRf = 0;
          let sumAbsDelta = 0;

          matchingClaims.forEach((c) => {
            const rf = c.rfRiskScore !== undefined ? c.rfRiskScore : 0.30;
            const xgb = c.fraudRiskScore;
            const delta = Math.abs(rf - xgb);

            sumXgb += xgb;
            sumRf += rf;
            sumAbsDelta += delta;

            if (delta > maxSingleDelta) {
              maxSingleDelta = delta;
              topClaim = c;
            }

            if (delta >= 0.12) {
              divergentCount++;
            }

            if (c.riskTier !== (c.rfRiskTier || 'Low')) {
              disagreementCount++;
            }
          });

          avgXgb = Number(((sumXgb / count) * 100).toFixed(1));
          avgRf = Number(((sumRf / count) * 100).toFixed(1));
          meanDelta = Number(((sumAbsDelta / count) * 100).toFixed(1));
          signedDelta = Number((avgRf - avgXgb).toFixed(1));
          maxDelta = Number((maxSingleDelta * 100).toFixed(1));
        }

        const disagreementRate = count > 0 ? Number(((disagreementCount / count) * 100).toFixed(1)) : 0;

        let riskCategory: HeatmapCellData['riskCategory'] = 'low';
        if (meanDelta >= 20 || disagreementRate >= 35 || maxDelta >= 28) {
          riskCategory = 'critical';
        } else if (meanDelta >= 14 || disagreementRate >= 25 || maxDelta >= 20) {
          riskCategory = 'high';
        } else if (meanDelta >= 8 || disagreementRate >= 15) {
          riskCategory = 'moderate';
        }

        // Generate Domain Actuarial Root Cause Driver
        let actuarialDriver = 'Symmetric model convergence; tree ensembles split similarly across core risk vectors.';
        if (riskCategory === 'critical' || riskCategory === 'high') {
          if (row.key === 'Vehicle' || col.key.includes('Hit') || col.key.includes('Collision')) {
            actuarialDriver = 'XGBoost applies acute non-linear penalties to high reporting lag (>14 days) and absent police reports, whereas Random Forest feature bagging averages out missing documentation over randomized subsamples.';
          } else if (row.key === 'Property' || col.key.includes('Water') || col.key.includes('Fire')) {
            actuarialDriver = 'Random Forest places high Gini importance on documentation completeness flags, elevating risk on uncorroborated contractor quotes; XGBoost prioritizes policy inception latency.';
          } else if (col.key.includes('Early') || (colDimension === 'tenure' && col.key.includes('Early'))) {
            actuarialDriver = 'Gradient boosting tree residuals trigger steep non-linear penalties for early inception tenure (< 45 days), scoring 20-30% higher than Random Forest.';
          } else if (col.key.includes('Catastrophic') || col.key.includes('Major')) {
            actuarialDriver = 'High loss-to-income interaction triggers compound leaf nodes in XGBoost depth-5 trees, whereas Random Forest dampens outlier variance.';
          } else {
            actuarialDriver = 'Disparate feature interaction weighting between boosted residual optimization vs bagged feature randomization.';
          }
        }

        cells[key] = {
          rowKey: row.key,
          rowLabel: row.label,
          colKey: col.key,
          colLabel: col.label,
          claims: matchingClaims,
          count,
          avgXgb,
          avgRf,
          meanDelta,
          signedDelta,
          maxDelta,
          disagreementRate,
          divergentCount,
          riskCategory,
          topDivergentClaim: topClaim,
          actuarialDriver,
        };
      });
    });

    return cells;
  }, [claims, rowDefinitions, colDefinitions, rowDimension, colDimension]);

  // Find Top 3 Disagreement Hotspots across the whole portfolio
  const topHotspots = useMemo(() => {
    return Object.values(matrixData)
      .filter((c) => c.count >= minClaimsFilter)
      .sort((a, b) => {
        if (activeMetric === 'disagreementRate') return b.disagreementRate - a.disagreementRate;
        if (activeMetric === 'divergentCount') return b.divergentCount - a.divergentCount;
        if (activeMetric === 'maxDelta') return b.maxDelta - a.maxDelta;
        return b.meanDelta - a.meanDelta;
      })
      .slice(0, 3);
  }, [matrixData, minClaimsFilter, activeMetric]);

  // Cell Style Generator based on active metric
  const getCellStyle = (cell: HeatmapCellData) => {
    if (cell.count === 0) {
      return {
        bg: 'bg-slate-900/30 text-slate-600 border-slate-800/40 hover:bg-slate-900/50',
        badge: 'text-slate-600',
        accent: 'border-transparent',
      };
    }

    let metricVal = cell.meanDelta;
    if (activeMetric === 'disagreementRate') metricVal = cell.disagreementRate;
    if (activeMetric === 'divergentCount') metricVal = cell.divergentCount * 7;
    if (activeMetric === 'maxDelta') metricVal = cell.maxDelta;

    if (metricVal >= 22 || cell.riskCategory === 'critical') {
      return {
        bg: 'bg-rose-950/85 hover:bg-rose-900/90 text-rose-100 border-rose-700/80 shadow-sm ring-1 ring-rose-500/40 cursor-pointer',
        badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
        accent: 'border-rose-500',
        indicator: 'bg-rose-500 animate-pulse',
      };
    } else if (metricVal >= 14 || cell.riskCategory === 'high') {
      return {
        bg: 'bg-orange-950/70 hover:bg-orange-900/80 text-orange-100 border-orange-800/70 cursor-pointer',
        badge: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
        accent: 'border-orange-500',
        indicator: 'bg-orange-400',
      };
    } else if (metricVal >= 8 || cell.riskCategory === 'moderate') {
      return {
        bg: 'bg-amber-950/50 hover:bg-amber-900/60 text-amber-100 border-amber-800/60 cursor-pointer',
        badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        accent: 'border-amber-500',
        indicator: 'bg-amber-400',
      };
    } else {
      return {
        bg: 'bg-slate-900 hover:bg-slate-850 text-slate-200 border-slate-800/80 cursor-pointer',
        badge: 'bg-slate-800 text-slate-400 border-slate-700',
        accent: 'border-emerald-500',
        indicator: 'bg-emerald-400',
      };
    }
  };

  const handleExportCSV = () => {
    setIsExported(true);
    const headers = ['Cohort Row', 'Cohort Column', 'Claim Count', 'Avg XGBoost Risk (%)', 'Avg Random Forest Risk (%)', 'Mean Delta (%)', 'Max Outlier Delta (%)', 'Disagreement Rate (%)', 'Primary Actuarial Driver'];
    const rows = Object.values(matrixData).map((c) => [
      `"${c.rowLabel}"`,
      `"${c.colLabel}"`,
      c.count,
      c.avgXgb,
      c.avgRf,
      c.meanDelta,
      c.maxDelta,
      c.disagreementRate,
      `"${c.actuarialDriver.replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AegisClaim_Cohort_Divergence_Heatmap_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => setIsExported(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls & Explanation Bar */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-rose-950/80 text-rose-400 border border-rose-800/60">
                <Flame className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Dual-Model Risk Divergence Heatmap (XGBoost vs Shadow Random Forest)
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                Matrix Engine
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Pinpoints systemic blindspots, actuarial edge cases, and underwriting discrepancies where the Champion 
              <strong> XGBoost v2.4.1</strong> and Challenger <strong>Random Forest v2.3.0</strong> models arrive at conflicting loss predictions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Export heatmap cohort matrix as CSV"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span>{isExported ? 'Exported CSV!' : 'Export Matrix CSV'}</span>
            </button>
          </div>
        </div>

        {/* Matrix Dimension & Metric Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-900">
          {/* Row Dimension */}
          <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 space-y-1">
            <label className="text-[10px] uppercase font-mono text-slate-400 font-semibold block flex items-center gap-1.5">
              <Layers className="w-3 h-3 text-sky-400" />
              <span>Y-Axis (Rows)</span>
            </label>
            <div className="flex rounded-md bg-slate-950 p-0.5 border border-slate-800 text-xs">
              <button
                onClick={() => { setRowDimension('category'); setSelectedCell(null); }}
                className={`flex-1 py-1 px-2 rounded text-xs font-medium transition cursor-pointer flex items-center justify-center gap-1 ${
                  rowDimension === 'category' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                {getPolicyCategoryIcon('Vehicle', { className: 'w-3 h-3' })}
                <span>Policy Lines</span>
              </button>
              <button
                onClick={() => { setRowDimension('region'); setSelectedCell(null); }}
                className={`flex-1 py-1 px-2 rounded text-xs font-medium transition cursor-pointer flex items-center justify-center gap-1 ${
                  rowDimension === 'region' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                {getRegionIcon('Central', { className: 'w-3 h-3' })}
                <span>Geographic Regions</span>
              </button>
            </div>
          </div>

          {/* Col Dimension */}
          <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 space-y-1">
            <label className="text-[10px] uppercase font-mono text-slate-400 font-semibold block flex items-center gap-1.5">
              <FileSpreadsheet className="w-3 h-3 text-emerald-400" />
              <span>X-Axis (Columns)</span>
            </label>
            <select
              value={colDimension}
              onChange={(e) => { setColDimension(e.target.value as MatrixColDimension); setSelectedCell(null); }}
              className="w-full bg-slate-950 text-xs text-white rounded-md py-1 px-2 border border-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer font-medium"
            >
              <option value="claimType">Claim / Loss Event Type</option>
              <option value="severity">Claim Severity Tier (Loss Size)</option>
              <option value="tenure">Policy Tenure Inception Brackets</option>
              <option value="channel">Submission Ingestion Channel</option>
            </select>
          </div>

          {/* Metric Selector */}
          <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 space-y-1">
            <label className="text-[10px] uppercase font-mono text-slate-400 font-semibold block flex items-center gap-1.5">
              <SlidersHorizontal className="w-3 h-3 text-amber-400" />
              <span>Cell Heatmap Metric</span>
            </label>
            <select
              value={activeMetric}
              onChange={(e) => setActiveMetric(e.target.value as DivergenceMetric)}
              className="w-full bg-slate-950 text-xs text-white rounded-md py-1 px-2 border border-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer font-medium"
            >
              <option value="meanDelta">Mean Absolute Delta (|XGB - RF| %)</option>
              <option value="disagreementRate">Risk Tier Disagreement Rate (%)</option>
              <option value="divergentCount">Divergent Claims Count (|Δ| ≥ 12%)</option>
              <option value="maxDelta">Maximum Single Outlier Gap (Max |Δ| %)</option>
            </select>
          </div>

          {/* Color Scale Legend */}
          <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 flex flex-col justify-between">
            <span className="text-[10px] uppercase font-mono text-slate-400 font-semibold block">
              Divergence Severity Ramp
            </span>
            <div className="flex items-center gap-1 text-[10px] font-mono mt-1">
              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">Low &lt;8%</span>
              <span className="px-1.5 py-0.5 rounded bg-amber-950/70 text-amber-300 border border-amber-800/60">8-14%</span>
              <span className="px-1.5 py-0.5 rounded bg-orange-950/80 text-orange-300 border border-orange-800/70">14-22%</span>
              <span className="px-1.5 py-0.5 rounded bg-rose-950 text-rose-200 border border-rose-700 font-bold">Hotspot ≥22%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top 3 Divergence Hotspots Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-mono text-slate-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Highest Inter-Model Disagreement Hotspots (Active Cohort)</span>
          </span>
          <span className="text-[11px] font-mono text-slate-500">
            Click any card to inspect full cohort slice
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {topHotspots.map((spot, idx) => {
            const isSelected = selectedCell?.rowKey === spot.rowKey && selectedCell?.colKey === spot.colKey;

            return (
              <div
                key={`${spot.rowKey}__${spot.colKey}`}
                onClick={() => setSelectedCell(spot)}
                className={`p-3.5 rounded-xl border transition cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'bg-rose-950/60 border-rose-500 ring-2 ring-rose-500/30 shadow-lg'
                    : 'bg-slate-950 hover:bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-rose-900/60 text-rose-300 flex items-center justify-center text-xs font-mono font-bold">
                      #{idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-white text-xs">{spot.rowLabel}</span>
                        <span className="text-slate-500 text-[10px]">×</span>
                        <span className="font-semibold text-indigo-300 text-xs">{spot.colLabel}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {spot.count} {spot.count === 1 ? 'claim' : 'claims'} evaluated
                      </span>
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <span className="text-base font-bold text-rose-400 block">
                      {activeMetric === 'disagreementRate'
                        ? `${spot.disagreementRate}%`
                        : activeMetric === 'divergentCount'
                        ? `${spot.divergentCount} claims`
                        : activeMetric === 'maxDelta'
                        ? `${spot.maxDelta}%`
                        : `${spot.meanDelta}% Δ`}
                    </span>
                    <span className="text-[9px] uppercase tracking-wider text-slate-500">
                      {activeMetric === 'disagreementRate' ? 'Tier Mismatch' : 'Score Divergence'}
                    </span>
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-900 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>XGB: <strong className="text-indigo-300">{spot.avgXgb}%</strong></span>
                  <span>·</span>
                  <span>RF: <strong className="text-slate-200">{spot.avgRf}%</strong></span>
                  <span>·</span>
                  <span className={spot.signedDelta > 0 ? 'text-amber-400' : 'text-rose-400'}>
                    Gap: {spot.signedDelta > 0 ? `+${spot.signedDelta}%` : `${spot.signedDelta}%`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Interactive Heatmap Grid Container */}
      <div className="border border-slate-800 rounded-2xl bg-slate-950 overflow-hidden shadow-xl">
        <div className="p-3.5 bg-slate-900/80 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="font-semibold text-white">Cohort Divergence Matrix Grid</span>
            <span className="text-[11px] text-slate-400 font-mono">
              (Rows: {rowDefinitions.length} · Columns: {colDefinitions.length})
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
            <span>Click any cell to open claim case files & root cause analysis</span>
          </div>
        </div>

        <div className="overflow-x-auto p-4">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="p-2 text-left text-[11px] font-mono uppercase text-slate-400 tracking-wider bg-slate-900/60 rounded-tl-lg min-w-[150px] border-b border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <Filter className="w-3 h-3 text-slate-400" />
                    <span>Cohort Slice</span>
                  </div>
                </th>
                {colDefinitions.map((col) => (
                  <th
                    key={col.key}
                    className="p-2 text-center text-[11px] font-mono uppercase text-slate-300 tracking-wider bg-slate-900/60 border-b border-slate-800 min-w-[115px]"
                  >
                    <div className="flex flex-col items-center justify-center gap-1">
                      <div className="p-1 rounded bg-slate-800/80 border border-slate-700/60">
                        {col.icon}
                      </div>
                      <span className="text-[10px] text-slate-300 font-semibold">{col.label}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {rowDefinitions.map((row) => (
                <tr key={row.key} className="hover:bg-slate-900/30 transition">
                  {/* Row Header with dedicated icon */}
                  <td className="p-2.5 font-medium text-xs text-white bg-slate-900/40 border-r border-slate-800 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-slate-800 border border-slate-700">
                        {row.icon}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-100 block text-xs">{row.label}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {claims.filter(c => {
                            if (rowDimension === 'category') {
                              const prod = c.productCategory || (c.policyType.includes('Auto') ? 'Vehicle' : c.policyType.includes('Home') ? 'Property' : c.policyType.includes('Health') ? 'Health' : c.policyType.includes('Life') ? 'Life' : 'Travel');
                              return prod.toLowerCase().includes(row.key.toLowerCase());
                            }
                            return (c.region || 'North').toLowerCase() === row.key.toLowerCase();
                          }).length} claims total
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Heatmap Cells */}
                  {colDefinitions.map((col) => {
                    const cellKey = `${row.key}__${col.key}`;
                    const cell = matrixData[cellKey];
                    const isSelected = selectedCell?.rowKey === cell.rowKey && selectedCell?.colKey === cell.colKey;
                    const style = getCellStyle(cell);

                    return (
                      <td key={col.key} className="p-1.5">
                        <div
                          onClick={() => {
                            if (cell.count > 0) {
                              setSelectedCell(cell);
                            }
                          }}
                          className={`p-2.5 rounded-xl border transition-all text-center flex flex-col justify-between min-h-[78px] ${style.bg} ${
                            isSelected ? 'ring-2 ring-indigo-500 shadow-xl border-indigo-400' : ''
                          }`}
                        >
                          {cell.count === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-slate-600">
                              <span className="text-xs font-mono font-medium">-</span>
                              <span className="text-[9px] font-mono">0 claims</span>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center justify-between gap-1">
                                <span className={`w-1.5 h-1.5 rounded-full ${style.indicator || 'bg-slate-400'}`} />
                                <span className="text-[9px] font-mono text-slate-400">
                                  n={cell.count}
                                </span>
                              </div>

                              <div className="my-1">
                                <span className="text-sm font-bold font-mono tracking-tight block">
                                  {activeMetric === 'disagreementRate'
                                    ? `${cell.disagreementRate}%`
                                    : activeMetric === 'divergentCount'
                                    ? `${cell.divergentCount} div`
                                    : activeMetric === 'maxDelta'
                                    ? `${cell.maxDelta}%`
                                    : `${cell.meanDelta}% Δ`}
                                </span>
                              </div>

                              <div className="flex items-center justify-center gap-1 text-[9px] font-mono text-slate-400">
                                <span className="text-indigo-300 font-medium">{cell.avgXgb}%</span>
                                <span>/</span>
                                <span className="text-slate-300 font-medium">{cell.avgRf}%</span>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Cell Drill-Down Deep Dive Drawer */}
      {selectedCell && (
        <div className="bg-slate-950 p-6 rounded-2xl border border-indigo-500/80 shadow-2xl space-y-5 animate-fadeIn">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-950 border border-indigo-800 text-indigo-400">
                <Flame className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white tracking-tight">
                    Cohort Slice Case Files: {selectedCell.rowLabel} × {selectedCell.colLabel}
                  </span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                    selectedCell.riskCategory === 'critical'
                      ? 'bg-rose-950 text-rose-300 border border-rose-800'
                      : selectedCell.riskCategory === 'high'
                      ? 'bg-orange-950 text-orange-300 border border-orange-800'
                      : 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                  }`}>
                    {selectedCell.riskCategory} divergence
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Deep inspection of {selectedCell.count} claim records in this specific policy and loss partition
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedCell(null)}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs transition cursor-pointer self-start sm:self-auto"
            >
              Close Slice
            </button>
          </div>

          {/* Actuarial Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] uppercase font-mono text-slate-400 block mb-0.5">Evaluated Volume</span>
              <span className="text-xl font-bold font-mono text-white">{selectedCell.count} Claims</span>
              <span className="text-[9px] text-slate-500 block">In active cohort</span>
            </div>

            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] uppercase font-mono text-indigo-400 block mb-0.5">Avg XGBoost (Champion)</span>
              <span className="text-xl font-bold font-mono text-indigo-300">{selectedCell.avgXgb}%</span>
              <span className="text-[9px] text-slate-500 block">Gradient boosted risk</span>
            </div>

            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] uppercase font-mono text-slate-300 block mb-0.5">Avg Random Forest</span>
              <span className="text-xl font-bold font-mono text-slate-200">{selectedCell.avgRf}%</span>
              <span className="text-[9px] text-slate-500 block">Bagged ensemble risk</span>
            </div>

            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] uppercase font-mono text-amber-400 block mb-0.5">Mean Delta (Δ)</span>
              <span className="text-xl font-bold font-mono text-amber-300">
                {selectedCell.signedDelta > 0 ? `+${selectedCell.signedDelta}%` : `${selectedCell.signedDelta}%`}
              </span>
              <span className="text-[9px] text-slate-500 block">Abs MAE: {selectedCell.meanDelta}%</span>
            </div>

            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] uppercase font-mono text-rose-400 block mb-0.5">Tier Mismatch Rate</span>
              <span className="text-xl font-bold font-mono text-rose-300">{selectedCell.disagreementRate}%</span>
              <span className="text-[9px] text-slate-500 block">Conflicting tiers</span>
            </div>
          </div>

          {/* Actuarial Root Cause Note */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5 text-xs">
            <span className="font-semibold text-amber-300 uppercase tracking-wider text-[10px] font-mono flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-amber-400" />
              <span>Actuarial Root Cause & Model Partitioning Diagnosis</span>
            </span>
            <p className="text-slate-300 leading-relaxed">
              {selectedCell.actuarialDriver}
            </p>
          </div>

          {/* Individual Claims Ledger in this Cohort */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-white">Underlying Claims in this Cohort ({selectedCell.claims.length})</span>
              <span className="text-slate-400 font-mono text-[11px]">Ranked by |Model Delta|</span>
            </div>

            <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-900">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono text-[10px] uppercase tracking-wider bg-slate-950/60">
                    <th className="py-2.5 px-3">Claim ID</th>
                    <th className="py-2.5 px-3">Policyholder</th>
                    <th className="py-2.5 px-3 text-right">Claim Amount</th>
                    <th className="py-2.5 px-3 text-center">XGBoost Risk</th>
                    <th className="py-2.5 px-3 text-center">Random Forest</th>
                    <th className="py-2.5 px-3 text-center">Score Delta (Δ)</th>
                    <th className="py-2.5 px-3">Primary Disagreement Driver</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {selectedCell.claims.map((c) => {
                    const rf = c.rfRiskScore !== undefined ? c.rfRiskScore : 0.30;
                    const xgb = c.fraudRiskScore;
                    const delta = Number((rf - xgb).toFixed(3));
                    const absDelta = Math.abs(delta);

                    return (
                      <tr key={c.id} className="hover:bg-slate-850/60 transition">
                        <td className="py-2.5 px-3 font-mono font-medium text-white">
                          {c.claimNumber}
                        </td>
                        <td className="py-2.5 px-3 text-slate-300">
                          {c.policyHolderName}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-medium text-white">
                          ${c.claimAmount.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="font-mono font-bold text-indigo-400">
                            {(xgb * 100).toFixed(1)}%
                          </span>
                          <span className="text-[10px] text-slate-500 block font-sans">
                            {c.riskTier}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="font-mono font-bold text-slate-200">
                            {(rf * 100).toFixed(1)}%
                          </span>
                          <span className="text-[10px] text-slate-500 block font-sans">
                            {c.rfRiskTier || 'Low'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                            absDelta >= 0.15
                              ? 'bg-rose-950 text-rose-300 border border-rose-800/80'
                              : absDelta >= 0.08
                              ? 'bg-amber-950 text-amber-300 border border-amber-800/60'
                              : 'bg-slate-800 text-slate-300'
                          }`}>
                            {delta > 0 ? `+${(delta * 100).toFixed(1)}%` : `${(delta * 100).toFixed(1)}%`}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-300 text-[11px] max-w-xs truncate">
                          {c.divergenceReason || c.anomalyFlags?.[0] || 'Feature tree path interaction divergence'}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          {onSelectClaim && (
                            <button
                              onClick={() => onSelectClaim(c)}
                              className="px-2 py-1 rounded bg-indigo-600/80 hover:bg-indigo-600 text-white text-[11px] font-medium transition cursor-pointer flex items-center gap-1 ml-auto"
                            >
                              <span>Inspect</span>
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
