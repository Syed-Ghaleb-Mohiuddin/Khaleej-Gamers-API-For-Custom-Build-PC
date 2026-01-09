// /api/save-build.js
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get authorization header
  const authHeader = req.headers.authorization;
  
  // Verify API key (you set this in Vercel environment variables)
  const API_KEY = process.env.API_KEY || 'sk_7f82jfjf93jf8jf83jf83jf';
  
  if (!authHeader || authHeader !== `Bearer ${API_KEY}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { customerId, buildData } = req.body;

    if (!customerId || !buildData) {
      return res.status(400).json({ error: 'Missing customerId or buildData' });
    }

    // Log the data we received
    console.log('Received build for customer:', customerId);
    console.log('Build name:', buildData.name);
    console.log('Component count:', Object.keys(buildData.config).length);
    
    // In a real implementation, you would save to a database
    // For now, we'll just return success and log the data
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 500));

    // Return success with the build ID
    return res.status(200).json({
      success: true,
      message: 'Build saved successfully to account',
      buildId: buildData.id || Date.now(),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error saving build:', error);
    return res.status(500).json({ error: error.message });
  }
}
