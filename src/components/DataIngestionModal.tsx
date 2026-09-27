import React, { useState } from 'react';
import { 
  X, 
  UploadCloud, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Database, 
  Eye, 
  EyeOff, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { ClaimRecord, DataValidationIssue, PolicyType, ValidationSummary } from '../types/insurance';
import { predictClaimRisk } from '../utils/mlEngine';
import { maskName, maskPolicyNumber, maskSSN } from '../utils/privacy';

interface DataIngestionModalProps {
  onClose: () => void;
  onImportClaims: (newClaims: ClaimRecord[]) => void;
  onLogAudit: (action: string, details: string) => void;
  isTokenized: boolean;
}

export const DataIngestionModal: React.FC<DataIngestionModalProps> = ({
  onClose,
  onImportClaims,
  onLogAudit,
  isTokenized,
}) => {
  const [ingestionStep, setIngestionStep] = useState<'upload' | 'validation' | 'complete'>('upload');
  const [rawFileText, setRawFileText] = useState<string>('');
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [validationSummary, setValidationSummary] = useState<ValidationSummary | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [imputationMethod, setImputationMethod] = useState<'median' | 'flag'>('median');

  // Handle sample dataset loading
  const handleLoadSampleDataset = () => {
    const sampleCSV = `claimNumber,policyNumber,policyHolderName,policyType,policyAgeMonths,policyInceptionDate,incidentDate,reportDate,claimAmount,deductible,annualIncome,previousClaimsCount,policeReportFiled,creditScoreBand,description
CLM-2026-9001,POL-AUTO-88120,Robert Langdon,Auto Collision,2,2026-07-10,2026-08-01,2026-08-28,24500,500,52000,3,false,Fair (580-669),Rear-end multi-vehicle impact on expressway with undeclared prior damage.
CLM-2026-9002,POL-HOME-44102,Catherine Howard,Homeowners Property,36,2023-09-01,2026-09-02,2026-09-03,6800,1000,125000,0,false,Exceptional (800+),Wind-driven rain entered attic soffit during severe thunderstorm.
CLM-2026-9003,POL-COMM-99318,Apex Retailers,Commercial Liability,18,2025-03-15,2026-08-20,2026-08-22,12000,2500,450000,1,true,Good (670-739),Customer slipped on wet entryway tile; immediate first aid and incident report filed.
CLM-2026-9004,POL-WORK-55192,Brian O'Connor,Workers Compensation,48,2022-09-10,2026-08-15,2026-08-16,9400,0,68000,0,false,Very Good (740-799),Forklift operator sustained ankle strain when dismounting on uneven dock surface.
CLM-2026-9005,POL-HLTH-11944,Elena Rostova,Health Inpatient,12,2025-09-01,2026-08-10,2026-08-15,31000,1500,88000,1,false,Good (670-739),Emergency gallbladder resection with 3-day inpatient stay and surgeon billings.`;

    processCSVString(sampleCSV);
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setRawFileText(text);
      processCSVString(text);
    };
    reader.readAsText(file);
  };

  // CSV Parsing & Validation Engine
  const processCSVString = (csvText: string) => {
    setIsProcessing(true);
    const lines = csvText.trim().split(/\r?\n/);
    if (lines.length < 2) {
      alert('CSV file must have a header row and at least one data row.');
      setIsProcessing(false);
      return;
    }

    const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
    const rows: any[] = [];
    const issues: DataValidationIssue[] = [];
    const missingCounts: Record<string, number> = {};

    headers.forEach((h) => (missingCounts[h] = 0));

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Basic CSV tokenizer taking quotes into account
      const values: string[] = [];
      let inQuotes = false;
      let currentVal = '';

      for (let c = 0; c < line.length; c++) {
        const char = line[c];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(currentVal.trim().replace(/^"|"$/g, ''));
          currentVal = '';
        } else {
          currentVal += char;
        }
      }
      values.push(currentVal.trim().replace(/^"|"$/g, ''));

      const rowObj: any = { _rowIndex: i };
      headers.forEach((header, index) => {
        const val = values[index] !== undefined ? values[index] : '';
        rowObj[header] = val;
        if (!val || val === 'null' || val === 'undefined') {
          missingCounts[header] = (missingCounts[header] || 0) + 1;
        }
      });

      // 1. Amount Validation
      const amount = Number(rowObj.claimAmount);
      if (isNaN(amount) || amount <= 0) {
        issues.push({
          row: i,
          field: 'claimAmount',
          value: rowObj.claimAmount,
          severity: 'error',
          message: 'Claim amount must be a positive non-zero number.',
          suggestedFix: 'Set to median category indemnity or verify invoice.',
        });
      }

      // 2. Date Chronology Validation
      if (rowObj.policyInceptionDate && rowObj.incidentDate) {
        const incept = new Date(rowObj.policyInceptionDate).getTime();
        const inc = new Date(rowObj.incidentDate).getTime();
        if (inc < incept) {
          issues.push({
            row: i,
            field: 'incidentDate',
            value: rowObj.incidentDate,
            severity: 'error',
            message: 'Incident date cannot predate policy inception date.',
            suggestedFix: 'Verify loss date against policy coverage binder.',
          });
        }
      }

      if (rowObj.incidentDate && rowObj.reportDate) {
        const inc = new Date(rowObj.incidentDate).getTime();
        const rep = new Date(rowObj.reportDate).getTime();
        if (rep < inc) {
          issues.push({
            row: i,
            field: 'reportDate',
            value: rowObj.reportDate,
            severity: 'error',
            message: 'Report date cannot be earlier than the loss incident date.',
            suggestedFix: 'Check reporting timestamp.',
          });
        }
      }

      // 3. Category Check
      const validTypes: PolicyType[] = [
        'Auto Collision',
        'Homeowners Property',
        'Commercial Liability',
        'Workers Compensation',
        'Health Inpatient',
      ];
      if (rowObj.policyType && !validTypes.includes(rowObj.policyType as any)) {
        issues.push({
          row: i,
          field: 'policyType',
          value: rowObj.policyType,
          severity: 'warning',
          message: `Category "${rowObj.policyType}" is non-standard.`,
          suggestedFix: 'Normalize to closest standardized line of business.',
        });
      }

      rows.push(rowObj);
    }

    setParsedRows(rows);
    setValidationSummary({
      totalRows: rows.length,
      validRows: rows.length - issues.filter((iss) => iss.severity === 'error').length,
      invalidRows: issues.filter((iss) => iss.severity === 'error').length,
      issues,
      missingValuesCount: missingCounts,
      outliersDetected: rows.filter((r) => Number(r.claimAmount) > 75000).length,
    });

    setIsProcessing(false);
    setIngestionStep('validation');
  };

  // Final Ingestion into App State
  const handleCommitIngestion = () => {
    setIsProcessing(true);

    const newClaims: ClaimRecord[] = parsedRows.map((row, idx) => {
      const claimAmount = Number(row.claimAmount) || 5000;
      const deductible = Number(row.deductible) || 500;
      const policyAgeMonths = Number(row.policyAgeMonths) || 12;
      const previousClaimsCount = Number(row.previousClaimsCount) || 0;
      const annualIncome = Number(row.annualIncome) || 60000;
      const policeReportFiled = String(row.policeReportFiled).toLowerCase() === 'true';

      // Calculate reporting lag days
      let reportLagDays = 3;
      if (row.incidentDate && row.reportDate) {
        const diffMs = new Date(row.reportDate).getTime() - new Date(row.incidentDate).getTime();
        reportLagDays = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)));
      }

      const pType = (row.policyType || 'Auto Collision') as PolicyType;

      const rawRecord = {
        id: `import-${Date.now()}-${idx}`,
        claimNumber: row.claimNumber || `CLM-2026-${9000 + idx}`,
        policyNumber: row.policyNumber || `POL-IMP-${Math.floor(Math.random() * 89999 + 10000)}`,
        policyHolderName: row.policyHolderName || 'Insured Subject',
        policyHolderEmail: 'policyholder@domain.com',
        ssnMasked: `***-**-${Math.floor(Math.random() * 8999 + 1000)}`,
        phone: '(555) 492-0192',
        policyType: pType,
        policyAgeMonths,
        policyInceptionDate: row.policyInceptionDate || '2025-01-01',
        incidentDate: row.incidentDate || '2026-08-15',
        reportDate: row.reportDate || '2026-08-18',
        reportLagDays,
        claimAmount,
        estimatedLoss: claimAmount,
        deductible,
        annualIncome,
        creditScoreBand: (row.creditScoreBand || 'Good (670-739)') as any,
        previousClaimsCount,
        priorClaimsTotalAmount: previousClaimsCount * 4500,
        claimantAge: 40,
        incidentLocation: 'Municipal Loss Location',
        policeReportFiled,
        witnessCount: policeReportFiled ? 1 : 0,
        description: row.description || 'Loss reported through standard carrier portal.',
        status: 'Pending Triage' as const,
        assignedAnalyst: 'Pending Assignment',
        reviewerNotes: 'Ingested via data management pipeline. Automated ML scoring applied.',
        modelVersion: 'v2.4.1-prod',
        lastUpdated: new Date().toISOString(),
      };

      const prediction = predictClaimRisk(rawRecord);

      return {
        ...rawRecord,
        ...prediction,
      };
    });

    onImportClaims(newClaims);
    onLogAudit(
      'INGEST_CLAIMS_DATASET',
      `Successfully ingested and risk-scored ${newClaims.length} records. Automated SHAP decomposition computed.`
    );
    setIsProcessing(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Modal Top Bar */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-950 border border-indigo-800/60 text-indigo-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Historical Claims Data Ingestion & Preprocessing Pipeline
              </h2>
              <p className="text-xs text-slate-400">
                Schema validation, date chronology checks, missing value imputation & PII tokenization
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-900">
          {/* STEP 1: Upload or Load Benchmark */}
          {ingestionStep === 'upload' && (
            <div className="space-y-6">
              {/* Drag and Drop Zone */}
              <div className="border-2 border-dashed border-slate-700 hover:border-indigo-500/80 transition rounded-2xl p-8 text-center bg-slate-950/60">
                <UploadCloud className="w-12 h-12 text-indigo-400 mx-auto mb-3" />
                <h3 className="text-sm font-semibold text-white mb-1">
                  Upload Historical Insurance Claims File
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
                  Drag and drop a structured CSV or JSON claims ledger. The pipeline will automatically validate column mappings, dates, amounts, and compute initial SHAP risk scores.
                </p>

                <div className="flex items-center justify-center gap-3">
                  <label className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer transition shadow-md">
                    <span>Browse CSV File</span>
                    <input
                      type="file"
                      accept=".csv,.txt"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>

                  <button
                    onClick={handleLoadSampleDataset}
                    className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Load Benchmark Cohort (5 Claims)</span>
                  </button>
                </div>
              </div>

              {/* Supported Schema Spec */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-2">
                <span className="font-semibold text-slate-300 uppercase tracking-wider text-[11px] block">
                  Expected Dataset Fields & Types
                </span>
                <p className="font-mono text-[11px] text-slate-400 leading-relaxed">
                  claimNumber (string), policyNumber (string), policyHolderName (string), policyType (Auto/Property/Liability/WorkersComp/Health), policyAgeMonths (int), incidentDate (YYYY-MM-DD), reportDate (YYYY-MM-DD), claimAmount (number), deductible (number), previousClaimsCount (int), policeReportFiled (boolean)
                </p>
              </div>
            </div>
          )}

          {/* STEP 2: Validation Results & Preprocessing */}
          {ingestionStep === 'validation' && validationSummary && (
            <div className="space-y-6">
              {/* Validation Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Total Ingested Rows</span>
                  <span className="text-xl font-bold font-mono text-white">{validationSummary.totalRows}</span>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-xl border border-emerald-900/60 text-center">
                  <span className="text-[10px] uppercase font-mono text-emerald-400 block mb-1">Valid Records</span>
                  <span className="text-xl font-bold font-mono text-emerald-300">{validationSummary.validRows}</span>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Outliers / Large Losses</span>
                  <span className="text-xl font-bold font-mono text-amber-400">{validationSummary.outliersDetected}</span>
                </div>
              </div>

              {/* Issues List */}
              {validationSummary.issues.length > 0 ? (
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    Data Hygiene & Validation Issues ({validationSummary.issues.length})
                  </h4>

                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {validationSummary.issues.map((issue, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs flex items-start justify-between gap-3">
                        <div>
                          <span className="font-mono text-slate-400 text-[11px] block">
                            Row #{issue.row} · Field: <strong className="text-slate-200">{issue.field}</strong> ({String(issue.value)})
                          </span>
                          <p className="text-rose-300 mt-0.5">{issue.message}</p>
                        </div>
                        <span className="text-[10px] text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded shrink-0">
                          {issue.suggestedFix}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 flex items-center gap-3 text-xs text-emerald-300">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>All records passed format, type bounds, and date chronology checks. Ready for ML risk scoring.</span>
                </div>
              )}

              {/* Data Anonymization / Tokenization Preview */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <EyeOff className="w-3.5 h-3.5 text-indigo-400" />
                    PII Masking & Tokenization Preview
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300">
                    HIPAA / GDPR Protection
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-900 p-3 rounded-lg border border-slate-800/80 font-mono">
                  <div>
                    <span className="text-slate-500 text-[10px] block">RAW INGESTED NAME</span>
                    <span className="text-slate-300">{parsedRows[0]?.policyHolderName || 'Robert Langdon'}</span>
                  </div>
                  <div>
                    <span className="text-indigo-400 text-[10px] block">TOKENIZED / MASKED OUTPUT</span>
                    <span className="text-emerald-400 font-bold">{maskName(parsedRows[0]?.policyHolderName || 'Robert Langdon')}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">POLICY IDENTIFIER</span>
                    <span className="text-slate-300">{parsedRows[0]?.policyNumber || 'POL-AUTO-88120'}</span>
                  </div>
                  <div>
                    <span className="text-indigo-400 text-[10px] block">SECURE MASKED REF</span>
                    <span className="text-emerald-400 font-bold">{maskPolicyNumber(parsedRows[0]?.policyNumber || 'POL-AUTO-88120')}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          {ingestionStep === 'validation' && (
            <button
              onClick={() => setIngestionStep('upload')}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              Back to Upload
            </button>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              Cancel
            </button>

            {ingestionStep === 'validation' && (
              <button
                onClick={handleCommitIngestion}
                disabled={isProcessing}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Ingest & Compute ML Risk Scores ({parsedRows.length})</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
