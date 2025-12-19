const EmployeeAttendance = require('../models/EmployeeAttendance');
const Employee = require('../models/Employee');

// @desc    Mark attendance for employees
// @route   POST /api/employee-attendance
// @access  Admin
const markAttendance = async (req, res) => {
    try {
        const { date, attendanceData } = req.body;

        if (!date || !attendanceData || !Array.isArray(attendanceData)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide date and attendance data array'
            });
        }

        // Normalize date to start of day
        const attendanceDate = new Date(date);
        attendanceDate.setHours(0, 0, 0, 0);

        const results = [];

        for (const record of attendanceData) {
            const { employeeId, status, note } = record;

            if (!employeeId || !status) continue;

            const attendance = await EmployeeAttendance.findOneAndUpdate(
                { employee: employeeId, date: attendanceDate },
                { status, note },
                { upsert: true, new: true }
            );
            results.push(attendance);
        }

        res.status(200).json({
            success: true,
            message: 'Attendance marked successfully',
            data: results
        });
    } catch (error) {
        console.error('Mark employee attendance error:', error);
        res.status(500).json({
            success: false,
            message: 'Error marking attendance'
        });
    }
};

// @desc    Get attendance for all employees by date
// @route   GET /api/employee-attendance/date/:date
// @access  Admin
const getAttendanceByDate = async (req, res) => {
    try {
        const date = new Date(req.params.date);
        date.setHours(0, 0, 0, 0);

        const attendanceRecords = await EmployeeAttendance.find({ date })
            .populate('employee', 'name employeeId role');

        res.status(200).json({
            success: true,
            count: attendanceRecords.length,
            data: attendanceRecords
        });
    } catch (error) {
        console.error('Get employee attendance by date error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching attendance'
        });
    }
};

// @desc    Get attendance history for a specific employee
// @route   GET /api/employee-attendance/employee/:id
// @access  Admin
const getEmployeeAttendance = async (req, res) => {
    try {
        const attendanceRecords = await EmployeeAttendance.find({ employee: req.params.id })
            .sort({ date: -1 });

        res.status(200).json({
            success: true,
            count: attendanceRecords.length,
            data: attendanceRecords
        });
    } catch (error) {
        console.error('Get specific employee attendance error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching employee attendance history'
        });
    }
};

module.exports = {
    markAttendance,
    getAttendanceByDate,
    getEmployeeAttendance
};
