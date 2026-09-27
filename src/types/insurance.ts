export type PolicyType = 
  | 'Auto Collision' 
  | 'Homeowners Property' 
  | 'Health Inpatient' 
  | 'Commercial Liability' 
  | 'Workers Compensation'
  | 'Health'
  | 'Vehicle'
  | 'Life'
  | 'Property'
  | 'Travel';

export type ProductCategory = 'Health' | 'Vehicle' | 'Life' | 'Property' | 'Travel';

export type Region = 'North' | 'South' | 'East' | 'West' | 'Central';

export type SeverityCategory = 'Minor' | 'Moderate' | 'Major' | 'Catastrophic';

export type SubmissionChannel = 'Online' | 'Agent' | 'Branch' | 'Call Center';

export type ClaimStatus = 
  | 'Pending Triage' 
  | 'Fast-Track Approved' 
  | 'Standard In-Review' 
  | 'Referred to SIU' 
  | 'Documentation Requested' 
  | 'Settled' 
  | 'Denied';

export type RiskTier = 'Low' | 'Moderate' | 'Elevated' | 'Critical';

export type UserRole = 'claims_analyst' | 'risk_analyst' | 'admin';

export interface ShapContribution {
  feature: string;
  label: string;
  value: string | number;
  impact: number; // positive = pushes risk higher, negative = pushes risk lower
  description: string;
  category: 'policy' | 'loss' | 'behavior' | 'temporal';
}

export interface ClaimRecord {
  id: string;
  claimNumber: string;
  recordKey?: string; // Client schema: Synthetic unique record key; not a real claim identifier
  policyNumber: string;
  policyHolderName: string;
  policyHolderEmail: string;
  ssnMasked: string;
  phone: string;
  policyType: PolicyType;
  productCategory?: ProductCategory; // Client schema: Insurance product category
  
  // Client Schema Attributes
  region?: Region; // Client schema: Broad synthetic region category
  claimantAge: number; // Client schema: Synthetic age in years
  demographicCategory?: string; // Client schema: Synthetic demographic category; excluded from consequential decisions
  policyAgeMonths: number; // Client schema: Months since policy start
  policyTenureYears?: number; // Client schema: Policy tenure converted to years
  annualPremium?: number; // Client schema: Illustrative annual premium in INR / USD
  coverageAmount?: number; // Client schema: Illustrative coverage amount in INR / USD
  annualIncome: number;
  creditScoreBand: 'Poor (300-579)' | 'Fair (580-669)' | 'Good (670-739)' | 'Very Good (740-799)' | 'Exceptional (800+)';
  
  // Temporal & Chronology features
  policyInceptionDate: string;
  incidentDate: string;
  reportDate: string;
  reportLagDays: number; // Client schema: Days between incident and report, synthetic
  incidentMonth?: number; // Client schema: Month number 1-12
  
  // Financial & Loss features
  claimAmount: number; // Client schema: Illustrative claimed amount in INR / USD
  estimatedLoss: number;
  deductible: number;
  previousClaimsCount: number; // Client schema: Synthetic number of claims in prior 3 years
  hasPriorClaims?: number; // Client schema: 1 if prior claim count > 0, else 0
  priorClaimsTotalAmount: number;
  
  // Incident details
  incidentCategory?: string; // Client schema: Synthetic incident category
  severityCategory?: SeverityCategory; // Client schema: Synthetic severity category
  incidentLocation: string;
  policeReportFiled: boolean;
  witnessCount: number;
  description: string;
  documentationComplete?: number; // Client schema: 1 means documentation marked complete; 0 incomplete
  fraudFlagDemo?: boolean | number; // Client schema: Artificially generated demo flag
  policyLapseIndicator?: boolean | number; // Client schema: Synthetic indicator of policy lapse
  submissionChannel?: SubmissionChannel; // Client schema: Submission channel (Online, Agent, Branch, Call Center)
  
  // Specialized Domain Fields
  vehicleAge?: number; // Client schema: Vehicle age for vehicle policies; zero otherwise
  hospitalStayDays?: number; // Client schema: Hospital stay days for health policies; zero otherwise
  damageLevel?: string; // Client schema: Damage level for property policies; not applicable otherwise
  classificationLabel?: 'Flag_for_Review' | 'Standard_Review'; // Client schema: Synthetic classification label
  workflowStatus?: string; // Client schema: Synthetic workflow status for dashboard demonstrations
  
  // ML Risk Outputs - Primary XGBoost Model (Champion)
  fraudRiskScore: number; // 0.00 to 1.00 (XGBoost)
  riskTier: RiskTier;
  expectedLossSeverity: number;
  anomalyFlags: string[];
  shapContributions: ShapContribution[];
  shapBaseValue: number; // e.g. 0.28 (population average)
  
  // ML Risk Outputs - Secondary Random Forest Model (Challenger)
  rfRiskScore: number; // 0.00 to 1.00 (Random Forest)
  rfRiskTier: RiskTier;
  modelDivergence: number; // (rfRiskScore - fraudRiskScore)
  modelAgreement: boolean; // true if both models agree on high risk or low risk
  divergenceReason?: string; // Explanation of why the models diverged
  
  // Workflow & Decision Governance
  status: ClaimStatus;
  assignedAnalyst?: string;
  reviewerNotes?: string;
  analystDecision?: {
    action: ClaimStatus;
    analystName: string;
    role: UserRole;
    timestamp: string;
    rationale: string;
    recommendedPayout?: number;
  };
  modelVersion: string;
  lastUpdated: string;
  isTokenized?: boolean;
}

export interface ModelMetrics {
  modelName: string;
  modelVersion: string;
  modelType: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  rocAuc: number;
  prAuc: number;
  brierScore: number;
  inferenceLatencyMs?: number;
  treeCount?: number;
  confusionMatrix: {
    tp: number;
    fp: number;
    tn: number;
    fn: number;
  };
  sampleSize: number;
  trainedAt: string;
  thresholdHighRisk: number;
  thresholdFastTrack: number;
  status: 'champion' | 'challenger' | 'archived';
}

export interface CohortDivergence {
  cohortName: string;
  cohortType: 'product' | 'region' | 'severity' | 'tenure' | 'channel';
  count: number;
  avgXgbScore: number;
  avgRfScore: number;
  scoreDelta: number; // avgRfScore - avgXgbScore
  divergentClaimsCount: number; // count where |xgb - rf| >= 0.12
  disagreementRate: number; // % where models placed claim in different risk tiers
}

export interface FeatureImportanceItem {
  feature: string;
  displayName: string;
  importance: number; // 0 to 1
  category: 'policy' | 'loss' | 'behavior' | 'temporal';
  correlationDirection: 'positive' | 'negative' | 'non-linear';
  description: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  role: UserRole;
  action: string;
  claimId?: string;
  claimNumber?: string;
  details: string;
  previousValue?: string;
  newValue?: string;
}

export interface DataValidationIssue {
  row: number;
  field: string;
  value: any;
  severity: 'error' | 'warning';
  message: string;
  suggestedFix?: string;
}

export interface ValidationSummary {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  issues: DataValidationIssue[];
  missingValuesCount: Record<string, number>;
  outliersDetected: number;
}

export interface GeminiAnalysisResult {
  executiveSummary: string;
  riskLevel: 'Low' | 'Moderate' | 'Elevated' | 'High';
  confidenceScore: number;
  redFlags: string[];
  mitigatingFactors: string[];
  recommendedAction: string;
  suggestedQuestions: string[];
  actuarialNote: string;
  disclaimer: string;
}
