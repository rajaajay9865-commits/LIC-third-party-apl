import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  FileText, 
  Sparkles, 
  Sliders, 
  History, 
  Send, 
  User, 
  Calendar, 
  DollarSign, 
  Scale, 
  RefreshCw,
  Printer,
  ChevronDown,
  ArrowRight,
  ShieldCheck,
  Building
} from 'lucide-react';
import { ClaimRecord, ClaimStatus, GeminiAnalysisResult, UserRole } from '../types/insurance';
import { predictClaimRisk, BASELINE_POPULATION_RISK } from '../utils/mlEngine';
import { maskName, maskPolicyNumber, maskSSN, maskPhone, maskEmail } from '../utils/privacy';

interface ClaimDetailWorkbenchProps {
  claim: ClaimRecord;
  onClose: () => void;
  onUpdateClaim: (updated: ClaimRecord, logMessage: string) => void;
  currentUserRole: UserRole;
  isTokenized: boolean;
}

export const ClaimDetailWorkbench: React.FC<ClaimDetailWorkbenchProps> = ({
  claim,
  onClose,
  onUpdateClaim,
  currentUserRole,
  isTokenized,
}) => {
  const [activeTab, setActiveTab] = useState<'xai' | 'gemini' | 'whatif' | 'chronology' | 'adjudicate'>('xai');
  
  // Gemini AI Analysis State
  const [geminiResult, setGeminiResult] = useState<GeminiAnalysisResult | null>(null);
  const [geminiLoading, setGeminiLoading] = useState(false);
  const [geminiSource, setGeminiSource] = useState<string>('');

  // What-If Simulator State
  const [simClaimAmount, setSimClaimAmount] = useState(claim.claimAmount);
  const [simDeductible, setSimDeductible] = useState(claim.deductible);
  const [simPolicyAge, setSimPolicyAge] = useState(claim.policyAgeMonths);
  const [simPriorClaims, setSimPriorClaims] = useState(claim.previousClaimsCount);
  const [simPoliceReport, setSimPoliceReport] = useState(claim.policeReportFiled);
  const [simLagDays, setSimLagDays] = useState(claim.reportLagDays);

  // Adjudication Form State
  const [actionDecision, setActionDecision] = useState<ClaimStatus>(claim.status);
  const [reviewerNotes, setReviewerNotes] = useState(claim.reviewerNotes || '');
  const [recommendedPayout, setRecommendedPayout] = useState(claim.expectedLossSeverity || claim.claimAmount);
  const [isSubmittingDecision, setIsSubmittingDecision] = useState(false);

  // Reset what-if simulation when claim changes
  useEffect(() => {
    setSimClaimAmount(claim.claimAmount);
    setSimDeductible(claim.deductible);
    setSimPolicyAge(claim.policyAgeMonths);
    setSimPriorClaims(claim.previousClaimsCount);
    setSimPoliceReport(claim.policeReportFiled);
    setSimLagDays(claim.reportLagDays);
    setActionDecision(claim.status);
    setReviewerNotes(claim.reviewerNotes || '');
    setRecommendedPayout(claim.expectedLossSeverity || claim.claimAmount);
    setGeminiResult(null);
  }, [claim]);

  // Compute what-if simulation prediction
  const simulatedPrediction = predictClaimRisk({
    ...claim,
    claimAmount: simClaimAmount,
    deductible: simDeductible,
    policyAgeMonths: simPolicyAge,
    previousClaimsCount: simPriorClaims,
    policeReportFiled: simPoliceReport,
    reportLagDays: simLagDays,
  });

  const riskDelta = Number((simulatedPrediction.fraudRiskScore - claim.fraudRiskScore).toFixed(3));

  // Fallback actuarial engine if backend service is unreachable or in static hosting
  const generateClientFallbackAnalysis = (targetClaim: ClaimRecord): GeminiAnalysisResult => {
    const isHighRisk = (targetClaim.fraudRiskScore || 0) > 0.65;
    const isEarlyClaim = (targetClaim.policyAgeMonths || 0) < 3;
    const highLag = (targetClaim.reportLagDays || 0) > 21;
    const priorClaims = (targetClaim.previousClaimsCount || 0) >= 2;

    const redFlags: string[] = [];
    const mitigatingFactors: string[] = [];

    if (isEarlyClaim) redFlags.push(`Short policy inception latency (${targetClaim.policyAgeMonths || 1} months since policy binding)`);
    if (highLag) redFlags.push(`Delayed reporting lag of ${targetClaim.reportLagDays || 0} days from incident`);
    if (priorClaims) redFlags.push(`Elevated frequency pattern (${targetClaim.previousClaimsCount} previous claims in 36 months)`);
    if ((targetClaim.claimAmount || 0) > 25000) redFlags.push(`Substantial single-event loss indemnity requested ($${targetClaim.claimAmount?.toLocaleString()})`);

    if (!isEarlyClaim) mitigatingFactors.push(`Established policy tenure with over ${targetClaim.policyAgeMonths || 12} continuous months`);
    if (!priorClaims) mitigatingFactors.push('Clean claimant loss history with zero suspicious prior indemnities');
    if ((targetClaim.deductible || 0) >= 1000) mitigatingFactors.push(`Significant claimant deductible skin-in-the-game ($${targetClaim.deductible})`);
    if (redFlags.length === 0) mitigatingFactors.push('Loss pattern is consistent with standard actuarial baseline for this line of business.');

    const calculatedRiskLevel: 'Elevated' | 'Moderate' | 'Low' = isHighRisk 
      ? 'Elevated' 
      : ((targetClaim.fraudRiskScore || 0) > 0.35 ? 'Moderate' : 'Low');

    return {
      executiveSummary: `Automated assessment for claim ${targetClaim.claimNumber || 'REC-001'} (${targetClaim.policyType || 'Property'}). The claim presents ${isHighRisk ? 'elevated' : 'controlled'} exposure with a calculated risk probability of ${Math.round((targetClaim.fraudRiskScore || 0.3) * 100)}%. ${isHighRisk ? 'Multiple anomaly indicators require manual examiner review.' : 'Loss parameters are consistent with policy provisions.'}`,
      riskLevel: calculatedRiskLevel,
      confidenceScore: 0.89,
      redFlags: redFlags.length > 0 ? redFlags : ['No critical discrepancy flags triggered at baseline threshold.'],
      mitigatingFactors: mitigatingFactors.length > 0 ? mitigatingFactors : ['Active policy status verified.'],
      recommendedAction: isHighRisk
        ? 'Route to Special Investigation Unit (SIU) for independent evidence verification and witness statement.'
        : 'Approve for expedited digital settlement pending proof of loss receipt.',
      suggestedQuestions: [
        'Can the policyholder provide original repair estimates and time-stamped digital photographic evidence?',
        'Has an official municipal police/fire or incident report been logged and submitted?'
      ],
      actuarialNote: `Expected indemnity severity is estimated at $${Math.round((targetClaim.claimAmount || 5000) * 0.85).toLocaleString()} net of standard depreciation.`,
      disclaimer: 'This output is an AI decision-support recommendation and does not replace human underwriting or legal claims adjudication.'
    };
  };

  // Call Gemini AI Forensic API
  const handleRunGeminiAnalysis = async () => {
    setGeminiLoading(true);
    try {
      const res = await fetch('/api/ai/analyze-claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          claim: {
            ...claim,
            policyHolderName: isTokenized ? maskName(claim.policyHolderName) : claim.policyHolderName,
          },
          context: `Role: ${currentUserRole}. Claims Decision Support Review.`
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.analysis) {
          setGeminiResult(data.analysis);
          setGeminiSource(data.source || 'ai-service');
          return;
        }
      }
      // If endpoint returned non-200 or not reachable, use client fallback
      const fallback = generateClientFallbackAnalysis(claim);
      setGeminiResult(fallback);
      setGeminiSource('client_actuarial_engine');
    } catch (err) {
      console.warn('API fallback to local actuarial analysis engine:', err);
      const fallback = generateClientFallbackAnalysis(claim);
      setGeminiResult(fallback);
      setGeminiSource('client_actuarial_engine');
    } finally {
      setGeminiLoading(false);
    }
  };

  // Submit Adjudication Decision
  const handleCommitDecision = () => {
    setIsSubmittingDecision(true);
    const analystName = currentUserRole === 'admin' 
      ? 'Chief Risk Officer (Executive Review)' 
      : currentUserRole === 'risk_analyst'
      ? 'Risk & Fraud Specialist'
      : 'Senior Claims Examiner';

    const updated: ClaimRecord = {
      ...claim,
      status: actionDecision,
      reviewerNotes,
      assignedAnalyst: analystName,
      analystDecision: {
        action: actionDecision,
        analystName,
        role: currentUserRole,
        timestamp: new Date().toISOString(),
        rationale: reviewerNotes || `Case adjudicated to ${actionDecision} under standard operating guidelines.`,
        recommendedPayout,
      },
      lastUpdated: new Date().toISOString(),
    };

    onUpdateClaim(
      updated,
      `Adjudicated status changed to "${actionDecision}". Recommended indemnity: $${recommendedPayout.toLocaleString()}. Rationale: "${reviewerNotes.slice(0, 50)}..."`
    );

    setIsSubmittingDecision(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Modal Top Bar */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm px-2.5 py-1 rounded bg-slate-800 text-indigo-300 font-bold border border-slate-700">
              {claim.claimNumber}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Analyst Decision Support Workbench
                </h2>
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs text-slate-300 font-mono">
                  {claim.policyType}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Policy: {isTokenized ? maskPolicyNumber(claim.policyNumber) : claim.policyNumber} · 
                Holder: {isTokenized ? maskName(claim.policyHolderName) : claim.policyHolderName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs flex items-center gap-1.5 transition"
              title="Print Case File Dossier"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print File</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
              title="Close Workbench"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sub-header: Executive Risk Assessment Banner */}
        <div className="bg-slate-900/90 px-6 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            {/* Primary XGBoost Risk Gauge */}
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center">
                <span className={`text-xl font-bold font-mono tracking-tight ${
                  claim.riskTier === 'Critical' 
                    ? 'text-rose-400' 
                    : claim.riskTier === 'Elevated' 
                    ? 'text-amber-400' 
                    : claim.riskTier === 'Moderate'
                    ? 'text-blue-400'
                    : 'text-emerald-400'
                }`}>
                  {(claim.fraudRiskScore * 100).toFixed(1)}%
                </span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
                    XGBoost v2.4 ({claim.riskTier})
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-indigo-950 text-indigo-300 border border-indigo-800">
                    Champion
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Population Baseline: {(BASELINE_POPULATION_RISK * 100).toFixed(0)}%
                </p>
              </div>
            </div>

            {/* Challenger Random Forest Comparative Score */}
            <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-slate-800">
              <div className="relative flex items-center justify-center">
                <span className={`text-xl font-bold font-mono tracking-tight ${
                  (claim.rfRiskScore || 0.3) >= 0.82
                    ? 'text-rose-400'
                    : (claim.rfRiskScore || 0.3) >= 0.65
                    ? 'text-amber-400'
                    : (claim.rfRiskScore || 0.3) >= 0.30
                    ? 'text-blue-400'
                    : 'text-emerald-400'
                }`}>
                  {((claim.rfRiskScore || 0.3) * 100).toFixed(1)}%
                </span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
                    Random Forest ({claim.rfRiskTier || 'Low'})
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-slate-800 text-slate-300 border border-slate-700">
                    Challenger
                  </span>
                </div>
                <p className="text-[11px] font-mono text-slate-400">
                  Divergence: <span className={Math.abs((claim.rfRiskScore || 0.3) - claim.fraudRiskScore) >= 0.1 ? 'text-amber-400 font-bold' : 'text-emerald-400'}>
                    {((claim.rfRiskScore || 0.3) - claim.fraudRiskScore) >= 0 ? '+' : ''}
                    {(((claim.rfRiskScore || 0.3) - claim.fraudRiskScore) * 100).toFixed(1)}%
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-6 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-mono">Claim Indemnity</span>
              <span className="font-mono font-bold text-white text-sm">${claim.claimAmount.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-mono">Expected Severity</span>
              <span className="font-mono font-semibold text-slate-200 text-sm">${claim.expectedLossSeverity?.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-mono">Current Status</span>
              <span className={`inline-block font-mono text-xs font-semibold ${
                claim.status === 'Fast-Track Approved' ? 'text-emerald-400' :
                claim.status === 'Referred to SIU' ? 'text-rose-400' : 'text-amber-400'
              }`}>
                {claim.status}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-950 px-6 border-b border-slate-800 flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('xai')}
            className={`py-3 px-3 text-xs font-medium border-b-2 flex items-center gap-2 transition ${
              activeTab === 'xai'
                ? 'border-indigo-500 text-white font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Scale className="w-3.5 h-3.5 text-indigo-400" />
            <span>SHAP & Explainable AI</span>
          </button>

          <button
            onClick={() => setActiveTab('gemini')}
            className={`py-3 px-3 text-xs font-medium border-b-2 flex items-center gap-2 transition ${
              activeTab === 'gemini'
                ? 'border-indigo-500 text-white font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Gemini AI Co-Pilot</span>
            {geminiResult && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('whatif')}
            className={`py-3 px-3 text-xs font-medium border-b-2 flex items-center gap-2 transition ${
              activeTab === 'whatif'
                ? 'border-indigo-500 text-white font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-blue-400" />
            <span>What-If Scenario Simulator</span>
          </button>

          <button
            onClick={() => setActiveTab('chronology')}
            className={`py-3 px-3 text-xs font-medium border-b-2 flex items-center gap-2 transition ${
              activeTab === 'chronology'
                ? 'border-indigo-500 text-white font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span>Loss Dossier & Coverage</span>
          </button>

          <button
            onClick={() => setActiveTab('adjudicate')}
            className={`py-3 px-3 text-xs font-medium border-b-2 flex items-center gap-2 transition ml-auto ${
              activeTab === 'adjudicate'
                ? 'border-indigo-500 text-white font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-emerald-400 font-semibold">Adjudication Action</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-900">
          {/* TAB 1: SHAP & EXPLAINABLE AI */}
          {activeTab === 'xai' && (
            <div className="space-y-6">
              {/* Mandatory Legal Disclaimer */}
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-start gap-2.5 text-xs text-slate-400">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-200">Algorithmic Decision Support Notice:</strong> Machine learning risk scoring provides transparent statistical attribution based on historical actuarial cohorts. It identifies anomalies and pattern deviations to guide human claim adjudication and does not constitute an automated claim denial.
                </div>
              </div>

              {/* Anomaly Vectors Callout if triggered */}
              {claim.anomalyFlags && claim.anomalyFlags.length > 0 && (
                <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 space-y-2">
                  <div className="flex items-center gap-2 text-rose-300 text-xs font-semibold uppercase tracking-wider">
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                    <span>{claim.anomalyFlags.length} Automated Anomaly Vectors Detected</span>
                  </div>
                  <ul className="space-y-1.5 pl-6 list-disc text-xs text-rose-200/90 leading-relaxed">
                    {claim.anomalyFlags.map((flag, idx) => (
                      <li key={idx}>{flag}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* SHAP Waterfall Attribution Breakdown */}
              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
                      <span>SHAP Local Feature Attribution (Waterfall Decomposition)</span>
                      <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-indigo-950 text-indigo-300 border border-indigo-800">
                        Shapley Values: f(x) = E[f(x)] + ∑ φᵢ
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Quantifies the marginal push of each feature relative to prior baseline ({(BASELINE_POPULATION_RISK * 100).toFixed(0)}%).
                    </p>
                  </div>
                </div>

                {/* Attribution Bars */}
                <div className="space-y-3 pt-2">
                  {claim.shapContributions && claim.shapContributions.map((shap, i) => {
                    const isPositive = shap.impact > 0;
                    const barWidth = Math.min(100, Math.round(Math.abs(shap.impact) * 220));

                    return (
                      <div key={i} className="p-3 rounded-lg bg-slate-900 border border-slate-800/80">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-200">{shap.label}</span>
                            <span className="font-mono text-slate-400 text-[11px]">({shap.value})</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`font-mono font-bold text-xs ${
                              isPositive ? 'text-rose-400' : 'text-emerald-400'
                            }`}>
                              {isPositive ? `+${(shap.impact * 100).toFixed(1)}%` : `${(shap.impact * 100).toFixed(1)}%`}
                            </span>
                            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                              {isPositive ? 'Increases Risk' : 'Mitigates Risk'}
                            </span>
                          </div>
                        </div>

                        {/* Bar Visualizer */}
                        <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden flex">
                          {isPositive ? (
                            <div 
                              className="bg-rose-500 h-full rounded-full transition-all duration-500 ml-auto"
                              style={{ width: `${barWidth}%` }}
                            />
                          ) : (
                            <div 
                              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                              style={{ width: `${barWidth}%` }}
                            />
                          )}
                        </div>

                        <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                          {shap.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GEMINI AI CO-PILOT */}
          {activeTab === 'gemini' && (
            <div className="space-y-6">
              {/* Header Action Card */}
              <div className="bg-gradient-to-r from-indigo-950/60 to-slate-950 p-5 rounded-xl border border-indigo-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-sm font-bold text-white">Gemini 3.8 Flash Insurance Forensic Assessment</h3>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-xl">
                    Deep linguistic and cross-variable risk audit. Examines incident narrative consistency, timeline feasibility, discrepancy patterns, and drafts human examiner investigation notes.
                  </p>
                </div>

                <button
                  onClick={handleRunGeminiAnalysis}
                  disabled={geminiLoading}
                  className="px-4 py-2.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white flex items-center justify-center gap-2 transition shadow-md shrink-0 cursor-pointer"
                >
                  {geminiLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Synthesizing Forensic Audit...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>{geminiResult ? 'Re-Run Forensic Review' : 'Run Gemini Assessment'}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Gemini Results Display */}
              {geminiResult ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                    <span>Source: {geminiSource}</span>
                    <span>Confidence Score: {(geminiResult.confidenceScore * 100).toFixed(0)}%</span>
                  </div>

                  {/* Executive Summary */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-indigo-300 mb-2">
                      Forensic Executive Summary
                    </h4>
                    <p className="text-xs text-slate-200 leading-relaxed font-sans">
                      {geminiResult.executiveSummary}
                    </p>
                  </div>

                  {/* Red Flags & Mitigating Factors Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Red Flags */}
                    <div className="bg-slate-950 p-4 rounded-xl border border-rose-900/40">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-rose-400 mb-2 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Key Discrepancy & Fraud Indicators
                      </h4>
                      <ul className="space-y-2 text-xs text-slate-300">
                        {geminiResult.redFlags?.map((rf, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                            <span>{rf}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Mitigating Factors */}
                    <div className="bg-slate-950 p-4 rounded-xl border border-emerald-900/40">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Corroborating & Mitigating Factors
                      </h4>
                      <ul className="space-y-2 text-xs text-slate-300">
                        {geminiResult.mitigatingFactors?.map((mf, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                            <span>{mf}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Clarification Questions to Claimant */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-300 mb-2 flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5" />
                      Suggested Examiner Clarification Inquiries
                    </h4>
                    <ul className="space-y-2 text-xs text-slate-300">
                      {geminiResult.suggestedQuestions?.map((q, idx) => (
                        <li key={idx} className="flex items-start gap-2 bg-slate-900 p-2.5 rounded-lg border border-slate-800/80">
                          <span className="font-mono text-amber-400 font-bold shrink-0">Q{idx + 1}:</span>
                          <span>{q}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Recommended Action & Actuarial Reserve */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-indigo-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-1">
                        Recommended Examiner Course of Action
                      </h4>
                      <p className="text-xs text-slate-200 font-medium">
                        {geminiResult.recommendedAction}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        {geminiResult.actuarialNote}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setActiveTab('adjudicate');
                        setReviewerNotes(prev => `${prev ? prev + '\n\n' : ''}[AI Forensic Summary]: ${geminiResult.recommendedAction}. ${geminiResult.executiveSummary}`);
                      }}
                      className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shrink-0 transition"
                    >
                      Apply to Adjudication Notes
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center bg-slate-950 rounded-xl border border-slate-800/80 p-8 space-y-3">
                  <Sparkles className="w-10 h-10 text-indigo-500/60 mx-auto" />
                  <h4 className="text-sm font-semibold text-slate-200">
                    No Forensic AI Assessment Generated Yet
                  </h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Click "Run Gemini Assessment" above to generate a real-time risk synthesis, discrepancy checks, and inquiry guidelines for this claim.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: WHAT-IF SCENARIO SIMULATOR */}
          {activeTab === 'whatif' && (
            <div className="space-y-6">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-tight">
                      Interactive Underwriting Sensitivity & What-If Simulator
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Simulate adjustments to loss amount, deductible, reporting latency, and prior frequency to test risk elasticities in real-time.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setSimClaimAmount(claim.claimAmount);
                      setSimDeductible(claim.deductible);
                      setSimPolicyAge(claim.policyAgeMonths);
                      setSimPriorClaims(claim.previousClaimsCount);
                      setSimPoliceReport(claim.policeReportFiled);
                      setSimLagDays(claim.reportLagDays);
                    }}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-mono underline"
                  >
                    Reset Baseline Values
                  </button>
                </div>
              </div>

              {/* Real-time Simulator Comparison Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
                  <span className="text-[11px] uppercase font-mono text-slate-400 block mb-1">Baseline Model Risk</span>
                  <span className="text-2xl font-mono font-bold text-slate-200">
                    {(claim.fraudRiskScore * 100).toFixed(1)}%
                  </span>
                  <span className="text-xs text-slate-400 block mt-1 font-mono">{claim.riskTier}</span>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-indigo-800/80 text-center relative overflow-hidden">
                  <span className="text-[11px] uppercase font-mono text-indigo-400 block mb-1">Simulated Dynamic Risk</span>
                  <span className={`text-2xl font-mono font-bold ${
                    simulatedPrediction.riskTier === 'Critical' ? 'text-rose-400' :
                    simulatedPrediction.riskTier === 'Elevated' ? 'text-amber-400' :
                    simulatedPrediction.riskTier === 'Moderate' ? 'text-blue-400' : 'text-emerald-400'
                  }`}>
                    {(simulatedPrediction.fraudRiskScore * 100).toFixed(1)}%
                  </span>
                  <span className="text-xs text-indigo-300 block mt-1 font-mono">{simulatedPrediction.riskTier}</span>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
                  <span className="text-[11px] uppercase font-mono text-slate-400 block mb-1">Risk Variance (Delta)</span>
                  <span className={`text-2xl font-mono font-bold ${
                    riskDelta > 0 ? 'text-rose-400' : riskDelta < 0 ? 'text-emerald-400' : 'text-slate-400'
                  }`}>
                    {riskDelta > 0 ? `+${(riskDelta * 100).toFixed(1)}%` : `${(riskDelta * 100).toFixed(1)}%`}
                  </span>
                  <span className="text-xs text-slate-400 block mt-1">
                    {riskDelta > 0 ? 'Risk Elevated' : riskDelta < 0 ? 'Risk Reduced' : 'No Change'}
                  </span>
                </div>
              </div>

              {/* Slider Controls */}
              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-5">
                {/* Claim Amount Slider */}
                <div>
                  <div className="flex justify-between items-center text-xs mb-1.5">
                    <label className="font-semibold text-slate-200">Claim Indemnity Amount</label>
                    <span className="font-mono font-bold text-indigo-400 text-sm">${simClaimAmount.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="1000"
                    max="100000"
                    step="500"
                    value={simClaimAmount}
                    onChange={(e) => setSimClaimAmount(Number(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                    <span>$1,000</span>
                    <span>$50,000</span>
                    <span>$100,000</span>
                  </div>
                </div>

                {/* Deductible Slider */}
                <div>
                  <div className="flex justify-between items-center text-xs mb-1.5">
                    <label className="font-semibold text-slate-200">Policy Deductible</label>
                    <span className="font-mono font-bold text-indigo-400 text-sm">${simDeductible.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    step="250"
                    value={simDeductible}
                    onChange={(e) => setSimDeductible(Number(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                    <span>$0</span>
                    <span>$5,000</span>
                    <span>$10,000</span>
                  </div>
                </div>

                {/* Policy Age (Tenure) Slider */}
                <div>
                  <div className="flex justify-between items-center text-xs mb-1.5">
                    <label className="font-semibold text-slate-200">Policy Tenure (Active Months)</label>
                    <span className="font-mono font-bold text-indigo-400 text-sm">{simPolicyAge} months</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="72"
                    step="1"
                    value={simPolicyAge}
                    onChange={(e) => setSimPolicyAge(Number(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                    <span>1 month (Inception Risk)</span>
                    <span>36 months</span>
                    <span>72 months (Loyal)</span>
                  </div>
                </div>

                {/* Reporting Notice Lag Days */}
                <div>
                  <div className="flex justify-between items-center text-xs mb-1.5">
                    <label className="font-semibold text-slate-200">Notice Lag Days (Incident to Report)</label>
                    <span className="font-mono font-bold text-indigo-400 text-sm">{simLagDays} days</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="60"
                    step="1"
                    value={simLagDays}
                    onChange={(e) => setSimLagDays(Number(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                </div>

                {/* Toggles: Prior Claims & Police Report */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
                  <div>
                    <label className="font-semibold text-slate-200 text-xs block mb-1.5">Prior 3-Year Claims</label>
                    <select
                      value={simPriorClaims}
                      onChange={(e) => setSimPriorClaims(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                    >
                      <option value={0}>0 Prior Claims (Clean History)</option>
                      <option value={1}>1 Prior Claim</option>
                      <option value={2}>2 Prior Claims</option>
                      <option value={3}>3 Prior Claims (High Frequency)</option>
                      <option value={4}>4+ Prior Claims (Habitual)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-200 text-xs block mb-1.5">Official Police/Fire Report</label>
                    <select
                      value={simPoliceReport ? 'true' : 'false'}
                      onChange={(e) => setSimPoliceReport(e.target.value === 'true')}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                    >
                      <option value="true">Yes - Official Report Filed & Verified</option>
                      <option value="false">No - No Law Enforcement Report</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: LOSS DOSSIER & CHRONOLOGY */}
          {activeTab === 'chronology' && (
            <div className="space-y-6">
              {/* Incident Description */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  First Notice of Loss (FNOL) Description
                </h4>
                <p className="text-xs text-slate-200 leading-relaxed italic bg-slate-900 p-3 rounded-lg border border-slate-800">
                  "{claim.description}"
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-400">
                  <span>Location: <strong className="text-white">{claim.incidentLocation}</strong></span>
                  <span>·</span>
                  <span>Police Report: <strong className={claim.policeReportFiled ? 'text-emerald-400' : 'text-rose-400'}>
                    {claim.policeReportFiled ? 'Filed & Verified' : 'None Filed'}
                  </strong></span>
                  <span>·</span>
                  <span>Witnesses: <strong className="text-white">{claim.witnessCount}</strong></span>
                </div>
              </div>

              {/* Policyholder Financial & Demographic Profile */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                  Policyholder & Underwriting Profile
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-mono">Claimant</span>
                    <span className="font-semibold text-white">
                      {isTokenized ? maskName(claim.policyHolderName) : claim.policyHolderName}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-mono">Tax / SSN</span>
                    <span className="font-mono text-slate-300">
                      {isTokenized ? maskSSN(claim.ssnMasked) : claim.ssnMasked}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-mono">Stated Income</span>
                    <span className="font-mono text-slate-300">${claim.annualIncome?.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-mono">Credit Band</span>
                    <span className="font-mono text-slate-300">{claim.creditScoreBand}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-mono">Inception Date</span>
                    <span className="font-mono text-slate-300">{claim.policyInceptionDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-mono">Incident Date</span>
                    <span className="font-mono text-slate-300">{claim.incidentDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-mono">Report Date</span>
                    <span className="font-mono text-slate-300">{claim.reportDate} ({claim.reportLagDays}d lag)</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-mono">Prior Claims ($)</span>
                    <span className="font-mono text-slate-300">{claim.previousClaimsCount} (${claim.priorClaimsTotalAmount?.toLocaleString()})</span>
                  </div>
                </div>
              </div>

              {/* Reviewer Historical Notes */}
              {claim.reviewerNotes && (
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Claims Adjuster Audit Trail Log
                  </h4>
                  <p className="text-xs text-slate-300 font-mono whitespace-pre-wrap bg-slate-900 p-3 rounded-lg border border-slate-800">
                    {claim.reviewerNotes}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: ADJUDICATION ACTION WORKBENCH */}
          {activeTab === 'adjudicate' && (
            <div className="space-y-6">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Human Claim Adjudication & Action Center
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Record final human underwriting / claims decision. This logs an immutable audit trail entry with your identity and role ({currentUserRole}).
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Decision Action Selection */}
                <div className="space-y-4">
                  <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider block">
                    Select Adjudication Action
                  </label>

                  <div className="space-y-2">
                    {[
                      {
                        action: 'Fast-Track Approved' as ClaimStatus,
                        label: 'Fast-Track Approved (Direct Settlement)',
                        desc: 'Approved for automated straight-through payment.',
                        color: 'border-emerald-600 bg-emerald-950/40 text-emerald-300'
                      },
                      {
                        action: 'Standard In-Review' as ClaimStatus,
                        label: 'Standard In-Review (Manual Processing)',
                        desc: 'Assigned to line adjuster for loss appraisal.',
                        color: 'border-blue-600 bg-blue-950/40 text-blue-300'
                      },
                      {
                        action: 'Documentation Requested' as ClaimStatus,
                        label: 'Request Corroborating Records',
                        desc: 'Formal request for police blotter, medical records, or receipts.',
                        color: 'border-amber-600 bg-amber-950/40 text-amber-300'
                      },
                      {
                        action: 'Referred to SIU' as ClaimStatus,
                        label: 'Escalate to Special Investigation Unit (SIU)',
                        desc: 'Freeze indemnity pending forensic anti-fraud inquiry.',
                        color: 'border-rose-600 bg-rose-950/40 text-rose-300'
                      },
                      {
                        action: 'Denied' as ClaimStatus,
                        label: 'Deny Claim (Exclusion / Fraud)',
                        desc: 'Formal declination of coverage with statutory notice.',
                        color: 'border-red-700 bg-red-950/50 text-red-300'
                      },
                    ].map((item) => (
                      <div
                        key={item.action}
                        onClick={() => setActionDecision(item.action)}
                        className={`p-3 rounded-xl border cursor-pointer transition flex items-start gap-3 ${
                          actionDecision === item.action
                            ? `${item.color} shadow-sm ring-1 ring-white/10`
                            : 'border-slate-800 bg-slate-950 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        <div className="w-4 h-4 rounded-full border border-slate-600 flex items-center justify-center shrink-0 mt-0.5">
                          {actionDecision === item.action && (
                            <div className="w-2 h-2 rounded-full bg-indigo-400" />
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-semibold">{item.label}</div>
                          <div className="text-[11px] text-slate-400 mt-0.5">{item.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes and Settlement Amount */}
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider block mb-1">
                      Recommended Indemnity Settlement ($)
                    </label>
                    <input
                      type="number"
                      value={recommendedPayout}
                      onChange={(e) => setRecommendedPayout(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-sm font-mono text-white focus:outline-none focus:border-indigo-500"
                    />
                    <span className="text-[11px] text-slate-500 font-mono mt-1 block">
                      Original claim: ${claim.claimAmount.toLocaleString()} · Deductible: ${claim.deductible}
                    </span>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider block mb-1">
                      Examiner Rationale & Audit Notes
                    </label>
                    <textarea
                      rows={5}
                      value={reviewerNotes}
                      onChange={(e) => setReviewerNotes(e.target.value)}
                      placeholder="Enter legal rationale, corroborating evidence references, interview summaries, or SIU referral justification..."
                      className="w-full px-3 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 leading-relaxed font-sans"
                    />
                  </div>

                  <button
                    onClick={handleCommitDecision}
                    disabled={isSubmittingDecision}
                    className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs transition flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Commit Adjudication Decision</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-mono text-[11px]">Audit Engine Active · Real-time Model Inference</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
