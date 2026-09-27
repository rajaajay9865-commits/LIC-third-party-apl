import React from 'react';
import { 
  ShieldCheck, 
  UserCheck, 
  Eye, 
  EyeOff, 
  UploadCloud, 
  FileText, 
  Sliders, 
  History, 
  PlusCircle,
  AlertTriangle,
  Database,
  Search,
  BookOpen,
  Activity,
  Flame,
  CheckCircle2
} from 'lucide-react';
import { UserRole } from '../types/insurance';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  isTokenized: boolean;
  onToggleTokenization: () => void;
  onOpenIngestion: () => void;
  onOpenGovernance: () => void;
  onOpenReports: () => void;
  onOpenAuditLogs: () => void;
  onOpenSchemaRepo: () => void;
  onOpenDocs: () => void;
  onOpenSearch: () => void;
  onGenerateSynthetic: () => void;
  totalClaimsCount: number;
  userName?: string;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  isTokenized,
  onToggleTokenization,
  onOpenIngestion,
  onOpenGovernance,
  onOpenReports,
  onOpenAuditLogs,
  onOpenSchemaRepo,
  onOpenDocs,
  onOpenSearch,
  onGenerateSynthetic,
  totalClaimsCount,
  userName = 'Rahul Sharma',
  onLogout,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-40 shadow-sm">
      {/* Top Banner Notice: Live MLOps Telemetry & Compliance Disclaimer */}
      <div className="bg-slate-950 px-4 py-1.5 border-b border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono tracking-wide uppercase bg-emerald-950/80 text-emerald-400 border border-emerald-800/50">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Dual Pipelines Live: XGB-2.4.1 (14ms) / RF-2.3.0</span>
          </div>
          <span className="hidden sm:inline text-slate-600">·</span>
          <span className="flex items-center gap-1 text-amber-400/90 font-medium text-[11px]">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>Statutory Decision Support: Human-in-the-Loop Adjudication Mandated.</span>
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <span className="font-mono text-[11px] text-slate-400 hidden sm:inline">
            Active Cohort: <strong className="text-white font-mono">{totalClaimsCount}</strong> Claims
          </span>
          <span className="text-slate-600 hidden sm:inline">·</span>
          <button
            onClick={onToggleTokenization}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium transition cursor-pointer ${
              isTokenized 
                ? 'bg-indigo-950 text-indigo-300 border border-indigo-700/60 hover:bg-indigo-900' 
                : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
            }`}
            title="Toggle PII Masking (HIPAA / GDPR Compliance)"
          >
            {isTokenized ? <EyeOff className="w-3 h-3 text-indigo-400" /> : <Eye className="w-3 h-3 text-slate-400" />}
            <span>{isTokenized ? 'PII Protected' : 'PII Revealed'}</span>
          </button>
        </div>
      </div>

      {/* Main Header Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-700 to-cyan-500 border border-cyan-400/40 flex items-center justify-center text-white shadow-md">
            <span className="font-extrabold text-sm tracking-tighter">CLI</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-white font-sans">CLI CONNECTION</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Unified Portal
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-normal">
              Claims Adjudication, Scheme Subsidies & Smart Payment Gateway
            </p>
          </div>
        </div>

        {/* Global Search Bar Trigger */}
        <div className="flex-1 max-w-xs hidden xl:block">
          <button
            onClick={onOpenSearch}
            className="w-full bg-slate-950/80 hover:bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 rounded-lg py-1.5 px-3 flex items-center justify-between text-xs transition cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-400 transition" />
              <span>Search claims, policies, losses...</span>
            </div>
            <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Action Controls & Role Switcher */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Fast actions */}
          <div className="hidden lg:flex items-center gap-1.5 border-r border-slate-800 pr-2.5">
            <button
              onClick={onOpenSearch}
              className="xl:hidden p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
              title="Global Claim Search (⌘K)"
            >
              <Search className="w-4 h-4 text-indigo-400" />
            </button>

            <button
              onClick={onOpenIngestion}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
              title="Import historical claims CSV/JSON"
            >
              <UploadCloud className="w-3.5 h-3.5 text-indigo-400" />
              <span>Import</span>
            </button>

            <button
              onClick={onGenerateSynthetic}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
              title="Inject 20 realistic synthetic claims"
            >
              <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>+20 Synth</span>
            </button>

            <button
              onClick={onOpenGovernance}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-950/60 hover:bg-rose-900/70 text-rose-200 border border-rose-800/80 transition cursor-pointer shadow-xs"
              title="Cohort Divergence Heatmap, Dual-Model Governance & Thresholds"
            >
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              <span>Divergence Heatmap</span>
            </button>

            <button
              onClick={onOpenReports}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
              title="Executive Portfolio Risk Report"
            >
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              <span>Reports</span>
            </button>

            <button
              onClick={onOpenAuditLogs}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
              title="Immutable Audit Ledger"
            >
              <History className="w-3.5 h-3.5 text-slate-400" />
              <span>Audit</span>
            </button>

            <button
              onClick={onOpenSchemaRepo}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border border-indigo-700/60 transition cursor-pointer"
              title="Enterprise Client Data Dictionary & Schema Specification"
            >
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              <span>Schema (25)</span>
            </button>

            <button
              onClick={onOpenDocs}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
              title="Actuarial Risk & Model Governance Technical Specification"
            >
              <BookOpen className="w-3.5 h-3.5 text-purple-400" />
              <span>Docs</span>
            </button>
          </div>

          {/* Role Switcher & User Profile */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
              <UserCheck className="w-3.5 h-3.5 text-indigo-400 ml-1.5" />
              <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">Role:</span>
              <select
                value={currentRole}
                onChange={(e) => onRoleChange(e.target.value as UserRole)}
                className="bg-transparent text-xs text-indigo-200 font-medium focus:outline-none focus:ring-0 pr-1 cursor-pointer"
              >
                <option value="claims_analyst" className="bg-slate-900 text-slate-100">Claims Analyst</option>
                <option value="risk_analyst" className="bg-slate-900 text-slate-100">Risk & Fraud Analyst</option>
                <option value="admin" className="bg-slate-900 text-slate-100">Chief Risk Officer (Admin)</option>
              </select>
            </div>

            {onLogout && (
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer"
                title="Switch Account or Return to CLIC Login Screen"
              >
                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-400 text-white flex items-center justify-center text-[10px] font-bold">
                  {userName.charAt(0)}
                </div>
                <span className="hidden md:inline">{userName.split(' ')[0]}</span>
                <span className="text-slate-500 hidden md:inline">|</span>
                <span className="text-slate-400 hover:text-rose-400">Logout</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
