require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { apiLimiter } = require('./middleware/security');
const { createCorsOptions } = require('./config/cors');
const aiRoutes = require('./routes/ai');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());

const corsOptions = createCorsOptions();
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json({ limit: '10kb' }));
app.use(apiLimiter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/ai', aiRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  res.status(500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Something went wrong'
      : err.message,
  });
});

app.listen(PORT, () => {
  console.log(`Remmy backend running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});
