import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { Resume } from './resume.model';
import { analyzeResume } from './resume.service';
import fs from 'fs';
import path from 'path';

export const resumeController = {
  async upload(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
      }

      // Analyze the resume and get score
      let score = null;
      try {
        score = await analyzeResume(req.file.path, req.file.mimetype);
      } catch (err) {
        console.error('Resume scoring error:', err);
        // Non-fatal — still save the resume even if scoring fails
      }

      const resume = await Resume.create({
        userId: req.user!._id,
        fileName: req.file.filename,
        originalName: req.file.originalname,
        filePath: req.file.path,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        score,
      });

      res.status(201).json(resume);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async getAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const resumes = await Resume.find({ userId: req.user!._id }).sort({ createdAt: -1 });
      res.json(resumes);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const resume = await Resume.findOneAndDelete({
        _id: req.params.id,
        userId: req.user!._id,
      });

      if (!resume) {
        res.status(404).json({ error: 'Resume not found' });
        return;
      }

      // Delete file from disk
      if (fs.existsSync(resume.filePath)) {
        fs.unlinkSync(resume.filePath);
      }

      res.json({ message: 'Resume deleted' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async download(req: AuthRequest, res: Response): Promise<void> {
    try {
      const resume = await Resume.findOne({
        _id: req.params.id,
        userId: req.user!._id,
      });

      if (!resume) {
        res.status(404).json({ error: 'Resume not found' });
        return;
      }

      res.download(resume.filePath, resume.originalName);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  // Serve the file content for in-browser preview
  async preview(req: AuthRequest, res: Response): Promise<void> {
    try {
      const resume = await Resume.findOne({
        _id: req.params.id,
        userId: req.user!._id,
      });

      if (!resume) {
        res.status(404).json({ error: 'Resume not found' });
        return;
      }

      if (!fs.existsSync(resume.filePath)) {
        res.status(404).json({ error: 'File not found on disk' });
        return;
      }

      res.setHeader('Content-Type', resume.mimeType);
      res.setHeader('Content-Disposition', `inline; filename="${resume.originalName}"`);
      const stream = fs.createReadStream(resume.filePath);
      stream.pipe(res);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  // Re-score an existing resume
  async rescore(req: AuthRequest, res: Response): Promise<void> {
    try {
      const resume = await Resume.findOne({
        _id: req.params.id,
        userId: req.user!._id,
      });

      if (!resume) {
        res.status(404).json({ error: 'Resume not found' });
        return;
      }

      const score = await analyzeResume(resume.filePath, resume.mimeType);
      resume.score = score;
      await resume.save();

      res.json(resume);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
};
