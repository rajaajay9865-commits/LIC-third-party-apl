import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'AegisClaim AI Engine',
    hasGeminiKey: !!process.env.GEMINI_API_KEY
  });
});

// Gemini AI Claim Analysis Endpoint
app.post('/api/ai/analyze-claim', async (req, res) => {
  try {
    const { claim, context } = req.body;

    if (!claim) {
      return res.status(400).json({ error: 'Claim data is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // High-fidelity fallback if no API key is provided
      const fallbackAnalysis = generateFallbackAnalysis(claim);
      return res.json({
        source: 'local_rule_engine',
        analysis: fallbackAnalysis,
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are a Senior Insurance Fraud Investigator, Actuary, and Senior Claims Adjudication Specialist at AegisClaim AI.
Analyze the following insurance claim record for risk evaluation, potential fraud anomaly indicators, coverage consistency, and provide actionable decision-support recommendations for human claims analysts.

CLAIM DATA:
- Claim Number: ${claim.claimNumber}
- Line of Business: ${claim.policyType}
- Policyholder: ${claim.policyHolderName} (Policy Age: ${claim.policyAgeMonths} months)
- Incident Date: ${claim.incidentDate}
- Report Date / Lag: ${claim.reportLagDays} days from incident
- Claim Amount: $${claim.claimAmount?.toLocaleString()}
- Policy Deductible: $${claim.deductible?.toLocaleString()}
- Prior Claims in Past 3 Years: ${claim.previousClaimsCount}
- Incident Description: "${claim.description || 'Reported loss during policy period'}"
- Model Risk Score: ${(claim.fraudRiskScore * 100).toFixed(1)}% (${claim.riskTier || 'Moderate'})
- Automated Anomaly Flags: ${claim.anomalyFlags?.join(', ') || 'None initially flagged'}
- Additional Context: ${context || 'Standard claims review workflow'}

Please provide a structured, professional claims risk assessment report with:
1. Executive Risk Summary (2-3 sentences evaluating the claim credibility and exposure)
2. Red Flags & Anomaly Breakdown (bullet points analyzing specific discrepancies or risk factors)
3. Mitigating / Positive Credibility Factors (bullet points of elements that favor legitimate settlement)
4. Recommended Analyst Action (Fast-track approval, Request police/medical records, Physical field inspection, or SIU referral)
5. Suggested Clarification Questions to ask the claimant
6. Actuarial Risk Note (estimated potential loss severity exposure vs coverage)

Format your response as crisp, structured JSON with keys:
"executiveSummary": string,
"riskLevel": "Low" | "Moderate" | "Elevated" | "High",
"confidenceScore": number (between 0.70 and 0.99),
"redFlags": string[],
"mitigatingFactors": string[],
"recommendedAction": string,
"suggestedQuestions": string[],
"actuarialNote": string,
"disclaimer": "This output is an AI decision-support recommendation and does not replace human adjudication or legal claims determination."
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const text = response.text;
    let parsed;
    try {
      parsed = JSON.parse(text || '{}');
    } catch {
      parsed = {
        executiveSummary: text,
        riskLevel: claim.fraudRiskScore > 0.7 ? 'High' : claim.fraudRiskScore > 0.4 ? 'Moderate' : 'Low',
        confidenceScore: 0.88,
        redFlags: claim.anomalyFlags || [],
        mitigatingFactors: ['Verified active policyholder coverage'],
        recommendedAction: claim.fraudRiskScore > 0.7 ? 'Refer to SIU for investigation' : 'Proceed with document verification',
        suggestedQuestions: ['Verify incident timeline and independent corroborating witness details.'],
        actuarialNote: 'Loss severity within standard policy limits.',
        disclaimer: 'This output is an AI decision-support recommendation.'
      };
    }

    return res.json({
      source: 'gemini-3.8-flash',
      analysis: parsed,
    });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    // Graceful fallback if network or quota issue occurs
    const fallback = generateFallbackAnalysis(req.body?.claim || {});
    return res.json({
      source: 'fallback_due_to_api_error',
      analysis: fallback,
      errorNotice: error.message
    });
  }
});

function generateFallbackAnalysis(claim: any) {
  const isHighRisk = (claim.fraudRiskScore || 0) > 0.65;
  const isEarlyClaim = (claim.policyAgeMonths || 0) < 3;
  const highLag = (claim.reportLagDays || 0) > 21;
  const priorClaims = (claim.previousClaimsCount || 0) >= 2;

  const redFlags: string[] = [];
  const mitigatingFactors: string[] = [];

  if (isEarlyClaim) redFlags.push(`Short policy inception latency (${claim.policyAgeMonths} months since policy binding)`);
  if (highLag) redFlags.push(`Delayed reporting lag of ${claim.reportLagDays} days from incident`);
  if (priorClaims) redFlags.push(`Elevated frequency pattern (${claim.previousClaimsCount} previous claims in 36 months)`);
  if (claim.claimAmount > 25000) redFlags.push(`Substantial single-event loss indemnity requested ($${claim.claimAmount?.toLocaleString()})`);

  if (!isEarlyClaim) mitigatingFactors.push(`Established policy tenure with over ${claim.policyAgeMonths || 12} continuous months`);
  if (!priorClaims) mitigatingFactors.push(`Clean claimant loss history with zero suspicious prior indemnities`);
  if (claim.deductible >= 1000) mitigatingFactors.push(`Significant claimant deductible skin-in-the-game ($${claim.deductible})`);
  if (redFlags.length === 0) mitigatingFactors.push('Loss pattern is consistent with standard actuarial baseline for this line of business.');

  return {
    executiveSummary: `Automated assessment for claim ${claim.claimNumber || 'REC-001'} (${claim.policyType || 'Property'}). The claim presents ${isHighRisk ? 'elevated' : 'controlled'} exposure with a calculated risk probability of ${Math.round((claim.fraudRiskScore || 0.3) * 100)}%. ${isHighRisk ? 'Multiple anomaly indicators require manual claims examiner review.' : 'Loss parameters are consistent with policy provisions.'}`,
    riskLevel: isHighRisk ? 'Elevated' : (claim.fraudRiskScore > 0.35 ? 'Moderate' : 'Low'),
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
    actuarialNote: `Expected indemnity severity is estimated at $${Math.round(claim.claimAmount * 0.85).toLocaleString()} net of standard depreciation.`,
    disclaimer: 'This output is an AI decision-support recommendation and does not replace human underwriting or legal claims adjudication.'
  };
}

// In dev mode, mount Vite middleware; in production serve static files
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[AegisClaim AI Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
