import { Request, Response } from 'express';
import { authService } from './auth.service';
import { AuthRequest } from '../../middleware/auth.middleware';

export const authController = {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password, leetcodeUsername } = req.body;
      if (!name || !email || !password) {
        res.status(400).json({ error: 'Name, email, and password are required' });
        return;
      }
      const result = await authService.register({ name, email, password, leetcodeUsername });
      res.status(201).json(result);
    } catch (error: any) {
      const status = error.message === 'Email already registered' ? 409 : 500;
      res.status(status).json({ error: error.message });
    }
  },

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
      }
      const result = await authService.login(email, password);
      res.json(result);
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  },

  async getMe(req: AuthRequest, res: Response): Promise<void> {
    try {
      const profile = await authService.getProfile(String(req.user!._id));
      res.json(profile);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  },

  async updateMe(req: AuthRequest, res: Response): Promise<void> {
    try {
      const updated = await authService.updateProfile(String(req.user!._id), req.body);
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },
};
