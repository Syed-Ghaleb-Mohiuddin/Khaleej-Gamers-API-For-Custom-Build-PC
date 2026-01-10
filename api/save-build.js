// /api/save-build.js
import fs from 'fs/promises';
import path from 'path';

export default async function handler(req, res) {
  // === CORS HEADERS ===
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', 'https://khaleej-gamers.myshopify.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // Handle OPTIONS request (preflight)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  // === END CORS ===

  // Only allow POST requests
  if (req.method !== 'POST') {
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
    const { customerId, buildData } = req.body;

    if (!customerId || !buildData) {
      return res.status(400).json({ error: 'Missing customerId or buildData' });
    }

    console.log('Received build for customer:', customerId);
    console.log('Build name:', buildData.name);
    console.log('Build ID:', buildData.id);

    // Path to store data (using /tmp directory in Vercel)
    const dataDir = path.join('/tmp', 'pc-builder-data');
    const filePath = path.join(dataDir, `${customerId}.json`);

    try {
      // Ensure directory exists
      await fs.mkdir(dataDir, { recursive: true });
      
      // Read existing builds
      let existingBuilds = [];
      try {
        const fileContent = await fs.readFile(filePath, 'utf8');
        existingBuilds = JSON.parse(fileContent);
      } catch (error) {
        // File doesn't exist yet, start with empty array
        console.log('No existing builds file, creating new one');
      }

      // Add new build to beginning
      existingBuilds.unshift(buildData);
      
      // Keep only last 10 builds
      if (existingBuilds.length > 10) {
        existingBuilds = existingBuilds.slice(0, 10);
      }

      // Save back to file
      await fs.writeFile(filePath, JSON.stringify(existingBuilds, null, 2));
      
      console.log(`Saved build for customer ${customerId}. Total builds: ${existingBuilds.length}`);

      // Return success
      return res.status(200).json({
        success: true,
        message: 'Build saved successfully to account',
        buildId: buildData.id,
        timestamp: new Date().toISOString(),
        totalBuilds: existingBuilds.length
      });

    } catch (fileError) {
      console.error('File system error:', fileError);
      // Fallback: store in memory (for current session only)
      if (!global.customerBuilds) {
        global.customerBuilds = {};
      }
      if (!global.customerBuilds[customerId]) {
        global.customerBuilds[customerId] = [];
      }
      
      global.customerBuilds[customerId].unshift(buildData);
      if (global.customerBuilds[customerId].length > 10) {
        global.customerBuilds[customerId] = global.customerBuilds[customerId].slice(0, 10);
      }

      return res.status(200).json({
        success: true,
        message: 'Build saved to memory (temporary)',
        buildId: buildData.id,
        timestamp: new Date().toISOString(),
        note: 'Using memory storage, data may be lost on server restart'
      });
    }

  } catch (error) {
    console.error('Error saving build:', error);
    return res.status(500).json({ error: error.message });
  }
}
