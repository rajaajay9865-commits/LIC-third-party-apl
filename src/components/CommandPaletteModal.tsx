import React, { useState, useEffect } from 'react';
import { 
  Search, 
  X, 
  ExternalLink, 
  FileText, 
  Sliders, 
  History, 
  UploadCloud, 
  Database,
  ArrowRight,
  ShieldCheck,
  Flame
} from 'lucide-react';
import { ClaimRecord } from '../types/insurance';
import { 
  getPolicyCategoryIcon, 
  getClaimTypeIcon, 
  getRiskTierIcon, 
  getStatusIcon 
} from '../utils/insuranceIcons';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  claims: ClaimRecord[];
  onSelectClaim: (claim: ClaimRecord) => void;
  onOpenGovernance: () => void;
  onOpenReports: () => void;
  onOpenAuditLogs: () => void;
  onOpenSchemaRepo: () => void;
  onOpenDocs: () => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  claims,
  onSelectClaim,
  onOpenGovernance,
  onOpenReports,
  onOpenAuditLogs,
  onOpenSchemaRepo,
  onOpenDocs,
}) => {
  const [query, setQuery] = useState('');

  // Keyboard shortcut listener for Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredClaims = query.trim()
    ? claims.filter((c) => {
        const q = query.toLowerCase();
        return (
          c.claimNumber.toLowerCase().includes(q) ||
          c.policyHolderName.toLowerCase().includes(q) ||
          c.policyNumber.toLowerCase().includes(q) ||
          (c.productCategory || '').toLowerCase().includes(q) ||
          (c.incidentCategory || '').toLowerCase().includes(q) ||
          (c.riskTier || '').toLowerCase().includes(q)
        );
      }).slice(0, 6)
    : claims.slice(0, 4);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-start justify-center pt-16 sm:pt-24 p-3 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/90 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-slideDown">
        {/* Search Bar Input */}
        <div className="p-3.5 bg-slate-950 border-b border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-indigo-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search claims by ID, policyholder, loss type, risk tier, or policy number..."
            className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800 rounded border border-slate-700">
            ESC
          </kbd>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Navigation Shortcuts */}
        <div className="p-3 bg-slate-950/60 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-[10px] uppercase font-mono text-slate-500 shrink-0 pl-1">Jump to:</span>
          <button
            onClick={() => { onClose(); onOpenGovernance(); }}
            className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <Sliders className="w-3 h-3 text-amber-400" />
            <span>Model Governance & Heatmap</span>
          </button>
          <button
            onClick={() => { onClose(); onOpenReports(); }}
            className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <FileText className="w-3 h-3 text-blue-400" />
            <span>Portfolio Reports</span>
          </button>
          <button
            onClick={() => { onClose(); onOpenAuditLogs(); }}
            className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <History className="w-3 h-3 text-emerald-400" />
            <span>Audit Trail</span>
          </button>
          <button
            onClick={() => { onClose(); onOpenDocs(); }}
            className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <ShieldCheck className="w-3 h-3 text-indigo-400" />
            <span>Compliance Specs</span>
          </button>
        </div>

        {/* Results Body */}
        <div className="p-3 max-h-96 overflow-y-auto space-y-1">
          <span className="text-[10px] uppercase font-mono text-slate-500 px-2 py-1 block">
            {query.trim() ? `Search Matches (${filteredClaims.length})` : 'Recent Priority Claims'}
          </span>

          {filteredClaims.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              No matching claims found for "{query}". Try searching by claim number (e.g. CLM-2026-8801) or loss type.
            </div>
          ) : (
            filteredClaims.map((claim) => {
              const delta = Math.abs((claim.rfRiskScore || 0.3) - claim.fraudRiskScore);
              const isDivergent = delta >= 0.12;

              return (
                <div
                  key={claim.id}
                  onClick={() => {
                    onSelectClaim(claim);
                    onClose();
                  }}
                  className="p-2.5 rounded-xl hover:bg-slate-800/80 transition cursor-pointer flex items-center justify-between gap-3 group border border-transparent hover:border-slate-700/60"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-slate-800 text-slate-300 group-hover:bg-indigo-950 group-hover:text-indigo-400 transition">
                      {getPolicyCategoryIcon(claim.productCategory || claim.policyType, { className: 'w-4 h-4' })}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white text-xs">
                          {claim.claimNumber}
                        </span>
                        <span className="text-slate-500 text-[10px]">·</span>
                        <span className="text-slate-300 text-xs truncate">
                          {claim.policyHolderName}
                        </span>
                        {isDivergent && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-800/80">
                            Model Disagreement
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono mt-0.5">
                        <span>{claim.productCategory || claim.policyType}</span>
                        <span>·</span>
                        <span>${claim.claimAmount.toLocaleString()}</span>
                        <span>·</span>
                        <span>{claim.incidentCategory || 'Incident Loss'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 text-right">
                    <div>
                      <span className="font-mono font-bold text-xs text-indigo-400 block">
                        {(claim.fraudRiskScore * 100).toFixed(0)}% Risk
                      </span>
                      <span className="text-[10px] text-slate-400 font-sans block">
                        {claim.riskTier}
                      </span>
                    </div>

                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-2.5 bg-slate-950 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span>Pro tip: Press <strong className="text-slate-300">Esc</strong> to close anytime</span>
          <span>Aegis Enterprise Search Engine</span>
        </div>
      </div>
    </div>
  );
};
