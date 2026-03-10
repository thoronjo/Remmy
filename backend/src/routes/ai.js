const express = require('express');
const router = express.Router();
const {
  aiLimiter,
  validateAIRequest,
  handleValidationErrors,
} = require('../middleware/security');
const { authenticateSupabaseUser } = require('../middleware/auth');
const { aiOrchestrator } = require('../services/aiFailover');

router.post(
  '/chat',
  aiLimiter,
  authenticateSupabaseUser,
  validateAIRequest,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { message, stage, context } = req.body;
      const userId = req.authUser?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required.' });
      }

      const result = await aiOrchestrator.generate({
        userId,
        message,
        stage,
        context,
      });

      return res.json({
        reply: result.reply,
        provider: result.provider,
      });
    } catch (err) {
      if (err?.message === 'AI budget exceeded') {
        return res.status(429).json({
          error: 'Monthly AI limit reached for this account.',
        });
      }

      // Log internally but never expose details to client.
      console.error('AI route error:', err.message);
      return res.status(503).json({
        error: 'Remmy is thinking. Try again in a moment.',
      });
    }
  }
);

module.exports = router;
