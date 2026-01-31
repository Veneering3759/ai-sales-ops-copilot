import express from 'express';
import multer from 'multer';
import Import from '../models/Import.js';
import { processImport } from '../services/processor.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const importDoc = await Import.create({
      filename: req.file.originalname,
      status: 'queued'
    });
    
    processImport(importDoc, req.file.path);
    
    res.json(importDoc);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const imports = await Import.find().sort({ createdAt: -1 }).limit(20);
    res.json(imports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const importDoc = await Import.findById(req.params.id);
    if (!importDoc) {
      return res.status(404).json({ error: 'Import not found' });
    }
    res.json(importDoc);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Import.findByIdAndDelete(req.params.id);
    res.json({ message: 'Import deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
