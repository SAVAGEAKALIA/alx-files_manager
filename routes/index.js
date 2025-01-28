/* eslint-disable */
import express from 'express';
import AppController from '../controllers/AppController';
import AuthController from '../controllers/AuthController';
import UserController from '../controllers/UserController';
import FilesController from '../controllers/FilesController';

const router = express.Router();

// Define endpoints
router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);
router.post('/users', UserController.postNew);
router.get('/connect', AuthController.getConnect);
router.get('/disconnect', AuthController.getDisconnect);
router.get('/users/me', UserController.getMe);
router.post('/files', FilesController.postUpload);
router.get('/files', FilesController.getIndex);
router.get('/files/:id', FilesController.getShow)
router.put('/files/:id/publish', FilesController.putPublish)
router.put('/files/:id/unpublish', FilesController.putUnpublish)
router.get('/files/:id/data', FilesController.getFile)
export default router
