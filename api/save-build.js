export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get authorization header
  const authHeader = req.headers.authorization;
  
  // API key stored in Vercel
  const API_KEY = process.env.API_KEY;
  
  if (!authHeader || authHeader !== `Bearer ${API_KEY}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { customerId, buildData } = req.body;

    if (!customerId || !buildData) {
      return res.status(400).json({ error: 'Missing customerId or buildData' });
    }

    console.log('Saving build for customer:', customerId);
    console.log('Build data:', buildData);

    await new Promise(resolve => setTimeout(resolve, 500));

    return res.status(200).json({
      success: true,
      message: 'Build saved successfully',
      buildId: Date.now(),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
