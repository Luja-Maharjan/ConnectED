import Complaint from "../models/complaint.model.js";
import { errorHandler } from "../utils/error.js";

// Priority scoring algorithm
const calculatePriorityScore = (category, urgency, createdAt) => {
    let score = 0;
    
    // Category priority: bullying > other categories > infrastructure (facility)
    const categoryWeights = {
        'bullying': 100,
        'academic': 30,
        'staff': 30,
        'other': 20,
        'facility': 10, // Infrastructure has lowest priority
    };
    score += categoryWeights[category] || 20;
    
    // Urgency level weights
    const urgencyWeights = {
        'critical': 50,
        'high': 30,
        'medium': 15,
        'low': 5,
    };
    score += urgencyWeights[urgency] || 15;
    
    // Time pending: older complaints get higher priority
    // Calculate days since creation (in milliseconds)
    const now = new Date();
    const daysPending = (now - createdAt) / (1000 * 60 * 60 * 24); // Convert to days
    // Add 1 point per day pending (max 30 days = 30 points)
    score += Math.min(daysPending, 30);
    
    return Math.round(score);
};

// Create a new complaint (requires login)
export const createComplaint = async (req, res, next) => {
    try {
        // Require authentication
        if (!req.user) {
            return next(errorHandler(401, 'You must be logged in to submit a complaint'));
        }
        
        const { title, description, category, urgency, isAnonymous } = req.body;
        
        if (!title || !description) {
            return next(errorHandler(400, 'Title and description are required'));
        }
        
        if (!urgency || !['low', 'medium', 'high', 'critical'].includes(urgency)) {
            return next(errorHandler(400, 'Valid urgency level is required (low, medium, high, critical)'));
        }
        
        const complaintData = {
            title,
            description,
            category: category || 'other',
            urgency: urgency || 'medium',
            isAnonymous: isAnonymous === true, // Default to false for logged-in users
            userId: req.user.id, // Always include userId since login is required
        };

        // Calculate priority score
        const createdAt = new Date();
        complaintData.priorityScore = calculatePriorityScore(
            complaintData.category,
            complaintData.urgency,
            createdAt
        );

        const newComplaint = new Complaint(complaintData);
        await newComplaint.save();

        res.status(201).json({
            success: true,
            message: 'Complaint submitted successfully',
            complaint: newComplaint
        });
    } catch (error) {
        next(error);
    }
};

// Get all complaints (Admin only) - sorted by priority
export const getAllComplaints = async (req, res, next) => {
    try {
        const complaints = await Complaint.find()
            .populate('userId', 'username email role')
            .populate('updates.updatedBy', 'username role');
        
        // Recalculate priority scores for all pending/in-progress complaints
        // (to account for time pending changes)
        for (const complaint of complaints) {
            if (complaint.status === 'pending' || complaint.status === 'in-progress') {
                complaint.priorityScore = calculatePriorityScore(
                    complaint.category,
                    complaint.urgency,
                    complaint.createdAt
                );
                await complaint.save();
            }
        }
        
        // Sort by priority score (highest first), then by creation date
        complaints.sort((a, b) => {
            if (b.priorityScore !== a.priorityScore) {
                return b.priorityScore - a.priorityScore;
            }
            return new Date(a.createdAt) - new Date(b.createdAt); // Older first if same priority
        });
        
        res.status(200).json({
            success: true,
            complaints
        });
    } catch (error) {
        next(error);
    }
};

// Get own complaints (Student)
export const getMyComplaints = async (req, res, next) => {
    try {
        const complaints = await Complaint.find({ userId: req.user.id })
            .populate('updates.updatedBy', 'username role')
            .sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            complaints
        });
    } catch (error) {
        next(error);
    }
};

// Update complaint status (Admin only)
export const updateComplaintStatus = async (req, res, next) => {
    try {
        const { complaintId } = req.params;
        const { status, adminResponse } = req.body;

        if(!status && !adminResponse){
            return next(errorHandler(400, 'Provide a status or progress update message.'));
        }

        const complaint = await Complaint.findById(complaintId)
            .populate('userId', 'username email role')
            .populate('updates.updatedBy', 'username role');

        if (!complaint) {
            return next(errorHandler(404, 'Complaint not found'));
        }

        if (status) {
            complaint.status = status;
        }

        if (adminResponse) {
            complaint.adminResponse = adminResponse;
        }

        complaint.updates.push({
            status: status || undefined,
            message: adminResponse || '',
            updatedBy: req.user.id,
        });

        const updatedComplaint = await complaint.save();

        await updatedComplaint.populate('userId', 'username email role');
        await updatedComplaint.populate('updates.updatedBy', 'username role');

        res.status(200).json({
            success: true,
            message: 'Complaint updated successfully',
            complaint: updatedComplaint
        });
    } catch (error) {
        next(error);
    }
};

// Delete complaint (Admin only)
export const deleteComplaint = async (req, res, next) => {
    try {
        const { complaintId } = req.params;
        
        const complaint = await Complaint.findByIdAndDelete(complaintId);
        
        if (!complaint) {
            return next(errorHandler(404, 'Complaint not found'));
        }

        res.status(200).json({
            success: true,
            message: 'Complaint deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

