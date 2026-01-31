import validator from 'validator';

const INDUSTRIES = {
  technology: ['tech', 'software', 'saas', 'cloud', 'ai', 'data'],
  finance: ['bank', 'finance', 'investment', 'capital', 'trading'],
  healthcare: ['health', 'medical', 'pharma', 'hospital', 'clinic'],
  retail: ['retail', 'ecommerce', 'shop', 'store', 'marketplace'],
  manufacturing: ['manufacturing', 'factory', 'production', 'industrial'],
  realestate: ['real estate', 'property', 'construction', 'development'],
  education: ['education', 'school', 'university', 'training', 'learning'],
  media: ['media', 'publishing', 'news', 'entertainment', 'advertising'],
  consulting: ['consulting', 'advisory', 'services', 'strategy'],
  energy: ['energy', 'oil', 'gas', 'renewable', 'utilities'],
  telecommunications: ['telecom', 'mobile', 'network', 'communications'],
  transportation: ['transport', 'logistics', 'shipping', 'delivery']
};

const inferIndustry = (company, title) => {
  const text = `${company} ${title}`.toLowerCase();
  
  for (const [industry, keywords] of Object.entries(INDUSTRIES)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      return industry;
    }
  }
  
  return 'other';
};

const classifySeniority = (title) => {
  if (!title) return 'individual';
  
  const titleLower = title.toLowerCase();
  
  if (/(ceo|cto|cfo|coo|chief|president|founder)/i.test(titleLower)) {
    return 'c-level';
  }
  if (/(vp|vice president)/i.test(titleLower)) {
    return 'vp';
  }
  if (/(director|head of)/i.test(titleLower)) {
    return 'director';
  }
  if (/(manager|lead)/i.test(titleLower)) {
    return 'manager';
  }
  
  return 'individual';
};

export const enrichLead = (lead) => {
  return {
    ...lead,
    emailValid: lead.email ? validator.isEmail(lead.email) : false,
    industry: inferIndustry(lead.company || '', lead.title || ''),
    seniority: classifySeniority(lead.title)
  };
};
