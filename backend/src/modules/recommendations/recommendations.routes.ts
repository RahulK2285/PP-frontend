import { Router } from 'express';
import { recommendationsController } from './recommendations.controller';
import { protect } from '../../middleware/auth.middleware';

const router = Router();

router.use(protect);
router.get('/', recommendationsController.getRecommendations);

export default router;
