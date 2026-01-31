import mongoose from 'mongoose';
import Lead from './src/models/Lead.js';
import Import from './src/models/Import.js';
import dotenv from 'dotenv';

dotenv.config();

const companies = [
  'Salesforce', 'HubSpot', 'Microsoft', 'Google', 'Amazon', 'Meta', 'Apple', 
  'IBM', 'Oracle', 'Adobe', 'Shopify', 'Stripe', 'Atlassian', 'Slack',
  'Zoom', 'Dropbox', 'Notion', 'Figma', 'Canva', 'Mailchimp', 'Square',
  'PayPal', 'Netflix', 'Spotify', 'Uber', 'Airbnb', 'DoorDash', 'Lyft',
  'Coinbase', 'Robinhood', 'Plaid', 'Brex', 'Ramp', 'Gusto', 'Rippling'
];

const firstNames = [
  'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda',
  'William', 'Barbara', 'David', 'Elizabeth', 'Richard', 'Susan', 'Joseph', 'Jessica',
  'Thomas', 'Sarah', 'Christopher', 'Karen', 'Daniel', 'Nancy', 'Matthew', 'Lisa',
  'Anthony', 'Betty', 'Mark', 'Margaret', 'Donald', 'Sandra', 'Steven', 'Ashley',
  'Paul', 'Kimberly', 'Andrew', 'Emily', 'Joshua', 'Donna', 'Kenneth', 'Michelle'
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
  'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker'
];

const titles = [
  'CEO', 'CTO', 'CFO', 'COO', 'VP Sales', 'VP Marketing', 'VP Engineering',
  'Head of Sales', 'Head of Marketing', 'Head of Product', 'Sales Director',
  'Marketing Director', 'Engineering Director', 'Sales Manager', 'Account Executive',
  'Business Development Manager', 'Product Manager', 'Engineering Manager',
  'Customer Success Manager', 'Operations Manager', 'Finance Director'
];

const domains = ['com', 'io', 'co', 'tech', 'app', 'ai'];

function generateLead(i) {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const company = companies[Math.floor(Math.random() * companies.length)];
  const title = titles[Math.floor(Math.random() * titles.length)];
  const domain = domains[Math.floor(Math.random() * domains.length)];
  
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${company.toLowerCase().replace(/\s/g, '')}.${domain}`;
  const phone = `+1${Math.floor(Math.random() * 900 + 100)}${Math.floor(Math.random() * 900 + 100)}${Math.floor(Math.random() * 9000 + 1000)}`;
  const hasLinkedIn = Math.random() > 0.3;
  const linkedin = hasLinkedIn ? `https://linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}` : null;
  
  // Calculate score based on title
  let titleScore = 0;
  if (title.includes('CEO') || title.includes('CTO') || title.includes('CFO')) titleScore = 15;
  else if (title.includes('VP') || title.includes('COO')) titleScore = 12;
  else if (title.includes('Director') || title.includes('Head')) titleScore = 10;
  else if (title.includes('Manager')) titleScore = 8;
  else titleScore = 5;
  
  const emailScore = 10;
  const companyScore = 20;
  const phoneScore = phone ? 10 : 0;
  const linkedinScore = linkedin ? 10 : 0;
  const completenessScore = Math.floor((5 / 5) * 35);
  
  const totalScore = emailScore + titleScore + companyScore + phoneScore + linkedinScore + completenessScore;
  
  let nextBestAction = 'Research and qualify further';
  if (totalScore >= 80) nextBestAction = 'Immediate outreach - high priority';
  else if (totalScore >= 60) nextBestAction = 'Schedule intro call';
  else if (totalScore >= 40) nextBestAction = 'Add to nurture sequence';
  
  let seniority = 'individual';
  if (/(ceo|cto|cfo|coo|chief)/i.test(title)) seniority = 'c-level';
  else if (/(vp|vice president)/i.test(title)) seniority = 'vp';
  else if (/(director|head)/i.test(title)) seniority = 'director';
  else if (/manager/i.test(title)) seniority = 'manager';
  
  return {
    email,
    firstName,
    lastName,
    company,
    title,
    phone,
    linkedin,
    status: 'new',
    industry: 'technology',
    seniority,
    emailValid: true,
    score: totalScore,
    scoreBreakdown: {
      email: emailScore,
      title: titleScore,
      company: companyScore,
      phone: phoneScore,
      linkedin: linkedinScore,
      completeness: completenessScore
    },
    nextBestAction
  };
}

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Clear existing data
    await Lead.deleteMany({});
    await Import.deleteMany({});
    console.log('🗑️  Cleared existing data');
    
    // Create import record
    const importDoc = await Import.create({
      filename: 'enterprise-leads-2025.csv',
      status: 'completed',
      totalRecords: 150,
      processedRecords: 150,
      duplicatesFound: 0,
      completedAt: new Date()
    });
    
    // Generate 150 leads
    const leads = [];
    for (let i = 0; i < 150; i++) {
      leads.push({
        ...generateLead(i),
        importId: importDoc._id,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000))
      });
    }
    
    await Lead.insertMany(leads);
    console.log('✅ Created 150 leads');
    
    console.log('\n📊 Summary:');
    const highPriority = leads.filter(l => l.score >= 80).length;
    const medium = leads.filter(l => l.score >= 60 && l.score < 80).length;
    const low = leads.filter(l => l.score < 60).length;
    
    console.log(`   High Priority (80+): ${highPriority}`);
    console.log(`   Medium Priority (60-79): ${medium}`);
    console.log(`   Low Priority (<60): ${low}`);
    console.log(`   Average Score: ${Math.round(leads.reduce((sum, l) => sum + l.score, 0) / leads.length)}`);
    
    console.log('\n🎉 Seed complete! Your AI Sales Ops Copilot now has impressive data!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

seed();
