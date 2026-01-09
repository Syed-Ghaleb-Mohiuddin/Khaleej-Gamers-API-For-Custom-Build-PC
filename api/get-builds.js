export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization;
  const API_KEY = process.env.API_KEY;
  
  if (!authHeader || authHeader !== `Bearer ${API_KEY}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { customerId } = req.query;

    if (!customerId) {
      return res.status(400).json({ error: 'Missing customerId' });
    }

    console.log('Getting builds for customer:', customerId);

    await new Promise(resolve => setTimeout(resolve, 300));

    return res.status(200).json({
      success: true,
      builds: []
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
