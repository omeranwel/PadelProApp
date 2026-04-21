import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'placeholder'
});

const SYSTEM_PROMPT = `
You are the PadelPro AI Assistant. You are an expert in Padel sports, coaching, rules, and equipment.
You are part of the PadelPro platform, Pakistan's premier Padel community.
Your tone is professional, encouraging, and helpful.
Answer questions about Padel rules, techniques (like the Bandeja or Vibora), equipment advice, and PadelPro platform features.
If asked about PadelPro features (booking, matchmaking, market), explain how the app helps players.
Keep responses concise and formatted in Markdown.
`;

export const getAiResponse = async (message, history = []) => {
  if (process.env.ANTHROPIC_API_KEY === 'placeholder' || !process.env.ANTHROPIC_API_KEY) {
    return "I'm currently in offline mode (API key not configured). Padel is a great sport! Try the Bandeja shot for control.";
  }

  try {
    const response = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 500,
      system: SYSTEM_PROMPT,
      messages: [
        ...history.map(h => ({ role: h.role, content: h.content })),
        { role: "user", content: message }
      ]
    });

    return response.content[0].text;
  } catch (err) {
    console.error('Anthropic API Error:', err.message);
    return "I'm having trouble connecting to my brain right now. Try again in a bit!";
  }
};
