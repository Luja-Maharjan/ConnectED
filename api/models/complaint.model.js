import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema({
    title:{
        type: String,
        required: true,
    },
    description:{
        type: String,
        required: true,
    },
    category:{
        type: String,
        enum: ['academic', 'facility', 'staff', 'other'],
        default: 'other',
    },
    status:{
        type: String,
        enum: ['pending', 'in-progress', 'resolved', 'rejected'],
        default: 'pending',
    },
    isAnonymous:{
        type: Boolean,
        default: true,
    },
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false, // Optional for anonymous complaints
    },
    adminResponse:{
        type: String,
        default: '',
    },
    updates:{
        type:[{
            message:{
                type: String,
            },
            status:{
                type: String,
                enum: ['pending', 'in-progress', 'resolved', 'rejected'],
            },
            updatedBy:{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
            createdAt:{
                type: Date,
                default: Date.now,
            }
        }],
        default: [],
    },
},{timestamps:true});

const Complaint = mongoose.model('Complaint', complaintSchema)

export default Complaint;

