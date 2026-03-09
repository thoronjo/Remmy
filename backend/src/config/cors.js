const DEV_ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:4173',
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
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    return {
      allowedOrigins: envOrigins,
      // Security baseline: production must use exact allow-list only.
      allowedPatterns: [],
    };
  }

  return {
    allowedOrigins: envOrigins.length > 0 ? envOrigins : DEV_ALLOWED_ORIGINS,
    allowedPatterns: envPatterns,
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
