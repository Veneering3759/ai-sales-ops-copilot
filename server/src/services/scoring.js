export const scoreLead = (lead) => {
  const breakdown = {
    email: lead.emailValid ? 10 : 0,
    title: 0,
    company: lead.company ? 20 : 0,
    phone: lead.phone ? 10 : 0,
    linkedin: lead.linkedin ? 10 : 0,
    completeness: 0
  };
  
  if (lead.seniority === 'c-level') breakdown.title = 15;
  else if (lead.seniority === 'vp') breakdown.title = 12;
  else if (lead.seniority === 'director') breakdown.title = 10;
  else if (lead.seniority === 'manager') breakdown.title = 8;
  
  const fields = [lead.email, lead.firstName, lead.lastName, lead.company, lead.title];
  const filledFields = fields.filter(Boolean).length;
  breakdown.completeness = Math.round((filledFields / fields.length) * 35);
  
  const totalScore = Object.values(breakdown).reduce((sum, val) => sum + val, 0);
  
  let nextBestAction = 'Research and qualify further';
  if (totalScore >= 80) nextBestAction = 'Immediate outreach - high priority';
  else if (totalScore >= 60) nextBestAction = 'Schedule intro call';
  else if (totalScore >= 40) nextBestAction = 'Add to nurture sequence';
  
  return {
    score: totalScore,
    scoreBreakdown: breakdown,
    nextBestAction
  };
};
