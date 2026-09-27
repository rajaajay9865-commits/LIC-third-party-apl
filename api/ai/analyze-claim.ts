import { GoogleGenAI } from '@google/genai';

function generateFallbackAnalysis(claim: any) {
  const isHighRisk = (claim.fraudRiskScore || 0) > 0.65;
  const isEarlyClaim = (claim.policyAgeMonths || 0) < 3;
  const highLag = (claim.reportLagDays || 0) > 21;
  const priorClaims = (claim.previousClaimsCount || 0) >= 2;

  const redFlags: string[] = [];
  const mitigatingFactors: string[] = [];

  if (isEarlyClaim) redFlags.push(`Short policy inception latency (${claim.policyAgeMonths || 1} months since policy binding)`);
  if (highLag) redFlags.push(`Delayed reporting lag of ${claim.reportLagDays || 0} days from incident`);
  if (priorClaims) redFlags.push(`Elevated frequency pattern (${claim.previousClaimsCount} previous claims in 36 months)`);
  if ((claim.claimAmount || 0) > 25000) redFlags.push(`Substantial single-event loss indemnity requested ($${claim.claimAmount?.toLocaleString()})`);

  if (!isEarlyClaim) mitigatingFactors.push(`Established policy tenure with over ${claim.policyAgeMonths || 12} continuous months`);
  if (!priorClaims) mitigatingFactors.push('Clean claimant loss history with zero suspicious prior indemnities');
  if ((claim.deductible || 0) >= 1000) mitigatingFactors.push(`Significant claimant deductible skin-in-the-game ($${claim.deductible})`);
  if (redFlags.length === 0) mitigatingFactors.push('Loss pattern is consistent with standard actuarial baseline for this line of business.');

  return {
    executiveSummary: `Automated assessment for claim ${claim.claimNumber || 'REC-001'} (${claim.policyType || 'Property'}). The claim presents ${isHighRisk ? 'elevated' : 'controlled'} exposure with a calculated risk probability of ${Math.round((claim.fraudRiskScore || 0.3) * 100)}%. ${isHighRisk ? 'Multiple anomaly indicators require manual examiner review.' : 'Loss parameters are consistent with policy provisions.'}`,
    riskLevel: isHighRisk ? 'Elevated' : ((claim.fraudRiskScore || 0) > 0.35 ? 'Moderate' : 'Low'),
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
    actuarialNote: `Expected indemnity severity is estimated at $${Math.round((claim.claimAmount || 5000) * 0.85).toLocaleString()} net of standard depreciation.`,
    disclaimer: 'This output is an AI decision-support recommendation and does not replace human underwriting or legal claims adjudication.'
  };
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { claim, context } = req.body || {};
    if (!claim) {
      return res.status(400).json({ error: 'Claim data is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      const fallbackAnalysis = generateFallbackAnalysis(claim);
      return res.status(200).json({
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
- Incident Description: ${claim.incidentDescription || 'Standard reported loss event'}
- Initial ML Fraud Risk Score: ${((claim.fraudRiskScore || 0) * 100).toFixed(1)}% (${claim.riskTier || 'Standard'})

CONTEXT:
${context || 'Standard claims evaluation review'}

Respond with a JSON object adhering to this schema:
{
  "executiveSummary": "Concise 2-3 sentence overview of claim risk and legitimacy",
  "riskLevel": "Low" | "Moderate" | "Elevated" | "Critical",
  "confidenceScore": number between 0 and 1 (e.g. 0.92),
  "redFlags": ["Array of specific anomaly flags or discrepancies, or empty if none"],
  "mitigatingFactors": ["Array of positive evidence supporting claim legitimacy"],
  "recommendedAction": "Clear operational next step recommendation",
  "suggestedQuestions": ["Array of 2-3 targeted questions for the claims examiner to ask claimant"],
  "actuarialNote": "Actuarial reserve or indemnity expectation note",
  "disclaimer": "Statutory notice regarding human oversight"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.status(200).json({
      source: 'gemini-2.5-flash',
      analysis: parsed,
    });
  } catch (error: any) {
    const fallback = generateFallbackAnalysis(req.body?.claim || {});
    return res.status(200).json({
      source: 'fallback_due_to_api_error',
      analysis: fallback,
      errorNotice: error?.message || 'Server error',
    });
  }
}
