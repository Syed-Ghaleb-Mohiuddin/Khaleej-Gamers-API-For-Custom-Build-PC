// /api/get-builds.js
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

    // Try to read from file storage first
    const dataDir = path.join('/tmp', 'pc-builder-data');
    const filePath = path.join(dataDir, `${customerId}.json`);

    try {
      // Check if file exists
      await fs.access(filePath);
      
      // Read and parse file
      const fileContent = await fs.readFile(filePath, 'utf8');
      const builds = JSON.parse(fileContent);
      
      console.log(`Found ${builds.length} builds for customer ${customerId}`);

      return res.status(200).json({
        success: true,
        builds: builds,
        source: 'file_storage',
        count: builds.length
      });

    } catch (fileError) {
      // File doesn't exist, check memory storage
      console.log('No file found, checking memory storage...');
      
      if (global.customerBuilds && global.customerBuilds[customerId]) {
        const builds = global.customerBuilds[customerId];
        console.log(`Found ${builds.length} builds in memory for customer ${customerId}`);
        
        return res.status(200).json({
          success: true,
          builds: builds,
          source: 'memory_storage',
          count: builds.length
        });
      } else {
        // No builds found
        console.log(`No builds found for customer ${customerId}`);
        
        return res.status(200).json({
          success: true,
          builds: [],
          source: 'none',
          count: 0,
          message: 'No builds found'
        });
      }
    }

  } catch (error) {
    console.error('Error fetching builds:', error);
    return res.status(500).json({ error: error.message });
  }
}
