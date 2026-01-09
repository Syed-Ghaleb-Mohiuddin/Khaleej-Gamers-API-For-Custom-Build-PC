// /api/get-builds.js
export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get authorization header
  const authHeader = req.headers.authorization;
  
  // Verify API key
  const API_KEY = process.env.API_KEY || 'sk_7f82jfjf93jf8jf83jf83jf';
  
  if (!authHeader || authHeader !== `Bearer ${API_KEY}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { customerId } = req.query;

    if (!customerId) {
      return res.status(400).json({ error: 'Missing customerId' });
    }

    console.log('Getting builds for customer:', customerId);

    // For now, return an empty array because we haven't saved anything yet
    // Once we start saving builds, you'll update this to return real data
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 300));

    // Return empty array (no builds yet in database)
    return res.status(200).json({
      success: true,
      builds: []  // This will be empty until we save actual builds
    });

  } catch (error) {
    console.error('Error fetching builds:', error);
    return res.status(500).json({ error: error.message });
  }
}
