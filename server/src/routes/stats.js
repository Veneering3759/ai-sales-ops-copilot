import express from 'express';
import Lead from '../models/Lead.js';
import Import from '../models/Import.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const totalLeads = await Lead.countDocuments();
    const totalImports = await Import.countDocuments();

    let averageScore = 0;
    let scoreDistribution = [];
    let topIndustries = [];

    // Only run aggregations if there are leads
    if (totalLeads > 0) {
      const avgScore = await Lead.aggregate([
        { $group: { _id: null, avg: { $avg: '$score' } } }
      ]);
      averageScore = avgScore[0]?.avg || 0;

      scoreDistribution = await Lead.aggregate([
        {
          $bucket: {
            groupBy: '$score',
            boundaries: [0, 40, 60, 80, 100],
            default: 'other',
            output: { count: { $sum: 1 } }
          }
        }
      ]);

      topIndustries = await Lead.aggregate([
        { $group: { _id: '$industry', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]);
    }

    res.json({
      totalLeads,
      totalImports,
      averageScore,
      scoreDistribution,
      topIndustries
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
