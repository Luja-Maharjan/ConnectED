import Complaint from "../models/complaint.model.js";
import { errorHandler } from "../utils/error.js";

// Create a new complaint (anonymous or with user ID)
export const createComplaint = async (req, res, next) => {
    try {
        const { title, description, category, isAnonymous } = req.body;
        
        if (!title || !description) {
            return next(errorHandler(400, 'Title and description are required'));
        }
        
        const complaintData = {
            title,
            description,
            category: category || 'other',
            isAnonymous: isAnonymous !== false, // Default to true
        };

        // If user is logged in and not anonymous, include userId
        // Check if token exists in cookies to determine if user is logged in
        if (req.user && isAnonymous === false) {
            complaintData.userId = req.user.id;
            complaintData.isAnonymous = false;
        } else {
            // Anonymous complaint - no userId
            complaintData.isAnonymous = true;
        }

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

// Get all complaints (Admin only)
export const getAllComplaints = async (req, res, next) => {
    try {
        const complaints = await Complaint.find()
            .populate('userId', 'username email role')
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

