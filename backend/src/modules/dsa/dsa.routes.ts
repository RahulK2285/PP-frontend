import { Router } from 'express';
import { dsaController } from './dsa.controller';
import { protect } from '../../middleware/auth.middleware';

const router = Router();

router.use(protect);

router.get('/', dsaController.getProblems);
router.post('/', dsaController.createProblem);
router.put('/:id', dsaController.updateProblem);
router.delete('/:id', dsaController.deleteProblem);

router.post('/sync-leetcode', dsaController.syncLeetCode);
router.get('/leetcode-profile', dsaController.getLeetCodeProfile);
router.get('/analytics', dsaController.getAnalytics);

export default router;
