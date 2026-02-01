import express from 'express';
import Lead from '../models/Lead.js';
import { generatePersonalizedEmail } from '../services/ai/emailGenerator.js';

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

// AI Email Generation Endpoint - NOW WITH REAL AI! 🤖
router.post('/generate-email', async (req, res) => {
  try {
    const { lead, emailType } = req.body;

    // Validate input
    if (!lead || !emailType) {
      return res.status(400).json({ error: 'Lead and emailType are required' });
    }

    // Generate AI-powered personalized email
    const result = await generatePersonalizedEmail({
      lead,
      emailType,
      options: {
        maxTokens: 400,
        temperature: 0.7,
      },
    });

    // Return email with metadata
    res.json({
      email: result.email,
      subject: result.subject,
      metadata: result.metadata,
      warning: result.warning, // Only present if using fallback
    });
  } catch (error) {
    console.error('Email generation error:', error);
    res.status(500).json({
      error: 'Failed to generate email',
      details: error.message
    });
  }
});

export default router;
