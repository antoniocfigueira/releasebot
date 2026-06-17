import express from 'express';
import {
  chat,
  deleteRelease,
  getCampaigns,
  getReleases,
  postRelease,
  putRelease,
  stream
} from '../controllers/aiController.js';

const router = express.Router();

router.post('/ai/chat', chat);
router.get('/ai/stream', stream);

router.get('/releases', getReleases);
router.post('/releases', postRelease);
router.put('/releases/:id', putRelease);
router.delete('/releases/:id', deleteRelease);

router.get('/campaigns', getCampaigns);

export default router;
