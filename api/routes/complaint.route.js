import express from 'express';
import { 
    createComplaint, 
    getAllComplaints, 
    getMyComplaints,
    updateComplaintStatus,
    deleteComplaint
} from '../controllers/complaint.controller.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { optionalVerifyToken } from '../middleware/optionalVerifyToken.js';
import { verifyAdmin } from '../middleware/verifyAdmin.js';

const router = express.Router();

// Create complaint (can be anonymous - token optional)
// If token is provided, user can choose to be anonymous or not
router.post('/create', optionalVerifyToken, createComplaint);

// Get all complaints (Admin only)
router.get('/all', verifyToken, verifyAdmin, getAllComplaints);

// Get my complaints (Student - requires token)
router.get('/my-complaints', verifyToken, getMyComplaints);

// Update complaint status (Admin only)
router.put('/:complaintId/update', verifyToken, verifyAdmin, updateComplaintStatus);

// Delete complaint (Admin only)
router.delete('/:complaintId/delete', verifyToken, verifyAdmin, deleteComplaint);

export default router;

