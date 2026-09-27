import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  Download, 
  ChevronRight,
  Sparkles,
  RefreshCw,
  Flame,
  Layers,
  Zap,
  Clock,
  Car,
  Home,
  HeartPulse,
  Users,
  Plane
} from 'lucide-react';
import { ClaimRecord, RiskTier, ClaimStatus } from '../types/insurance';
import { maskName, maskPolicyNumber } from '../utils/privacy';
import { 
  getPolicyCategoryIcon, 
  getStatusIcon, 
  getRiskTierIcon, 
  getClaimTypeIcon 
} from '../utils/insuranceIcons';

interface ClaimsTableProps {
  claims: ClaimRecord[];
  selectedClaim: ClaimRecord | null;
  onSelectClaim: (claim: ClaimRecord) => void;
  isTokenized: boolean;
  activeRiskFilter: RiskTier | 'ALL';
  activeStatusFilter: string | 'ALL';
  onFilterRiskTier: (tier: RiskTier | 'ALL') => void;
  onFilterStatus: (status: string | 'ALL') => void;
  onBatchScore: (ids: string[]) => void;
}

type SortField = 'claimNumber' | 'claimAmount' | 'fraudRiskScore' | 'reportLagDays' | 'incidentDate' | 'policyAgeMonths';
type SortOrder = 'asc' | 'desc';

