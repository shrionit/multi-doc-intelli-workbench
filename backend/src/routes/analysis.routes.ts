import { Router } from 'express';
import * as ctrl from '../controllers/analysis.controller';

const router = Router();

router.post('/', ctrl.createAnalysis);
router.get('/', ctrl.getAllAnalyses);
router.get('/:id', ctrl.getAnalysis);

export default router;
