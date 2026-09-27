import Request from '../models/Request.js';
import Student from '../models/student.js';
import Intern from '../models/Intern.js';
import Volunteer from '../models/Volunteer.js';
import Project from '../models/Project.js';
import User from '../models/User.js';
import Attendance from '../models/Attendance.js';
import InternAttendance from '../models/InternAttendance.js';
import VolunteerAttendance from '../models/VolunteerAttendance.js';
import bcrypt from 'bcryptjs';
import { sendNewPasswordEmail } from '../utils/emailService.js';

// 1. Create request
export const createRequest = async (req, res) => {
    try {
        const { targetUserId, targetName, targetCollection, changeType, changes, reason } = req.body;
        const newRequest = new Request({
            managerId: req.user?.id || req.user?._id,
            targetUserId: targetUserId || null,
            targetName: targetName || "",
            targetCollection: targetCollection || "students",
            changeType: changeType || "update_profile",
            changes: changes || {},
            reason: reason || ""
        });
        await newRequest.save();
        res.status(201).json({ message: "Request sent to Admin successfully!", request: newRequest });
    } catch (err) {
        res.status(500).json({ message: "Failed to create request", error: err.message });
    }
};

// 2. Get all requests with optional status query
export const getAllRequests = async (req, res) => {
    try {
        const filter = {};
        if (req.query.status && req.query.status !== 'all') {
            filter.status = req.query.status.toLowerCase();
        }
        const requests = await Request.find(filter)
            .populate('managerId', 'name email role')
            .sort({ createdAt: -1 });
        res.status(200).json(requests);
    } catch (err) {
        res.status(500).json({ message: "Error fetching requests", error: err.message });
    }
};

// 3. Get pending requests for Admin
export const getPendingRequests = async (req, res) => {
    try {
        const requests = await Request.find({ status: 'pending' })
            .populate('managerId', 'name email role')
            .sort({ createdAt: -1 });
        res.status(200).json(requests);
    } catch (err) {
        res.status(500).json({ message: "Error fetching requests", error: err.message });
    }
};

