const router = require('express').Router();
const pool = require('../db');
const authorization = require('../middleware/authorization');

// Get calendar events (maintenance requests with scheduled dates)
router.get('/events', authorization, async (req, res) => {
    try {
        const { month, year, type } = req.query;
        
        let query = `
            SELECT mr.*, 
                   u.name as created_by_name,
                   t.name as team_name,
                   tech.name as technician_name,
                   CASE 
                       WHEN mr.maintenance_for = 'equipment' THEN eq.name
                       WHEN mr.maintenance_for = 'work_center' THEN wc.name
                   END as resource_name,
                   CASE 
                       WHEN mr.maintenance_for = 'equipment' THEN ec.name
                       ELSE NULL
                   END as category_name
            FROM maintenance_requests mr
            LEFT JOIN users u ON mr.created_by_id = u.id
            LEFT JOIN teams t ON mr.team_id = t.id
            LEFT JOIN users tech ON mr.technician_id = tech.id
            LEFT JOIN equipment eq ON mr.maintenance_for = 'equipment' AND mr.resource_id = eq.id
            LEFT JOIN equipment_categories ec ON eq.category_id = ec.id
            LEFT JOIN work_centers wc ON mr.maintenance_for = 'work_center' AND mr.resource_id = wc.id
            WHERE mr.scheduled_date IS NOT NULL
        `;
        
        const conditions = [];
        const values = [];
        
        // Filter by month and year if provided
        if (month && year) {
            conditions.push(`EXTRACT(MONTH FROM mr.scheduled_date) = $${conditions.length + 1}`);
            values.push(month);
            conditions.push(`EXTRACT(YEAR FROM mr.scheduled_date) = $${conditions.length + 1}`);
            values.push(year);
        }
        
        // Filter by type (preventive/corrective)
        if (type) {
            conditions.push(`mr.type = $${conditions.length + 1}`);
            values.push(type);
        }
        
        if (conditions.length > 0) {
            query += ' AND ' + conditions.join(' AND ');
        }
        
        query += ' ORDER BY mr.scheduled_date ASC';
        
        const events = await pool.query(query, values);
        res.json(events.rows);
        
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// Get events for a specific date
router.get('/events/date/:date', authorization, async (req, res) => {
    try {
        const { date } = req.params;
        
        const events = await pool.query(`
            SELECT mr.*, 
                   u.name as created_by_name,
                   t.name as team_name,
                   tech.name as technician_name,
                   CASE 
                       WHEN mr.maintenance_for = 'equipment' THEN eq.name
                       WHEN mr.maintenance_for = 'work_center' THEN wc.name
                   END as resource_name
            FROM maintenance_requests mr
            LEFT JOIN users u ON mr.created_by_id = u.id
            LEFT JOIN teams t ON mr.team_id = t.id
            LEFT JOIN users tech ON mr.technician_id = tech.id
            LEFT JOIN equipment eq ON mr.maintenance_for = 'equipment' AND mr.resource_id = eq.id
            LEFT JOIN work_centers wc ON mr.maintenance_for = 'work_center' AND mr.resource_id = wc.id
            WHERE DATE(mr.scheduled_date) = $1
            ORDER BY mr.scheduled_date ASC
        `, [date]);
        
        res.json(events.rows);
        
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

module.exports = router;
