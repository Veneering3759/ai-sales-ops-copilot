import Anthropic from '@anthropic-ai/sdk';

// Initialize Claude client
const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Generate text using Claude AI
 * @param {Object} params - Generation parameters
 * @param {string} params.prompt - The prompt to send to Claude
 * @param {number} params.maxTokens - Maximum tokens to generate (default: 1024)
 * @param {number} params.temperature - Temperature for randomness (default: 0.7)
 * @returns {Promise<string>} Generated text
 */
export async function generateText({ prompt, maxTokens = 1024, temperature = 0.7 }) {
  try {
    const message = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: maxTokens,
      temperature,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    return message.content[0].text;
  } catch (error) {
    console.error('Claude API Error:', error.message);
    throw new Error(`AI generation failed: ${error.message}`);
  }
}

/**
 * Generate structured JSON response using Claude AI
 * @param {Object} params - Generation parameters
 * @param {string} params.prompt - The prompt to send to Claude
 * @param {number} params.maxTokens - Maximum tokens to generate (default: 500)
 * @returns {Promise<Object>} Parsed JSON response
 */
export async function generateJSON({ prompt, maxTokens = 500 }) {
  try {
    const message = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: maxTokens,
      temperature: 0.3, // Lower temperature for more consistent JSON
      messages: [{
        role: 'user',
        content: prompt + '\n\nIMPORTANT: Respond ONLY with valid JSON, no additional text.'
      }]
    });

    const text = message.content[0].text;

    // Extract JSON from response (handles cases where Claude adds explanation)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Claude JSON Generation Error:', error.message);
    throw new Error(`AI JSON generation failed: ${error.message}`);
  }
}

/**
 * Check if Claude API is configured
 * @returns {boolean} True if API key is set
 */
export function isConfigured() {
  return !!process.env.ANTHROPIC_API_KEY;
}

export default {
  generateText,
  generateJSON,
  isConfigured
};
