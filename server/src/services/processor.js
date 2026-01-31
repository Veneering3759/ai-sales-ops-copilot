import { parseCSV } from './csvParser.js';
import { enrichLead } from './enrichment.js';
import { scoreLead } from './scoring.js';
import { findDuplicate } from './deduplication.js';
import Lead from '../models/Lead.js';
import Import from '../models/Import.js';

export const processImport = async (importDoc, filepath) => {
  try {
    await Import.findByIdAndUpdate(importDoc._id, { status: 'processing' });
    
    const records = await parseCSV(filepath);
    await Import.findByIdAndUpdate(importDoc._id, { totalRecords: records.length });
    
    let processed = 0;
    let duplicates = 0;
    
    for (const record of records) {
      const enriched = enrichLead(record);
      const scored = scoreLead(enriched);
      
      const duplicate = await findDuplicate(enriched);
      if (duplicate) {
        duplicates++;
        processed++;
        continue;
      }
      
      await Lead.create({
        ...enriched,
        ...scored,
        importId: importDoc._id,
        rawData: record
      });
      
      processed++;
      
      if (processed % 10 === 0) {
        await Import.findByIdAndUpdate(importDoc._id, {
          processedRecords: processed,
          duplicatesFound: duplicates
        });
      }
    }
    
    await Import.findByIdAndUpdate(importDoc._id, {
      status: 'completed',
      processedRecords: processed,
      duplicatesFound: duplicates,
      completedAt: new Date()
    });
    
  } catch (error) {
    await Import.findByIdAndUpdate(importDoc._id, {
      status: 'failed',
      errorMessage: error.message
    });
  }
};
