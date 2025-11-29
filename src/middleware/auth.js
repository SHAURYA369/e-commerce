const ADMIN_API_KEY = process.env.ADMIN_API_KEY || 'admin-secret-key-12345';

function adminAuth(req, res, next) {
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;

  if (!apiKey) {
    return res.status(401).json({ error: 'Admin API key required' });
  }

  if (apiKey !== ADMIN_API_KEY) {
    return res.status(403).json({ error: 'Invalid admin API key' });
  }

  next();
}

module.exports = { adminAuth };

