export default function handler(_req: any, res: any) {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'AegisClaim AI Engine (Vercel Serverless)',
    hasGeminiKey: !!process.env.GEMINI_API_KEY
  });
}
