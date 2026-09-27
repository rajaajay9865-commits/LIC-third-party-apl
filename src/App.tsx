import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DashboardOverview } from './components/DashboardOverview';
import { ClaimsTable } from './components/ClaimsTable';
import { ClaimDetailWorkbench } from './components/ClaimDetailWorkbench';
import { ModelGovernance } from './components/ModelGovernance';
import { DataIngestionModal } from './components/DataIngestionModal';
import { AuditLogViewer } from './components/AuditLogViewer';
import { ReportsModal } from './components/ReportsModal';
import { SchemaRepositoryModal } from './components/SchemaRepositoryModal';
import { CommandPaletteModal } from './components/CommandPaletteModal';
import { SystemDocumentationModal } from './components/SystemDocumentationModal';
import { INITIAL_CLAIMS, generateSyntheticClaims } from './data/mockClaimsDataset';
import { ClaimRecord, RiskTier, UserRole, AuditLogEntry } from './types/insurance';
import { predictClaimRisk } from './utils/mlEngine';
import { CheckCircle2, Info, ShieldCheck, Cpu, Lock, Sparkles } from 'lucide-react';

export default function App() {
  const [claims, setClaims] = useState<ClaimRecord[]>(INITIAL_CLAIMS);
  const [selectedClaim, setSelectedClaim] = useState<ClaimRecord | null>(null);
  const [currentRole, setCurrentRole] = useState<UserRole>('claims_analyst');
  const [isTokenized, setIsTokenized] = useState<boolean>(true);

  // Filters
  const [activeRiskFilter, setActiveRiskFilter] = useState<RiskTier | 'ALL'>('ALL');
  const [activeStatusFilter, setActiveStatusFilter] = useState<string | 'ALL'>('ALL');

  // Configured Risk Thresholds
  const [highThreshold, setHighThreshold] = useState<number>(0.65);
  const [fastTrackThreshold, setFastTrackThreshold] = useState<number>(0.30);
  const [activeModelDeployment, setActiveModelDeployment] = useState<'xgboost' | 'randomforest' | 'ensemble'>('xgboost');

  // Modal States
  const [isIngestionOpen, setIsIngestionOpen] = useState(false);
  const [isGovernanceOpen, setIsGovernanceOpen] = useState(false);
  const [isReportsOpen, setIsReportsOpen] = useState(false);
  const [isAuditLogsOpen, setIsAuditLogsOpen] = useState(false);
  const [isSchemaRepoOpen, setIsSchemaRepoOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isDocsOpen, setIsDocsOpen] = useState(false);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Keyboard shortcut for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Initial regulatory audit logs
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([
    {
      id: 'log-1',
      timestamp: '2026-09-27T05:30:00Z',
      user: 'System Pipeline',
      role: 'admin',
      action: 'SYSTEM_BOOTSTRAP',
      details: 'AegisClaim AI initialized with model XGBoost-2.4.1 (ROC-AUC 0.892). Baseline population risk E[f(x)] set to 0.28.',
    },
    {
      id: 'log-2',
      timestamp: '2026-09-27T05:45:00Z',
      user: 'Sarah Jenkins',
      role: 'claims_analyst',
      action: 'ADJUDICATE_CLAIM',
      claimId: 'claim-101',
      claimNumber: 'CLM-2026-8801',
      details: 'Flagged for SIU review due to 14-day policy inception latency, missing municipal police report, and prior total losses.',
    },
    {
      id: 'log-3',
      timestamp: '2026-09-27T06:00:00Z',
      user: 'Chief Risk Officer',
      role: 'admin',
      action: 'UPDATE_MODEL_THRESHOLDS',
      details: 'Standard high-risk cutoff locked at 65.0% and fast-track cutoff at 30.0%.',
    }
  ]);

  const handleLogAudit = (action: string, details: string, claimNumber?: string, claimId?: string) => {
    const entry: AuditLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user: currentRole === 'admin' ? 'Chief Risk Officer' : currentRole === 'risk_analyst' ? 'Risk Specialist' : 'Claims Adjuster',
      role: currentRole,
      action,
      details,
      claimNumber,
      claimId,
    };
    setAuditLogs((prev) => [entry, ...prev]);
  };

  // Handle updates to an individual claim (e.g. from the Workbench)
  const handleUpdateClaim = (updatedClaim: ClaimRecord, logMessage: string) => {
    setClaims((prev) =>
      prev.map((c) => (c.id === updatedClaim.id ? updatedClaim : c))
    );
    setSelectedClaim(updatedClaim);
    handleLogAudit('ADJUDICATE_CLAIM', logMessage, updatedClaim.claimNumber, updatedClaim.id);
    showToast(`Claim ${updatedClaim.claimNumber} updated: ${updatedClaim.status}`);
  };

  // Batch scoring of selected claims
  const handleBatchScore = (ids: string[]) => {
    setClaims((prev) =>
      prev.map((c) => {
        if (ids.includes(c.id)) {
          const freshPrediction = predictClaimRisk(c, highThreshold, fastTrackThreshold);
          return {
            ...c,
            ...freshPrediction,
            lastUpdated: new Date().toISOString(),
          };
        }
        return c;
      })
    );
    handleLogAudit(
      'BATCH_RISK_INFERENCE',
      `Triggered batch model re-scoring on ${ids.length} selected claims at ${(highThreshold * 100).toFixed(0)}% cutoff.`
    );
    showToast(`Re-scored ${ids.length} claims with calibrated SHAP explainability`);
  };

  // Generate synthetic claims
  const handleGenerateSynthetic = () => {
    const synthetic = generateSyntheticClaims(20, claims.length);
    setClaims((prev) => [...prev, ...synthetic]);
    handleLogAudit(
      'GENERATE_SYNTHETIC_DATA',
      `Injected 20 synthetic insurance claims across 5 product lines for stress testing and modeling.`
    );
    showToast('Injected 20 synthetic claims into active cohort');
  };

  // Import claims from file
  const handleImportClaims = (newClaims: ClaimRecord[]) => {
    setClaims((prev) => [...newClaims, ...prev]);
    showToast(`Successfully ingested and scored ${newClaims.length} new claim records`);
  };

  // Update thresholds
  const handleUpdateThresholds = (newHigh: number, newFast: number) => {
    setHighThreshold(newHigh);
    setFastTrackThreshold(newFast);
    // Re-score all claims under new thresholds
    setClaims((prev) =>
      prev.map((c) => {
        const updated = predictClaimRisk(c, newHigh, newFast);
        return {
          ...c,
          ...updated,
        };
      })
    );
    showToast(`Thresholds updated: High-Risk ≥ ${(newHigh * 100).toFixed(0)}%, Fast-Track ≤ ${(newFast * 100).toFixed(0)}%`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 border border-indigo-500/80 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs animate-slideUp">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main App Header */}
      <Header
        currentRole={currentRole}
        onRoleChange={(role) => {
          setCurrentRole(role);
          handleLogAudit('SWITCH_ROLE', `User role shifted to ${role}`);
          showToast(`Switched active view to ${role.replace('_', ' ').toUpperCase()}`);
        }}
        isTokenized={isTokenized}
        onToggleTokenization={() => {
          const next = !isTokenized;
          setIsTokenized(next);
          handleLogAudit(
            'TOGGLE_TOKENIZATION',
            `PII Tokenization & Masking mode set to ${next ? 'ACTIVE (Protected)' : 'REVEALED (Privileged Access)'}`
          );
          showToast(next ? 'PII Tokenization & Masking Activated' : 'PII Revealed (Privileged Review Mode)');
        }}
        onOpenIngestion={() => setIsIngestionOpen(true)}
        onOpenGovernance={() => setIsGovernanceOpen(true)}
        onOpenReports={() => setIsReportsOpen(true)}
        onOpenAuditLogs={() => setIsAuditLogsOpen(true)}
        onOpenSchemaRepo={() => setIsSchemaRepoOpen(true)}
        onOpenDocs={() => setIsDocsOpen(true)}
        onOpenSearch={() => setIsCommandPaletteOpen(true)}
        onGenerateSynthetic={handleGenerateSynthetic}
        totalClaimsCount={claims.length}
      />

      {/* Main Workspace Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Role Context Notification Bar */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="text-slate-300">
              Active Workspace: <strong className="text-white capitalize">{currentRole.replace('_', ' ')} Mode</strong>.
              {currentRole === 'claims_analyst' && ' Focusing on triage queues, FNOL validation, and adjudication workbench.'}
              {currentRole === 'risk_analyst' && ' Focusing on portfolio loss distribution, anomaly detection, and SHAP attribution.'}
              {currentRole === 'admin' && ' Full administrative rights: threshold governance, MLOps calibration, and audit logging.'}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-3 font-mono text-[11px] text-slate-400">
            <span>High Risk Cutoff: <strong className="text-rose-400">{(highThreshold * 100).toFixed(0)}%</strong></span>
            <span>·</span>
            <span>Fast-Track: <strong className="text-emerald-400">{(fastTrackThreshold * 100).toFixed(0)}%</strong></span>
            <span>·</span>
            <button
              onClick={() => setIsGovernanceOpen(true)}
              className="text-indigo-400 hover:text-indigo-300 underline cursor-pointer"
            >
              Open Divergence Heatmap
            </button>
          </div>
        </div>

        {/* Executive Dashboard & Metrics Overview */}
        <DashboardOverview
          claims={claims}
          onFilterRiskTier={(tier) => setActiveRiskFilter(tier)}
          onFilterStatus={(status) => setActiveStatusFilter(status)}
          onSelectClaim={(claim) => setSelectedClaim(claim)}
        />

        {/* Claims Ledger & Adjudication Table */}
        <ClaimsTable
          claims={claims}
          selectedClaim={selectedClaim}
          onSelectClaim={(claim) => setSelectedClaim(claim)}
          isTokenized={isTokenized}
          activeRiskFilter={activeRiskFilter}
          activeStatusFilter={activeStatusFilter}
          onFilterRiskTier={(tier) => setActiveRiskFilter(tier)}
          onFilterStatus={(status) => setActiveStatusFilter(status)}
          onBatchScore={handleBatchScore}
        />
      </main>

      {/* Modals & Slide-overs */}

      {/* 1. Individual Claim Decision Workbench */}
      {selectedClaim && (
        <ClaimDetailWorkbench
          claim={selectedClaim}
          onClose={() => setSelectedClaim(null)}
          onUpdateClaim={handleUpdateClaim}
          currentUserRole={currentRole}
          isTokenized={isTokenized}
        />
      )}

      {/* 2. Model Governance & Heatmap Modal */}
      {isGovernanceOpen && (
        <ModelGovernance
          claims={claims}
          onClose={() => setIsGovernanceOpen(false)}
          onUpdateThresholds={handleUpdateThresholds}
          activeHighThreshold={highThreshold}
          activeFastTrackThreshold={fastTrackThreshold}
          onLogAudit={(action, details) => handleLogAudit(action, details)}
          activeModelDeployment={activeModelDeployment}
          onChangeDeploymentModel={(model) => setActiveModelDeployment(model)}
          onSelectClaim={(claim) => setSelectedClaim(claim)}
        />
      )}

      {/* 3. Global Search & Command Palette Modal */}
      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        claims={claims}
        onSelectClaim={(claim) => setSelectedClaim(claim)}
        onOpenGovernance={() => setIsGovernanceOpen(true)}
        onOpenReports={() => setIsReportsOpen(true)}
        onOpenAuditLogs={() => setIsAuditLogsOpen(true)}
        onOpenSchemaRepo={() => setIsSchemaRepoOpen(true)}
        onOpenDocs={() => setIsDocsOpen(true)}
      />

      {/* 4. Actuarial Risk Architecture & System Documentation Modal */}
      <SystemDocumentationModal
        isOpen={isDocsOpen}
        onClose={() => setIsDocsOpen(false)}
      />

      {/* 5. Data Ingestion & Preprocessing Modal */}
      {isIngestionOpen && (
        <DataIngestionModal
          onClose={() => setIsIngestionOpen(false)}
          onImportClaims={handleImportClaims}
          onLogAudit={(action, details) => handleLogAudit(action, details)}
          isTokenized={isTokenized}
        />
      )}

      {/* 6. Regulatory Audit Log Modal */}
      {isAuditLogsOpen && (
        <AuditLogViewer
          logs={auditLogs}
          onClose={() => setIsAuditLogsOpen(false)}
        />
      )}

      {/* 7. Executive Reports Modal */}
      {isReportsOpen && (
        <ReportsModal
          claims={claims}
          onClose={() => setIsReportsOpen(false)}
          isTokenized={isTokenized}
        />
      )}

      {/* 8. Enterprise Client Schema Repository Modal */}
      {isSchemaRepoOpen && (
        <SchemaRepositoryModal
          onClose={() => setIsSchemaRepoOpen(false)}
        />
      )}

      {/* Professional Enterprise Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 text-xs text-slate-400 font-sans">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-950 border border-indigo-800/60 flex items-center justify-center text-indigo-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-white tracking-tight">
                AegisClaim AI · Enterprise Insurance Risk & Decision Support Suite
              </p>
              <p className="text-[11px] text-slate-500 font-mono">
                Model: XGBoost-2.4.1 (Champion) / Random Forest-2.3.0 (Challenger) · 14ms Latency · ROC-AUC 0.892
              </p>
            </div>
          </div>

          {/* Compliance & Security Badges */}
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-1">
              <Lock className="w-3 h-3 text-emerald-400" />
              SOC 2 Type II
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-indigo-400" />
              NAIC Model Governance
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-teal-400" />
              EEOC 4/5ths Non-Bias
            </span>
            <button
              onClick={() => setIsDocsOpen(true)}
              className="px-2 py-0.5 rounded bg-indigo-950/80 border border-indigo-700/60 text-indigo-300 hover:bg-indigo-900 transition cursor-pointer"
            >
              System Docs
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