export const ClaimsTable: React.FC<ClaimsTableProps> = ({
  claims,
  selectedClaim,
  onSelectClaim,
  isTokenized,
  activeRiskFilter,
  activeStatusFilter,
  onFilterRiskTier,
  onFilterStatus,
  onBatchScore,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [onlyAnomalies, setOnlyAnomalies] = useState(false);
  const [onlyDivergent, setOnlyDivergent] = useState(false);
  const [sortField, setSortField] = useState<SortField>('fraudRiskScore');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Filtering
  const filteredClaims = useMemo(() => {
    return claims.filter((claim) => {
      // Risk Tier filter
      if (activeRiskFilter !== 'ALL' && claim.riskTier !== activeRiskFilter) {
        return false;
      }

      // Status filter
      if (activeStatusFilter !== 'ALL' && claim.status !== activeStatusFilter) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'ALL') {
        const prod = claim.productCategory || (claim.policyType.includes('Auto') ? 'Vehicle' : claim.policyType.includes('Home') ? 'Property' : claim.policyType.includes('Health') ? 'Health' : claim.policyType.includes('Life') ? 'Life' : 'Travel');
        if (!prod.toLowerCase().includes(selectedCategory.toLowerCase())) {
          return false;
        }
      }

      // Only anomalies toggle
      if (onlyAnomalies && (!claim.anomalyFlags || claim.anomalyFlags.length === 0)) {
        return false;
      }

      // Only divergent toggle
      if (onlyDivergent) {
        const delta = Math.abs((claim.rfRiskScore || 0.3) - claim.fraudRiskScore);
        if (delta < 0.12) return false;
      }

      // Text search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchNumber = claim.claimNumber.toLowerCase().includes(query);
        const matchHolder = claim.policyHolderName.toLowerCase().includes(query);
        const matchPolicy = claim.policyNumber.toLowerCase().includes(query);
        const matchDesc = claim.description.toLowerCase().includes(query);
        const matchLocation = claim.incidentLocation.toLowerCase().includes(query);
        const matchIncident = (claim.incidentCategory || '').toLowerCase().includes(query);
        if (!matchNumber && !matchHolder && !matchPolicy && !matchDesc && !matchLocation && !matchIncident) {
          return false;
        }
      }

      return true;
    });
  }, [claims, activeRiskFilter, activeStatusFilter, selectedCategory, onlyAnomalies, onlyDivergent, searchQuery]);

  // Sorting
  const sortedClaims = useMemo(() => {
    return [...filteredClaims].sort((a, b) => {
      let comparison = 0;
      if (sortField === 'fraudRiskScore') {
        comparison = a.fraudRiskScore - b.fraudRiskScore;
      } else if (sortField === 'claimAmount') {
        comparison = a.claimAmount - b.claimAmount;
      } else if (sortField === 'reportLagDays') {
        comparison = a.reportLagDays - b.reportLagDays;
      } else if (sortField === 'policyAgeMonths') {
        comparison = a.policyAgeMonths - b.policyAgeMonths;
      } else if (sortField === 'incidentDate') {
        comparison = new Date(a.incidentDate).getTime() - new Date(b.incidentDate).getTime();
      } else if (sortField === 'claimNumber') {
        comparison = a.claimNumber.localeCompare(b.claimNumber);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [filteredClaims, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(sortedClaims.map((c) => c.id));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelectOne = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const exportSelectedCsv = () => {
    const listToExport = selectedIds.length > 0
      ? claims.filter((c) => selectedIds.includes(c.id))
      : sortedClaims;

    const headers = [
      'ClaimNumber',
      'PolicyNumber',
      'PolicyHolder',
      'ProductCategory',
      'PolicyAgeMonths',
      'IncidentDate',
      'ReportLagDays',
      'ClaimAmount',
      'Deductible',
      'PreviousClaims',
      'XGBoostScore',
      'RandomForestScore',
      'RiskTier',
      'Status',
      'AnomalyFlags'
    ];

    const rows = listToExport.map((c) => [
      c.claimNumber,
      isTokenized ? maskPolicyNumber(c.policyNumber) : c.policyNumber,
      isTokenized ? maskName(c.policyHolderName) : `"${c.policyHolderName.replace(/"/g, '""')}"`,
      `"${c.productCategory || c.policyType}"`,
      c.policyAgeMonths,
      c.incidentDate,
      c.reportLagDays,
      c.claimAmount,
      c.deductible,
      c.previousClaimsCount,
      (c.fraudRiskScore * 100).toFixed(1),
      ((c.rfRiskScore || 0.3) * 100).toFixed(1),
      c.riskTier,
      `"${c.status}"`,
      `"${(c.anomalyFlags || []).join('; ').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `claims_risk_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col">
      {/* Table Toolbar & Search Filters */}
      <div className="p-4 border-b border-slate-800 space-y-3 bg-slate-950/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search claims by ID, policyholder, loss type, location..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {selectedIds.length > 0 && (
              <button
                onClick={() => onBatchScore(selectedIds)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-sm cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Score Selected ({selectedIds.length})
              </button>
            )}

            <button
              onClick={() => setOnlyDivergent(!onlyDivergent)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition cursor-pointer ${
                onlyDivergent
                  ? 'bg-rose-950 text-rose-300 border-rose-800 font-semibold'
                  : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-900'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              <span>Divergent (|Δ| ≥ 12%)</span>
            </button>

            <button
              onClick={exportSelectedCsv}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
              title="Export visible or selected records as CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Filter Row */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/60 text-xs">
          <div className="flex items-center gap-1 text-slate-400 font-medium mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          {/* Product Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="ALL">All Product Lines</option>
            <option value="Vehicle">Vehicle / Auto</option>
            <option value="Property">Property & Casualty</option>
            <option value="Health">Health & Medical</option>
            <option value="Life">Life & Disability</option>
            <option value="Travel">Travel & Cargo</option>
          </select>

          {/* Risk Tier Filter */}
          <select
            value={activeRiskFilter}
            onChange={(e) => onFilterRiskTier(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="ALL">All Risk Tiers</option>
            <option value="Critical">Critical Risk (&gt;= 82%)</option>
            <option value="Elevated">Elevated (65% - 81%)</option>
            <option value="Moderate">Moderate (30% - 64%)</option>
            <option value="Low">Low Risk (&lt; 30%)</option>
          </select>

          {/* Status Filter */}
          <select
            value={activeStatusFilter}
            onChange={(e) => onFilterStatus(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="Pending Triage">Pending Triage</option>
            <option value="Fast-Track Approved">Fast-Track Approved</option>
            <option value="Standard In-Review">Standard In-Review</option>
            <option value="Referred to SIU">Referred to SIU</option>
            <option value="Documentation Requested">Documentation Requested</option>
            <option value="Settled">Settled</option>
            <option value="Denied">Denied</option>
          </select>

          {/* Anomalies Only */}
          <label className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 cursor-pointer hover:bg-slate-900 transition">
            <input
              type="checkbox"
              checked={onlyAnomalies}
              onChange={(e) => setOnlyAnomalies(e.target.checked)}
              className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-0 cursor-pointer"
            />
            <span>Anomalies Only</span>
          </label>

          {(selectedCategory !== 'ALL' || activeRiskFilter !== 'ALL' || activeStatusFilter !== 'ALL' || onlyAnomalies || onlyDivergent || searchQuery) && (
            <button
              onClick={() => {
                setSelectedCategory('ALL');
                onFilterRiskTier('ALL');
                onFilterStatus('ALL');
                setOnlyAnomalies(false);
                setOnlyDivergent(false);
                setSearchQuery('');
              }}
              className="text-indigo-400 hover:text-indigo-300 text-xs underline ml-auto cursor-pointer"
            >
              Reset Filters
            </button>
          )}

          <div className="ml-auto text-slate-400 font-mono text-[11px]">
            Showing <strong className="text-white">{sortedClaims.length}</strong> of {claims.length}
          </div>
        </div>
      </div>

      {/* Main Table Grid */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
              <th className="py-3 px-3 w-10 text-center">
                <input
                  type="checkbox"
                  checked={selectedIds.length > 0 && selectedIds.length === sortedClaims.length}
                  onChange={handleSelectAll}
                  className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-0 cursor-pointer"
                />
              </th>

              <th 
                onClick={() => handleSort('claimNumber')}
                className="py-3 px-3 cursor-pointer hover:text-white transition"
              >
                <div className="flex items-center gap-1">
                  <span>Claim / Policy</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>

              <th className="py-3 px-3">
                <span>Policyholder</span>
              </th>

              <th className="py-3 px-3">
                <span>Line & Loss Type</span>
              </th>

              <th 
                onClick={() => handleSort('claimAmount')}
                className="py-3 px-3 text-right cursor-pointer hover:text-white transition"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Claim Amount</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>

              <th 
                onClick={() => handleSort('reportLagDays')}
                className="py-3 px-3 text-center cursor-pointer hover:text-white transition hidden md:table-cell"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Notice Lag</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>

              <th 
                onClick={() => handleSort('fraudRiskScore')}
                className="py-3 px-3 text-center cursor-pointer hover:text-white transition"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Risk Score / Tier</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>

              <th className="py-3 px-3 text-center">
                <span>Status</span>
              </th>

              <th className="py-3 px-3 text-right">
                <span>Review</span>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800/60">
            {sortedClaims.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <AlertTriangle className="w-8 h-8 text-slate-600" />
                    <p className="text-sm font-medium text-slate-300">No claims match the active filter criteria</p>
                    <p className="text-xs text-slate-500">Try loosening your search query or reset filter tags</p>
                  </div>
                </td>
              </tr>
            ) : (
              sortedClaims.map((claim) => {
                const isSelected = selectedClaim?.id === claim.id;
                const isChecked = selectedIds.includes(claim.id);
                const hasAnomalies = claim.anomalyFlags && claim.anomalyFlags.length > 0;
                const rfScore = claim.rfRiskScore !== undefined ? claim.rfRiskScore : 0.30;
                const delta = Math.abs(rfScore - claim.fraudRiskScore);
                const isDivergent = delta >= 0.12;

                return (
                  <tr
                    key={claim.id}
                    onClick={() => onSelectClaim(claim)}
                    className={`cursor-pointer transition group ${
                      isSelected
                        ? 'bg-indigo-950/40 border-l-2 border-indigo-500'
                        : 'hover:bg-slate-800/40'
                    }`}
                  >
                    {/* Checkbox */}
                    <td 
                      className="py-3 px-3 text-center"
                      onClick={(e) => toggleSelectOne(claim.id, e)}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-0 cursor-pointer"
                      />
                    </td>

                    {/* Claim Number & Policy */}
                    <td className="py-3 px-3">
                      <div className="font-mono font-medium text-white group-hover:text-indigo-300 transition flex items-center gap-1.5">
                        {getPolicyCategoryIcon(claim.productCategory || claim.policyType, { className: 'w-3.5 h-3.5 text-indigo-400' })}
                        <span>{claim.claimNumber}</span>
                        {hasAnomalies && (
                          <span 
                            title={`${claim.anomalyFlags.length} Anomaly vectors flagged`}
                            className="inline-flex items-center px-1 rounded text-[10px] font-mono bg-rose-950 text-rose-400 border border-rose-800/60"
                          >
                            !
                          </span>
                        )}
                        {isDivergent && (
                          <span 
                            title={`Inter-model divergence delta: ${(delta * 100).toFixed(0)}%`}
                            className="inline-flex items-center p-0.5 rounded text-[10px] font-mono bg-rose-950 text-rose-300 border border-rose-800/60"
                          >
                            <Flame className="w-3 h-3 text-rose-400" />
                          </span>
                        )}
                      </div>
                      <div className="font-mono text-[11px] text-slate-400 mt-0.5">
                        {isTokenized ? maskPolicyNumber(claim.policyNumber) : claim.policyNumber}
                      </div>
                    </td>

                    {/* Policyholder */}
                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-200">
                        {isTokenized ? maskName(claim.policyHolderName) : claim.policyHolderName}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 font-mono">
                        <span>Tenure: {claim.policyAgeMonths}m</span>
                        <span>·</span>
                        <span>Prior: {claim.previousClaimsCount}</span>
                      </div>
                    </td>

                    {/* Product Line & Loss Type with dedicated icons */}
                    <td className="py-3 px-3">
                      <div className="text-slate-300 font-medium flex items-center gap-1.5">
                        <span>{claim.productCategory || claim.policyType}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[150px] flex items-center gap-1 mt-0.5">
                        {getClaimTypeIcon(claim.incidentCategory, { className: 'w-3 h-3 text-slate-400' })}
                        <span>{claim.incidentCategory || claim.incidentLocation}</span>
                      </div>
                    </td>

                    {/* Claim Amount */}
                    <td className="py-3 px-3 text-right">
                      <div className="font-mono font-semibold text-white">
                        ${claim.claimAmount.toLocaleString()}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400">
                        Ded: ${claim.deductible}
                      </div>
                    </td>

                    {/* Notice Lag */}
                    <td className="py-3 px-3 text-center hidden md:table-cell">
                      <span className={`font-mono text-xs ${
                        claim.reportLagDays > 14 ? 'text-amber-400 font-semibold' : 'text-slate-300'
                      }`}>
                        {claim.reportLagDays}d
                      </span>
                    </td>

                    {/* Risk Score & Tier */}
                    <td className="py-3 px-3 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold tracking-tight ${
                          claim.riskTier === 'Critical'
                            ? 'bg-rose-950 text-rose-300 border border-rose-800/80'
                            : claim.riskTier === 'Elevated'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800/80'
                            : claim.riskTier === 'Moderate'
                            ? 'bg-blue-950 text-blue-300 border border-blue-800/80'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-800/80'
                        }`}>
                          {(claim.fraudRiskScore * 100).toFixed(1)}%
                        </span>
                        <div className="flex items-center gap-1 text-[10px] font-mono mt-0.5 text-slate-400">
                          <span>RF: {(rfScore * 100).toFixed(0)}%</span>
                          {isDivergent && (
                            <span 
                              title={`Model Divergence: ${((rfScore - claim.fraudRiskScore) * 100).toFixed(0)}% delta`}
                              className="text-rose-400 font-bold"
                            >
                              Δ!
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Status with dedicated icon */}
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${
                        claim.status === 'Fast-Track Approved' || claim.status === 'Settled'
                          ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60'
                          : claim.status === 'Referred to SIU' || claim.status === 'Denied'
                          ? 'bg-rose-950/60 text-rose-300 border border-rose-800/60'
                          : claim.status === 'Documentation Requested'
                          ? 'bg-amber-950/60 text-amber-300 border border-amber-800/60'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}>
                        {getStatusIcon(claim.status, { className: 'w-3 h-3' })}
                        <span>{claim.status}</span>
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3 px-3 text-right">
                      <span className="inline-flex items-center gap-1 text-indigo-400 group-hover:text-indigo-300 text-xs font-medium">
                        Adjudicate
                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
