import express from 'express';
import { 
    createRequest, 
    getAllRequests,
    getPendingRequests, 
    getMyRequests,
    updateRequestStatus 
} from '../controllers/requestController.js';
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Manager creates request
router.post('/', verifyToken, createRequest);

// Manager views their own requests
router.get('/my-requests', verifyToken, getMyRequests);

// Admin views all pending requests
router.get('/pending', verifyToken, isAdmin, getPendingRequests);

// Admin views all requests (with optional ?status= query)
router.get('/', verifyToken, isAdmin, getAllRequests);

// Admin approves/rejects request via url action
router.put('/:id/:action', verifyToken, isAdmin, updateRequestStatus);

// Admin approves/rejects request via body
router.put('/:id', verifyToken, isAdmin, updateRequestStatus);

export default router;