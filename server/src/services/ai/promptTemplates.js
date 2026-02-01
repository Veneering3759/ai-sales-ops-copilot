/**
 * Email Prompt Templates for Claude AI
 * Each template builds a structured prompt based on lead data and email type
 */

/**
 * Build prompt for cold outreach email
 * @param {Object} lead - Lead data
 * @returns {string} Formatted prompt
 */
export function buildColdEmailPrompt(lead) {
  const industryContext = getIndustryContext(lead.industry);
  const seniorityContext = getSeniorityContext(lead.seniority);

  return `You are an expert sales development representative writing a cold outreach email.

## Lead Information:
- Name: ${lead.firstName} ${lead.lastName}
- Title: ${lead.title}
- Company: ${lead.company}
- Industry: ${lead.industry || 'Unknown'}
- Seniority: ${lead.seniority || 'Unknown'}
- Lead Score: ${lead.score}/100

## Context:
${industryContext}
${seniorityContext}

## Your Task:
Write a compelling cold outreach email that:
1. Opens with a personalized hook relevant to their role and industry
2. Identifies 1-2 specific pain points that ${lead.industry || 'their industry'} companies face
3. Briefly explains how AI-powered sales automation can help (without being salesy)
4. Includes a soft call-to-action (asking for a brief chat, not a hard sell)
5. Feels authentic and human - avoid buzzwords and corporate jargon
6. Is concise - maximum 4 short paragraphs

## Tone Guidelines:
- Professional but conversational
- Confident but not pushy
- Focus on value, not features
- Reference their specific role (${lead.title})

## Do NOT:
- Use generic templates or placeholder text
- Make unsubstantiated claims
- Be overly formal or stiff
- Write more than 150 words

Write the email now:`;
}

/**
 * Build prompt for follow-up email
 * @param {Object} lead - Lead data
 * @returns {string} Formatted prompt
 */
export function buildFollowUpEmailPrompt(lead) {
  return `You are an expert sales development representative writing a follow-up email.

## Lead Information:
- Name: ${lead.firstName} ${lead.lastName}
- Title: ${lead.title}
- Company: ${lead.company}
- Industry: ${lead.industry || 'Unknown'}
- Seniority: ${lead.seniority || 'Unknown'}

## Context:
You sent a cold email to this lead last week about AI-powered sales automation. They haven't responded yet.

## Your Task:
Write a brief, respectful follow-up email that:
1. Acknowledges they're likely busy
2. Adds NEW value (a stat, insight, or case study relevant to their industry)
3. Uses social proof or urgency subtly (e.g., "Other ${lead.industry} companies are seeing...")
4. Makes it easy to respond with a simple yes/no question
5. Shows persistence without being annoying

## Tone Guidelines:
- Respectful of their time
- Confident and value-focused
- Not apologetic or desperate
- Professional but friendly

## Do NOT:
- Apologize for following up
- Repeat the previous email
- Be pushy or aggressive
- Write more than 100 words

Write the follow-up email now:`;
}

/**
 * Build prompt for meeting request email
 * @param {Object} lead - Lead data
 * @returns {string} Formatted prompt
 */
export function buildMeetingEmailPrompt(lead) {
  return `You are an expert sales development representative writing a meeting request email.

## Lead Information:
- Name: ${lead.firstName} ${lead.lastName}
- Title: ${lead.title}
- Company: ${lead.company}
- Industry: ${lead.industry || 'Unknown'}

## Context:
This lead has shown interest (opened emails or responded). Now you're scheduling a demo/discovery call.

## Your Task:
Write a concise meeting request email that:
1. Thanks them for their interest
2. Clearly explains what they'll get from the meeting (not a generic "demo")
3. Suggests 2-3 specific time slots (use realistic times like "Tuesday 2pm ET")
4. Makes it clear this will be valuable for THEM
5. Keeps it short and action-oriented

## What They'll See in the Meeting:
- How to process 5,000+ leads in under 30 seconds
- AI-powered scoring and deduplication (95% accuracy)
- One-click export to Salesforce/HubSpot
- Real use case from their industry

## Tone Guidelines:
- Direct and confident
- Value-focused (what's in it for them)
- Professional and efficient
- Helpful, not salesy

## Do NOT:
- Be vague about the meeting agenda
- Use overly formal language
- Write long paragraphs
- Exceed 120 words

Write the meeting request email now:`;
}

/**
 * Get industry-specific context for prompts
 * @param {string} industry - Industry name
 * @returns {string} Context about industry pain points
 */
function getIndustryContext(industry) {
  const contexts = {
    technology: 'Tech companies struggle with scaling sales ops while maintaining lead quality. High-growth startups often have thousands of leads but lack resources to properly qualify them.',
    finance: 'Financial services firms face strict compliance requirements around data handling. They need efficient lead processing while maintaining audit trails and data security.',
    healthcare: 'Healthcare organizations deal with complex decision-making units and long sales cycles. Lead prioritization and personalized outreach are critical.',
    retail: 'Retail businesses need to move fast and handle high volumes of leads during peak seasons. Speed and automation are essential.',
    manufacturing: 'Manufacturing companies have longer sales cycles and need to identify decision-makers across complex org structures.',
    'real estate': 'Real estate professionals juggle many prospects simultaneously. Quick lead response time and follow-up automation are competitive advantages.',
    education: 'Educational institutions have unique buying cycles and multiple stakeholders. Personalized outreach at scale is challenging.',
    consulting: 'Consulting firms need to identify qualified prospects quickly and demonstrate ROI fast. Their sales teams are often small but high-touch.',
  };

  return contexts[industry?.toLowerCase()] || 'Most companies struggle with manual lead processing, losing hours on data entry and missing hot leads due to slow response times.';
}

/**
 * Get seniority-specific context for prompts
 * @param {string} seniority - Seniority level
 * @returns {string} Context about how to address this level
 */
function getSeniorityContext(seniority) {
  const contexts = {
    'c-level': 'As a C-level executive, they care about ROI, strategic impact, and big-picture results. Focus on business outcomes, not features.',
    'vp': 'VPs are focused on team productivity and departmental results. Emphasize efficiency gains and measurable improvements.',
    'director': 'Directors are hands-on leaders who care about solving tactical problems. Show how this makes their team\'s lives easier.',
    'manager': 'Managers want tools that help them hit their quotas and make their reps more productive. Focus on practical benefits.',
    'individual': 'Individual contributors care about tools that save them time and make their work easier. Be direct about time savings.',
  };

  return contexts[seniority?.toLowerCase()] || 'Address them professionally and focus on practical value relevant to their role.';
}

export default {
  buildColdEmailPrompt,
  buildFollowUpEmailPrompt,
  buildMeetingEmailPrompt,
};
