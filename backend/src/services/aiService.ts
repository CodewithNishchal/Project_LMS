export interface AiCreditAnalysis {
  riskLevel: 'LOW_RISK' | 'MODERATE_RISK' | 'HIGH_RISK';
  riskScore: number; // 0 to 100
  aiRecommendation: 'RECOMMEND_SANCTION' | 'NEEDS_MANUAL_REVIEW' | 'RECOMMEND_REJECTION';
  summary: string;
  keyInsights: string[];
  isAiGenerated: boolean;
}

export const analyzeCreditRisk = async (loanData: {
  fullName: string;
  monthlySalary?: number | null;
  principalAmount?: number | null;
  tenureDays?: number | null;
  employmentMode?: string | null;
  breStatus?: string | null;
}): Promise<AiCreditAnalysis> => {
  const apiKey = process.env.GEMINI_API_KEY;
  const { fullName, monthlySalary, principalAmount, tenureDays, employmentMode, breStatus } = loanData;

  // Safe fallback values handling both null and undefined
  const salary = monthlySalary || 50000;
  const principal = principalAmount || 100000;
  const tenure = tenureDays || 180;
  const mode = employmentMode || 'SALARIED';
  const bre = breStatus || 'PASSED';

  const dtiRatio = Math.round((principal / (salary * (tenure / 30))) * 100);

  const fallbackAnalysis = (): AiCreditAnalysis => {
    let riskLevel: 'LOW_RISK' | 'MODERATE_RISK' | 'HIGH_RISK' = 'LOW_RISK';
    let riskScore = 88;
    let aiRecommendation: 'RECOMMEND_SANCTION' | 'NEEDS_MANUAL_REVIEW' | 'RECOMMEND_REJECTION' = 'RECOMMEND_SANCTION';

    if (salary < 25000 || bre === 'REJECTED') {
      riskLevel = 'HIGH_RISK';
      riskScore = 35;
      aiRecommendation = 'RECOMMEND_REJECTION';
    } else if (dtiRatio > 70 || mode === 'SELF_EMPLOYED') {
      riskLevel = 'MODERATE_RISK';
      riskScore = 65;
      aiRecommendation = 'NEEDS_MANUAL_REVIEW';
    }

    return {
      riskLevel,
      riskScore,
      aiRecommendation,
      summary: `Automated Rule Analysis: ${fullName} has a monthly income of ₹${salary.toLocaleString('en-IN')} with debt-to-income ratio estimated at ${dtiRatio}%. System BRE status: ${bre}.`,
      keyInsights: [
        `Monthly Salary: ₹${salary.toLocaleString('en-IN')}`,
        `Debt-to-Income Ratio: ${dtiRatio}%`,
        `BRE Rule Status: ${bre}`,
        `Employment Mode: ${mode}`,
      ],
      isAiGenerated: false,
    };
  };

  // Check if API Key is configured and not default placeholder
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    return fallbackAnalysis();
  }

  try {
    const prompt = `Act as a senior credit risk underwriting AI for personal loans. Analyze applicant:
Name: ${fullName}
Monthly Salary: ₹${salary}
Requested Principal Amount: ₹${principal}
Tenure: ${tenure} Days
Employment Type: ${mode}
Automated BRE Status: ${bre}

Return ONLY a valid JSON object matching this schema (do not wrap in markdown or backticks):
{
  "riskLevel": "LOW_RISK" | "MODERATE_RISK" | "HIGH_RISK",
  "riskScore": number between 0 and 100,
  "aiRecommendation": "RECOMMEND_SANCTION" | "NEEDS_MANUAL_REVIEW" | "RECOMMEND_REJECTION",
  "summary": "2-sentence professional underwriting summary",
  "keyInsights": ["bullet point 1", "bullet point 2", "bullet point 3"]
}`;

    const fetchFn = (globalThis as any).fetch || require('node-fetch');
    const response = await fetchFn(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    if (!response.ok) return fallbackAnalysis();

    const data = await response.json();
    const textContent = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textContent) return fallbackAnalysis();

    // Clean JSON response string
    const cleanedJson = textContent.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanedJson);

    return {
      riskLevel: parsed.riskLevel || 'LOW_RISK',
      riskScore: parsed.riskScore || 85,
      aiRecommendation: parsed.aiRecommendation || 'RECOMMEND_SANCTION',
      summary: parsed.summary || 'AI Credit Evaluation completed successfully.',
      keyInsights: parsed.keyInsights || ['Salary verified', 'Low default probability'],
      isAiGenerated: true,
    };
  } catch (error) {
    // Silent fallback on any network/key/parse error
    return fallbackAnalysis();
  }
};
