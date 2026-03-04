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

// CORS — only allow your frontend
const allowedOrigins = [
  process.env.ALLOWED_ORIGIN,
  'http://localhost:5173',
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman in dev)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['POST'],
  allowedHeaders: ['Content-Type'],
  credentials: false,
}));

// Parse JSON — limit body size to prevent abuse
app.use(express.json({ limit: '10kb' }));

// Apply rate limiting to all routes
app.use(apiLimiter);

// Health check — no sensitive info exposed
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Routes
app.use('/api/ai', aiRoutes);

// 404 handler — no internal details exposed
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Global error handler — no stack traces in production
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
  // Never log the API key — even in dev
});