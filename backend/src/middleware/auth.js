const getSupabaseConfig = () => {
  const supabaseUrl = (process.env.SUPABASE_URL || '').replace(/\/+$/, '');
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

  return {
    supabaseUrl,
    supabaseAnonKey,
  };
};

const parseBearerToken = (authHeader = '') => {
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : null;
};

const authenticateSupabaseUser = async (req, res, next) => {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();

  if (!supabaseUrl || !supabaseAnonKey) {
    res.status(500).json({ error: 'Server auth is not configured.' });
    return;
  }

  const token = parseBearerToken(req.headers.authorization);
  if (!token) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }

  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: supabaseAnonKey,
      },
    });

    if (!response.ok) {
      res.status(401).json({ error: 'Invalid or expired session.' });
      return;
    }

    const user = await response.json();
    if (!user?.id) {
      res.status(401).json({ error: 'Invalid or expired session.' });
      return;
    }

    req.authUser = {
      id: user.id,
      email: user.email || null,
    };

    next();
  } catch (err) {
    console.error('Auth verification error:', err.message);
    res.status(500).json({ error: 'Authentication check failed.' });
  }
};

module.exports = {
  authenticateSupabaseUser,
  parseBearerToken,
};
