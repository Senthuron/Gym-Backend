const express = require('express');
const router = express.Router();
const {
    getEmployees,
    getEmployee,
    createEmployee,
    updateEmployee,
    deleteEmployee
} = require('../controllers/employeeController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// All routes are protected and restricted to admin
router.use(authenticateToken);
router.use(requireAdmin);

router
    .route('/')
    .get(getEmployees)
    .post(createEmployee);

router
    .route('/:id')
    .get(getEmployee)
    .put(updateEmployee)
    .delete(deleteEmployee);

module.exports = router;
