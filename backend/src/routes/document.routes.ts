import { Router } from 'express';
import { upload } from '../middleware/upload.middleware';
import * as ctrl from '../controllers/document.controller';

const router = Router();

router.post('/upload', upload.array('files', 10), ctrl.uploadDocuments);
router.get('/', ctrl.getAllDocuments);
router.get('/:id', ctrl.getDocument);
router.delete('/:id', ctrl.deleteDocument);

export default router;
