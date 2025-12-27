const router = require('express').Router();
const pool = require('../db');
const authorization = require('../middleware/authorization'); // We need to create this middleware

router.get('/stats', authorization, async (req, res) => {
    try {
        // 1. Critical Equipment
        const criticalEquipment = await pool.query(
            "SELECT COUNT(*) FROM equipment WHERE health_status < 30"
        );
        const criticalCount = parseInt(criticalEquipment.rows[0].count);

        // 2. Open Requests
        const openRequests = await pool.query(
            "SELECT COUNT(*) FROM maintenance_requests WHERE status IN ('new', 'in_progress')"
        );
        const openCount = parseInt(openRequests.rows[0].count);

        // 3. Overdue Requests
        const overdueRequests = await pool.query(
            "SELECT COUNT(*) FROM maintenance_requests WHERE scheduled_date < NOW() AND status NOT IN ('repaired', 'scrap')"
        );
        const overdueCount = parseInt(overdueRequests.rows[0].count);

        // 4. Technician Load (Mock calculation for now)
        // Get total technicians
        const technicians = await pool.query(
            "SELECT COUNT(*) FROM users WHERE role = 'technician'"
        );
        const techCount = parseInt(technicians.rows[0].count);
        
        // Get active requests assigned to technicians
        const activeAssignedRequests = await pool.query(
            "SELECT COUNT(*) FROM maintenance_requests WHERE status = 'in_progress' AND technician_id IS NOT NULL"
        );
        const activeCount = parseInt(activeAssignedRequests.rows[0].count);

        let load = 0;
        if (techCount > 0) {
            // Assuming max capacity is 5 requests per technician
            load = Math.round((activeCount / (techCount * 5)) * 100);
        }

        res.json({
            criticalEquipment: criticalCount,
            technicianLoad: load,
            openRequests: openCount,
            overdueRequests: overdueCount
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

module.exports = router;
