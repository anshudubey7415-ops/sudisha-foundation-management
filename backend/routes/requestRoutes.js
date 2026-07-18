import express from 'express';
import { 
    createRequest, 
    getPendingRequests, 
    getMyRequests,  // Yeh import add kiya
    updateRequestStatus 
} from '../controllers/requestController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Manager request bhej sakta hai
router.post('/', verifyToken, createRequest);

// Manager apni bheji hui requests dekh sakta hai
router.get('/my-requests', verifyToken, getMyRequests);

// Admin saari pending requests dekh sakta hai
router.get('/pending', verifyToken, getPendingRequests);

// Admin request ko approve ya reject kar sakta hai
router.put('/:id', verifyToken, updateRequestStatus);

export default router;