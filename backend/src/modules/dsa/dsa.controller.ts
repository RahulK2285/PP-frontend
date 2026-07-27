import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { dsaService } from './dsa.service';

export const dsaController = {
  async getProblems(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { topic, difficulty, status } = req.query;
      const problems = await dsaService.getProblems(String(req.user!._id), {
        topic: topic as string | undefined,
        difficulty: difficulty as string | undefined,
        status: status as string | undefined,
      });
      res.json(problems);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async createProblem(req: AuthRequest, res: Response): Promise<void> {
    try {
      const problem = await dsaService.createProblem(String(req.user!._id), req.body);
      res.status(201).json(problem);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async updateProblem(req: AuthRequest, res: Response): Promise<void> {
    try {
      const problem = await dsaService.updateProblem(
        String(req.user!._id),
        req.params.id as string,
        req.body
      );
      res.json(problem);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  },

  async deleteProblem(req: AuthRequest, res: Response): Promise<void> {
    try {
      await dsaService.deleteProblem(String(req.user!._id), req.params.id as string);
      res.json({ message: 'Problem deleted' });
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  },

  async syncLeetCode(req: AuthRequest, res: Response): Promise<void> {
    try {
      const username = req.user!.leetcodeUsername;
      if (!username) {
        res.status(400).json({ error: 'LeetCode username not set. Update your profile first.' });
        return;
      }
      const result = await dsaService.syncLeetCode(
        String(req.user!._id),
        username,
        parseInt(String(req.query.limit)) || 20
      );
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async getLeetCodeProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const username = req.user!.leetcodeUsername;
      if (!username) {
        res.status(400).json({ error: 'LeetCode username not set' });
        return;
      }
      const profile = await dsaService.getLeetCodeProfile(username);
      res.json(profile);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async getAnalytics(req: AuthRequest, res: Response): Promise<void> {
    try {
      const analytics = await dsaService.getAnalytics(String(req.user!._id));
      res.json(analytics);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
};
