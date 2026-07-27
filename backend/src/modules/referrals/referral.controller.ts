import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { Referral } from './referral.model';

export const referralController = {
  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { company, role, message } = req.body;
      if (!company || !role || !message) {
        res.status(400).json({ error: 'Company, role, and message are required' });
        return;
      }

      const referral = await Referral.create({
        userId: req.user!._id,
        company,
        role,
        message,
      });

      res.status(201).json(referral);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async getAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const referrals = await Referral.find({ userId: req.user!._id }).sort({ createdAt: -1 });
      res.json(referrals);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async updateStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { status } = req.body;
      const validStatuses = ['Applied', 'Under Review', 'Referral Sent', 'Interview Set', 'Rejected'];
      if (!validStatuses.includes(status)) {
        res.status(400).json({ error: 'Invalid status' });
        return;
      }

      const referral = await Referral.findOneAndUpdate(
        { _id: req.params.id, userId: req.user!._id },
        { status },
        { new: true }
      );

      if (!referral) {
        res.status(404).json({ error: 'Referral not found' });
        return;
      }

      res.json(referral);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const referral = await Referral.findOneAndDelete({
        _id: req.params.id,
        userId: req.user!._id,
      });

      if (!referral) {
        res.status(404).json({ error: 'Referral not found' });
        return;
      }

      res.json({ message: 'Referral deleted' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
};
