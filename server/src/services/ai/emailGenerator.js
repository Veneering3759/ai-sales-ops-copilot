import { generateText, isConfigured } from './claudeService.js';
import {
  buildColdEmailPrompt,
  buildFollowUpEmailPrompt,
  buildMeetingEmailPrompt,
} from './promptTemplates.js';

/**
 * Generate AI-powered personalized email
 * @param {Object} params - Generation parameters
 * @param {Object} params.lead - Lead data
 * @param {string} params.emailType - Type of email (cold, followup, meeting)
 * @param {Object} params.options - Additional options
 * @returns {Promise<Object>} Generated email with metadata
 */
export async function generatePersonalizedEmail({ lead, emailType, options = {} }) {
  // Validate lead data
  if (!lead || !lead.firstName || !lead.company) {
    throw new Error('Lead must have at least firstName and company');
  }

  // Check if Claude API is configured
  if (!isConfigured()) {
    console.warn('Claude API not configured, using fallback templates');
    return generateFallbackEmail({ lead, emailType });
  }

  try {
    // Build prompt based on email type
    const prompt = buildPromptForEmailType(lead, emailType);

    // Generate email using Claude
    const emailBody = await generateText({
      prompt,
      maxTokens: options.maxTokens || 400,
      temperature: options.temperature || 0.7,
    });

    // Generate subject line
    const subject = await generateSubjectLine({ lead, emailType, emailBody });

    return {
      success: true,
      email: emailBody.trim(),
      subject: subject.trim(),
      metadata: {
        emailType,
        generatedBy: 'claude-3-5-sonnet',
        timestamp: new Date().toISOString(),
        leadScore: lead.score,
      },
    };
  } catch (error) {
    console.error('Email generation error:', error.message);

    // Fallback to template-based email if AI fails
    console.warn('Falling back to template-based email');
    return generateFallbackEmail({ lead, emailType });
  }
}

/**
 * Build prompt based on email type
 * @param {Object} lead - Lead data
 * @param {string} emailType - Email type
 * @returns {string} Formatted prompt
 */
function buildPromptForEmailType(lead, emailType) {
  switch (emailType) {
    case 'cold':
      return buildColdEmailPrompt(lead);
    case 'followup':
      return buildFollowUpEmailPrompt(lead);
    case 'meeting':
      return buildMeetingEmailPrompt(lead);
    default:
      return buildColdEmailPrompt(lead);
  }
}

/**
 * Generate email subject line using AI
 * @param {Object} params - Parameters
 * @param {Object} params.lead - Lead data
 * @param {string} params.emailType - Email type
 * @param {string} params.emailBody - Generated email body
 * @returns {Promise<string>} Subject line
 */
async function generateSubjectLine({ lead, emailType, emailBody }) {
  const prompt = `Based on this email content, write a compelling subject line (max 50 characters):

Email Type: ${emailType}
Recipient: ${lead.firstName} ${lead.lastName} at ${lead.company}
Industry: ${lead.industry || 'Unknown'}

Email Content:
${emailBody}

Write a subject line that:
- Is personalized and relevant
- Creates curiosity without being clickbait
- Feels authentic, not spammy
- Is under 50 characters

Subject line:`;

  try {
    const subject = await generateText({
      prompt,
      maxTokens: 30,
      temperature: 0.8,
    });

    // Clean up subject line (remove quotes, extra whitespace)
    return subject
      .replace(/^["']|["']$/g, '')
      .replace(/^Subject:\s*/i, '')
      .trim();
  } catch (error) {
    // Fallback subject lines
    const fallbackSubjects = {
      cold: `Quick question, ${lead.firstName}`,
      followup: `Following up - ${lead.company}`,
      meeting: `Let's schedule time to chat`,
    };
    return fallbackSubjects[emailType] || `Reaching out about ${lead.company}`;
  }
}

/**
 * Generate fallback email using templates (when AI unavailable)
 * @param {Object} params - Parameters
 * @param {Object} params.lead - Lead data
 * @param {string} params.emailType - Email type
 * @returns {Object} Fallback email
 */
function generateFallbackEmail({ lead, emailType }) {
  const templates = {
    cold: {
      subject: `Quick question for ${lead.company}`,
      body: `Hi ${lead.firstName},

I noticed ${lead.company} is in the ${lead.industry || 'your'} space and wanted to reach out about something that might save your team significant time.

As ${lead.title}, you're likely dealing with manual lead processing, data cleanup, and scoring. We built an AI-powered platform that handles this automatically - processing 5,000+ leads in under 30 seconds with 95% deduplication accuracy.

Our clients typically see 10x faster lead qualification and 3x more meetings booked.

Would a quick 15-minute demo make sense? I can show you how it works with your actual data.

Best,
[Your Name]`,
    },
    followup: {
      subject: `Following up - ${lead.company}`,
      body: `Hi ${lead.firstName},

Quick follow-up on my email from last week about automating your lead ops.

Just thought you'd find this interesting: ${lead.company}'s competitors are now processing leads 10x faster using AI automation. One similar company reduced their sales ops headcount by 60% while actually improving lead quality.

Worth a quick chat this week?

Best,
[Your Name]`,
    },
    meeting: {
      subject: `Let's schedule our demo`,
      body: `Hi ${lead.firstName},

Thanks for your interest in seeing how we can help ${lead.company} automate lead processing!

I'd love to show you a 15-minute demo where you'll see:
- How to process 5,000 leads in 30 seconds
- Automated scoring & deduplication (95% accuracy)
- Export to Salesforce/HubSpot in one click

Are any of these times good for you?
- Tuesday 2pm ET
- Wednesday 10am ET
- Thursday 3pm ET

Looking forward to it!

Best,
[Your Name]`,
    },
  };

  const template = templates[emailType] || templates.cold;

  return {
    success: true,
    email: template.body,
    subject: template.subject,
    metadata: {
      emailType,
      generatedBy: 'fallback-template',
      timestamp: new Date().toISOString(),
      leadScore: lead.score,
    },
    warning: 'Generated using fallback template. Configure ANTHROPIC_API_KEY for AI-powered emails.',
  };
}

export default {
  generatePersonalizedEmail,
};
