const DEFAULT_ALLOWED_ORIGINS = [
  'https://remmy-pi.vercel.app',
  'http://localhost:5173',
  'http://localhost:4173',
];

const DEFAULT_ALLOWED_PATTERNS = [
  /^https:\/\/remmy.*\.vercel\.app$/,
];

const parseCsv = (value) =>
  (value || '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);

const parseRegexCsv = (value) => {
  const patterns = parseCsv(value);
  return patterns
    .map((pattern) => {
      try {
        return new RegExp(pattern);
      } catch (_err) {
        return null;
      }
    })
    .filter(Boolean);
};

const getCorsConfig = () => {
  const envOrigins = parseCsv(process.env.ALLOWED_ORIGINS);
  const envPatterns = parseRegexCsv(process.env.ALLOWED_ORIGIN_PATTERNS);

  return {
    allowedOrigins: envOrigins.length > 0 ? envOrigins : DEFAULT_ALLOWED_ORIGINS,
    allowedPatterns: envPatterns.length > 0 ? envPatterns : DEFAULT_ALLOWED_PATTERNS,
  };
};

const isAllowedOrigin = (origin, allowedOrigins, allowedPatterns) => (
  allowedOrigins.includes(origin) || allowedPatterns.some((pattern) => pattern.test(origin))
);

const createCorsOptions = () => {
  const { allowedOrigins, allowedPatterns } = getCorsConfig();

  return {
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      if (isAllowedOrigin(origin, allowedOrigins, allowedPatterns)) {
        callback(null, true);
        return;
      }

      if (process.env.NODE_ENV !== 'production') {
        process.stderr.write(`CORS blocked origin: ${origin}\n`);
      }
      callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
    credentials: false,
  };
};

module.exports = {
  createCorsOptions,
  getCorsConfig,
  isAllowedOrigin,
  parseCsv,
  parseRegexCsv,
};
