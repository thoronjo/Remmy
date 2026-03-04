require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { apiLimiter } = require('./middleware/security');
const aiRoutes = require('./routes/ai');

const app = express();
const PORT = process.env.PORT || 3001;

// Security headers
app.use(helmet());

// CORS — explicit allowed origins
const allowedOrigins = [
  'https://remmy-pi.vercel.app',
  'http://localhost:5173',
  'http://localhost:4173',
];

// Also allow any vercel preview deployments
const allowedPatterns = [
  /^https:\/\/remmy.*\.vercel\.app$/,
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman)
    if (!origin) return callback(null, true);

    // Check exact matches
    if (allowedOrigins.includes(origin)) return callback(null, true);

    // Check pattern matches (Vercel preview URLs)
    if (allowedPatterns.some(p => p.test(origin))) return callback(null, true);

    console.log('CORS blocked origin:', origin);
    callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: false,
}));

// Handle preflight requests explicitly
app.options('*', cors());

// Parse JSON — limit body size to prevent abuse
app.use(express.json({ limit: '10kb' }));

// Apply rate limiting to all routes
app.use(apiLimiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Routes
app.use('/api/ai', aiRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  res.status(500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Something went wrong'
      : err.message
  });
});

app.listen(PORT, () => {
  console.log(`Remmy backend running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});