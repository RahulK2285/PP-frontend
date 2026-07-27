import { Router } from 'express';
import { resumeController } from './resume.controller';
import { protect } from '../../middleware/auth.middleware';
import { uploadResume } from '../../middleware/upload.middleware';

const router = Router();

router.use(protect);

router.post('/upload', uploadResume.single('resume'), resumeController.upload);
router.get('/', resumeController.getAll);
router.delete('/:id', resumeController.delete);
router.get('/:id/download', resumeController.download);
router.get('/:id/preview', resumeController.preview);
router.post('/:id/rescore', resumeController.rescore);

export default router;
