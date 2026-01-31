import { parse } from 'csv-parse';
import fs from 'fs';

const normalizeColumnName = (name) => {
  const normalized = name.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
  
  const mappings = {
    email: ['email', 'emailaddress', 'mail'],
    firstName: ['firstname', 'fname', 'givenname', 'first'],
    lastName: ['lastname', 'lname', 'surname', 'last'],
    company: ['company', 'companyname', 'organization', 'org'],
    title: ['title', 'jobtitle', 'position', 'role'],
    phone: ['phone', 'phonenumber', 'tel', 'mobile'],
    linkedin: ['linkedin', 'linkedinurl', 'profile']
  };
  
  for (const [standard, variants] of Object.entries(mappings)) {
    if (variants.includes(normalized)) return standard;
  }
  
  return name;
};

export const parseCSV = (filepath) => {
  return new Promise((resolve, reject) => {
    const records = [];
    
    fs.createReadStream(filepath)
      .pipe(parse({ columns: true, skip_empty_lines: true }))
      .on('data', (row) => {
        const normalized = {};
        for (const [key, value] of Object.entries(row)) {
          const normalizedKey = normalizeColumnName(key);
          normalized[normalizedKey] = value;
        }
        records.push(normalized);
      })
      .on('end', () => resolve(records))
      .on('error', reject);
  });
};
