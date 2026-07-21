import Request from '../models/Request.js';
import Student from '../models/Student.js';
import Intern from '../models/Intern.js';
import Volunteer from '../models/Volunteer.js';

// 1. Nayi request create karna
export const createRequest = async (req, res) => {
    try {
        const { targetUserId, targetCollection, changeType, changes, reason } = req.body;
        const newRequest = new Request({
            managerId: req.user.id,
            targetUserId,
            targetCollection,
            changeType,
            changes,
            reason
        });
        await newRequest.save();
        res.status(201).json({ message: "Request sent to Admin successfully!" });
    } catch (err) {
        res.status(500).json({ message: "Failed to create request", error: err.message });
    }
};

// 2. Admin ke liye pending requests
export const getPendingRequests = async (req, res) => {
    try {
        const requests = await Request.find({ status: 'pending' }).populate('managerId');
        res.status(200).json(requests);
    } catch (err) {
        res.status(500).json({ message: "Error fetching requests" });
    }
};

// 3. Manager ke liye apni requests
export const getMyRequests = async (req, res) => {
    try {
        const requests = await Request.find({ managerId: req.user.id });
        res.status(200).json(requests);
    } catch (err) {
        res.status(500).json({ message: "Error fetching your requests" });
    }
};

// 4. Admin ka Approve/Reject logic (Dynamic)
export const updateRequestStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'approved' ya 'rejected'
        
        const request = await Request.findById(id);
        if (!request) return res.status(404).json({ message: "Request not found" });

        if (status === 'approved') {
            const { targetCollection, targetUserId, changes } = request;
            
            // Dynamic collection selection
            const models = {
                'students': Student,
                'interns': Intern,
                'volunteers': Volunteer
            };

            const Model = models[targetCollection];
            if (!Model) return res.status(400).json({ message: "Invalid collection" });

            await Model.findByIdAndUpdate(targetUserId, changes);
        }
        
        request.status = status;
        await request.save();
        
        res.status(200).json({ message: `Request ${status} successfully` });
    } catch (err) {
        res.status(500).json({ message: "Failed to update status", error: err.message });
    }
};