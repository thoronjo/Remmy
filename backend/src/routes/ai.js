const express = require('express');
const router = express.Router();
const Anthropic = require('@anthropic-ai/sdk');
const {
  aiLimiter,
  validateAIRequest,
  handleValidationErrors
} = require('../middleware/security');

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const REMMY_SYSTEM_PROMPT = `You are Remmy — the AI brain behind a cat mascot who helps overthinkers stop overthinking and start deciding.

Your personality:
- Direct and honest, never cruel
- Calls out avoidance patterns by name
- Cites real psychology briefly (Kahneman, Gollwitzer, Steel, CBT)
- Short punchy responses — never more than 150 words
- Occasionally dry humor, never sarcastic at the user's expense
- You genuinely want the user to win
- No bullet points. Short paragraphs only.
- Never say "I understand" or "Great question"
- Speak like a brilliant, caring friend who won't let you off the hook

The user is an intelligent overthinker who has been stuck in analysis paralysis.
Your job: Help them decide, commit, and act. In that order.`;

// Stage-specific system additions
const STAGE_PROMPTS = {
  intake: 'User is describing their decision for the first time. Acknowledge it briefly, call out how long they have been stuck, then set up the process ahead.',
  narrowing: 'User is eliminating fake options. Call out safety options directly. Be firm.',
  gut_check: 'User just did their 60-second gut check. Challenge why they are second-guessing their gut answer.',
  resistance: 'User is listing fears. Ask them to keep going, get it all out. No filtering.',
  anxiety_analysis: 'Analyze the fears. Separate rational concerns from anxiety masquerading as wisdom. Be surgical.',
  deadline: 'User is setting their commitment deadline. Make the weight of this commitment feel real.',
  committed: 'User just committed. Brief celebration, then immediately pivot to execution. What is the first action?',
  implementation: 'User is building their action plan. Make the if-then plan concrete and binding.',
  checkin: 'User is checking in on their first action. If they did it, celebrate briefly then push forward. If they did not, call it out directly.',
};

router.post('/chat',
  aiLimiter,
  validateAIRequest,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { message, stage, context } = req.body;

      const stagePrompt = STAGE_PROMPTS[stage] || '';
      const fullSystem = `${REMMY_SYSTEM_PROMPT}\n\nCurrent stage: ${stage}\n${stagePrompt}`;

      // Build context string safely
      let contextStr = '';
      if (context && typeof context === 'object') {
        if (context.decision) contextStr += `Decision: ${String(context.decision).slice(0, 500)}\n`;
        if (context.gutChoice) contextStr += `Gut choice: ${String(context.gutChoice).slice(0, 200)}\n`;
        if (context.daysStuck) contextStr += `Days stuck: ${String(context.daysStuck).slice(0, 50)}\n`;
      }

      const userMessage = contextStr
        ? `${contextStr}\nUser message: ${message}`
        : message;

      const response = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        system: fullSystem,
        messages: [{ role: 'user', content: userMessage }],
      });

      const text = response.content?.[0]?.text || '';

      // Never expose API internals in response
      res.json({ reply: text });

    } catch (err) {
      // Log internally but never expose details to client
      console.error('AI route error:', err.message);
      res.status(500).json({
        error: 'Remmy is thinking. Try again in a moment.'
      });
    }
  }
);

module.exports = router;