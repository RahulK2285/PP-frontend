import { Router } from 'express';
import { referralController } from './referral.controller';
import { protect } from '../../middleware/auth.middleware';

const router = Router();

router.use(protect);

router.post('/', referralController.create);
router.get('/', referralController.getAll);
router.put('/:id/status', referralController.updateStatus);
router.delete('/:id', referralController.delete);

export default router;
