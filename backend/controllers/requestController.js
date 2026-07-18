import Request from '../models/Request.js';
import User from '../models/User.js';

// 1. Manager ki nayi request create karna
export const createRequest = async (req, res) => {
    try {
        const { targetUserId, changeType, changes } = req.body;
        const newRequest = new Request({
            managerId: req.user.id, // Token se milega
            targetUserId,
            changeType,
            changes
        });
        await newRequest.save();
        res.status(201).json({ message: "Request sent to Admin successfully!" });
    } catch (err) {
        res.status(500).json({ message: "Failed to create request" });
    }
};

// 2. Admin ke liye sabhi 'pending' requests dekhna
export const getPendingRequests = async (req, res) => {
    try {
        const requests = await Request.find({ status: 'pending' }).populate('managerId targetUserId');
        res.status(200).json(requests);
    } catch (err) {
        res.status(500).json({ message: "Error fetching requests" });
    }
};

// 3. Manager ke liye unki apni requests dekhna (Naya Add kiya)
export const getMyRequests = async (req, res) => {
    try {
        const requests = await Request.find({ managerId: req.user.id }).populate('targetUserId');
        res.status(200).json(requests);
    } catch (err) {
        res.status(500).json({ message: "Error fetching your requests" });
    }
};

// 4. Admin ka Approve/Reject logic
export const updateRequestStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'approved' ya 'rejected'
        
        const request = await Request.findByIdAndUpdate(id, { status }, { new: true });
        
        if (!request) return res.status(404).json({ message: "Request not found" });

        if (status === 'approved') {
            // User ke data ko update karna
            await User.findByIdAndUpdate(request.targetUserId, request.changes);
        }
        
        res.status(200).json({ message: `Request ${status} successfully` });
    } catch (err) {
        res.status(500).json({ message: "Failed to update status" });
    }
};