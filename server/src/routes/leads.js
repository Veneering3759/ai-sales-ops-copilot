import express from 'express';
import Lead from '../models/Lead.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { status, minScore, maxScore, industry, seniority, search, limit = 50, page = 1 } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (minScore) query.score = { $gte: parseInt(minScore) };
    if (maxScore) query.score = { ...query.score, $lte: parseInt(maxScore) };
    if (industry) query.industry = industry;
    if (seniority) query.seniority = seniority;
    if (search) {
      query.$or = [
        { email: new RegExp(search, 'i') },
        { firstName: new RegExp(search, 'i') },
        { lastName: new RegExp(search, 'i') },
        { company: new RegExp(search, 'i') }
      ];
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Lead.countDocuments(query);
    
    const leads = await Lead.find(query)
      .sort({ score: -1 })
      .limit(parseInt(limit))
      .skip(skip);
    
    res.json({
      leads,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    res.json(lead);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.json(lead);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/bulk/update', async (req, res) => {
  try {
    const { leadIds, updates } = req.body;
    
    await Lead.updateMany(
      { _id: { $in: leadIds } },
      { $set: updates }
    );
    
    res.json({ message: `Updated ${leadIds.length} leads`, count: leadIds.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/export', async (req, res) => {
  try {
    const { format = 'standard', leadIds } = req.body;
    
    const query = leadIds ? { _id: { $in: leadIds } } : {};
    const leads = await Lead.find(query).sort({ score: -1 });
    
    let csv;
    
    if (format === 'salesforce') {
      csv = [
        'First Name,Last Name,Email,Company,Title,Phone,Lead Source,Lead Status,Rating',
        ...leads.map(l => 
          `${l.firstName},${l.lastName},${l.email},${l.company},${l.title},${l.phone || ''},Import,New,${l.score >= 80 ? 'Hot' : l.score >= 60 ? 'Warm' : 'Cold'}`
        )
      ].join('\n');
    } else if (format === 'hubspot') {
      csv = [
        'First Name,Last Name,Email,Company Name,Job Title,Phone Number,Lead Status,HubSpot Score',
        ...leads.map(l => 
          `${l.firstName},${l.lastName},${l.email},${l.company},${l.title},${l.phone || ''},NEW,${l.score}`
        )
      ].join('\n');
    } else {
      csv = [
        'Email,First Name,Last Name,Company,Title,Phone,Score,Next Action,Industry,Seniority',
        ...leads.map(l => 
          `${l.email},${l.firstName},${l.lastName},${l.company},${l.title},${l.phone || ''},${l.score},${l.nextBestAction},${l.industry},${l.seniority}`
        )
      ].join('\n');
    }
    
    res.header('Content-Type', 'text/csv');
    res.attachment(`leads-export-${format}-${Date.now()}.csv`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// AI Email Generation Endpoint
router.post('/generate-email', async (req, res) => {
  try {
    const { lead, emailType } = req.body;
    
    const templates = {
      cold: `Hi ${lead.firstName},

I noticed ${lead.company} is scaling fast and wanted to reach out about something that might save your team significant time.

As ${lead.title}, you're likely dealing with manual lead processing, data cleanup, and scoring. We built an AI-powered platform that handles this automatically - processing 5,000+ leads in under 30 seconds with 95% deduplication accuracy.

Our clients typically see 10x faster lead qualification and 3x more meetings booked.

Would a quick 15-minute demo make sense? I can show you how it works with your actual data.

Best,
[Your Name]`,
      
      followup: `Hi ${lead.firstName},

Quick follow-up on my email from last week about automating your lead ops.

Just thought you'd find this interesting: ${lead.company}'s competitors are now processing leads 10x faster using AI automation. One similar company reduced their sales ops headcount by 60% while actually improving lead quality.

Worth a quick chat this week?

Best,
[Your Name]`,
      
      meeting: `Hi ${lead.firstName},

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
[Your Name]`
    };
    
    const email = templates[emailType] || templates.cold;
    res.json({ email });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
