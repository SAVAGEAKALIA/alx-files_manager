import express from 'express';
import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';

const router = express.Router();

// Define endpoints
router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);
router.post('/users', UsersController.postNew);
router.get('/connect', AppController.getConnect);
router.get('/disconnect', AppController.getDisconnect);
router.get('/users/me', UsersController.getMe);

export default router