// 4. Get Manager's requests
export const getMyRequests = async (req, res) => {
    try {
        const requests = await Request.find({ managerId: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json(requests);
    } catch (err) {
        res.status(500).json({ message: "Error fetching your requests", error: err.message });
    }
};

// 5. Admin Approve/Reject logic
export const updateRequestStatus = async (req, res) => {
    try {
        const { id, action } = req.params;
        let status = req.body?.status;
        if (!status && action) {
            status = action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : action;
        }
        
        if (!status) {
            return res.status(400).json({ message: "Status is required (approved or rejected)" });
        }

        const request = await Request.findById(id);
        if (!request) return res.status(404).json({ message: "Request not found" });

        let newPasswordIssued = null;

        if (status === 'approved') {
            const { targetCollection, targetUserId, changeType, changes } = request;
            
            // Handle Password Reset Requests for Interns / Managers / Volunteers
            if (changeType === 'password_reset_request' || targetCollection === 'users' || targetCollection === 'passwords') {
                let targetUser = null;
                if (targetUserId) {
                    targetUser = await User.findById(targetUserId);
                }
                if (!targetUser && changes?.email) {
                    targetUser = await User.findOne({ email: changes.email.toLowerCase().trim() });
                }

                if (targetUser) {
                    // Admin specified password OR generate a clean strong default
                    const assignedPassword = (req.body?.newPassword || changes?.newPassword || `Sudisha@${Math.floor(1000 + Math.random() * 9000)}`).trim();
                    newPasswordIssued = assignedPassword;

                    const hashedPassword = await bcrypt.hash(assignedPassword, 10);
                    targetUser.password = hashedPassword;
                    await targetUser.save();

                    // Send Email to user with their new password
                    await sendNewPasswordEmail(targetUser.email, assignedPassword, targetUser.name, targetUser.role);

                    request.changes = {
                        ...(request.changes || {}),
                        newPasswordIssued: assignedPassword,
                        resolvedAt: new Date()
                    };
                }
            }
            // Handle Delete Requests
            else if (changeType === 'delete_student' || (changeType.includes('delete') && targetCollection === 'students')) {
                if (targetUserId) {
                    await Student.findByIdAndDelete(targetUserId);
                    await Attendance.deleteMany({ student: targetUserId });
                }
            } else if (changeType === 'delete_intern' || (changeType.includes('delete') && targetCollection === 'interns')) {
                if (targetUserId) {
                    await Intern.findByIdAndDelete(targetUserId);
                    await InternAttendance.deleteMany({ intern: targetUserId });
                }
            } else if (changeType === 'delete_volunteer' || (changeType.includes('delete') && targetCollection === 'volunteers')) {
                if (targetUserId) {
                    await Volunteer.findByIdAndDelete(targetUserId);
                    await VolunteerAttendance.deleteMany({ volunteer: targetUserId });
                }
            } 
            // Handle Edit Student Profile
            else if (changeType === 'edit_student_profile' || (targetCollection === 'students' && !changeType.includes('attendance'))) {
                if (targetUserId && changes) {
                    await Student.findByIdAndUpdate(targetUserId, changes, { new: true });
                }
            }
            // Handle Edit Student Attendance
            else if (changeType === 'edit_student_attendance' || targetCollection === 'student_attendance') {
                if (changes?.records && Array.isArray(changes.records)) {
                    const operations = changes.records.map((record) => ({
                        updateOne: {
                            filter: { student: record.student, date: record.date },
                            update: { status: record.status },
                            upsert: true,
                        },
                    }));
                    await Attendance.bulkWrite(operations);
                } else if (changes?.student && changes?.date) {
                    await Attendance.findOneAndUpdate(
                        { student: changes.student, date: changes.date },
                        { status: changes.status },
                        { upsert: true }
                    );
                }
            }
            // Handle Edit Intern Attendance
            else if (changeType === 'edit_intern_attendance' || targetCollection === 'intern_attendance') {
                if (changes?.records && Array.isArray(changes.records)) {
                    const operations = changes.records.map((record) => ({
                        updateOne: {
                            filter: { intern: record.intern, date: record.date },
                            update: { status: record.status },
                            upsert: true,
                        },
                    }));
                    await InternAttendance.bulkWrite(operations);
                } else if (changes?.intern && changes?.date) {
                    await InternAttendance.findOneAndUpdate(
                        { intern: changes.intern, date: changes.date },
                        { status: changes.status },
                        { upsert: true }
                    );
                }
            }
            // Handle Edit Volunteer Attendance
            else if (changeType === 'edit_volunteer_attendance' || targetCollection === 'volunteer_attendance') {
                if (targetUserId && changes) {
                    await VolunteerAttendance.findByIdAndUpdate(targetUserId, changes);
                } else if (changes?.records && Array.isArray(changes.records)) {
                    for (const r of changes.records) {
                        await VolunteerAttendance.findOneAndUpdate(
                            { volunteer: r.volunteer, date: r.date },
                            { status: r.status, checkIn: r.checkIn || "", checkOut: r.checkOut || "", hoursWorked: r.hoursWorked || 0, remarks: r.remarks || "" },
                            { upsert: true }
                        );
                    }
                }
            }
            // General Fallback for other collections
            else {
                const models = {
                    'students': Student,
                    'interns': Intern,
                    'volunteers': Volunteer,
                    'projects': Project
                };

                const Model = models[targetCollection];
                if (Model && targetUserId && changes) {
                    await Model.findByIdAndUpdate(targetUserId, changes);
                }
            }
        }
        
        request.status = status;
        request.updatedAt = new Date();
        await request.save();
        
        res.status(200).json({ 
            message: `Request ${status} successfully`, 
            request,
            newPasswordIssued 
        });
    } catch (err) {
        res.status(500).json({ message: "Failed to update status", error: err.message });
    }
};