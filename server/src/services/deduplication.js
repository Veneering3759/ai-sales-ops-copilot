import Lead from '../models/Lead.js';

const normalizeCompany = (company) => {
  if (!company) return '';
  return company
    .toLowerCase()
    .replace(/\b(inc|corp|llc|ltd|limited)\b/g, '')
    .trim();
};

export const findDuplicate = async (lead) => {
  if (lead.email) {
    const emailDupe = await Lead.findOne({ email: lead.email.toLowerCase() });
    if (emailDupe) return emailDupe;
  }
  
  if (lead.firstName && lead.lastName && lead.company) {
    const nameDupe = await Lead.findOne({
      firstName: new RegExp(`^${lead.firstName}$`, 'i'),
      lastName: new RegExp(`^${lead.lastName}$`, 'i'),
      company: new RegExp(normalizeCompany(lead.company), 'i')
    });
    if (nameDupe) return nameDupe;
  }
  
  return null;
};
