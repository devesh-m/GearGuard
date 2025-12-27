const router = require('express').Router();
const pool = require('../db');
const authorization = require('../middleware/authorization');

// Get all worksheet comments for a request
router.get('/request/:requestId', authorization, async (req, res) => {
    try {
        const { requestId } = req.params;
        const comments = await pool.query(`
            SELECT wc.*, u.name as user_name
            FROM worksheet_comments wc
            LEFT JOIN users u ON wc.user_id = u.id
            WHERE wc.request_id = $1
            ORDER BY wc.created_at DESC
        `, [requestId]);
        res.json(comments.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// Get worksheet comment count for a request
router.get('/request/:requestId/count', authorization, async (req, res) => {
    try {
        const { requestId } = req.params;
        const result = await pool.query(`
            SELECT COUNT(*) as count, COALESCE(SUM(hours_logged), 0) as total_hours
            FROM worksheet_comments 
            WHERE request_id = $1
        `, [requestId]);
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// Add a worksheet comment
router.post('/', authorization, async (req, res) => {
    try {
        const { request_id, comment, hours_logged } = req.body;
        const userId = req.user;
        
        const newComment = await pool.query(`
            INSERT INTO worksheet_comments (request_id, user_id, comment, hours_logged)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `, [request_id, userId, comment, hours_logged || 0]);
        
        // If hours were logged, update the total duration on the request
        if (hours_logged && hours_logged > 0) {
            await pool.query(`
                UPDATE maintenance_requests 
                SET duration = COALESCE(duration, 0) + $1
                WHERE id = $2
            `, [hours_logged, request_id]);
        }
        
        res.json(newComment.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// Delete a worksheet comment
router.delete('/:id', authorization, async (req, res) => {
    try {
        const { id } = req.params;
        
        // Get the hours logged before deleting (to subtract from duration)
        const comment = await pool.query("SELECT * FROM worksheet_comments WHERE id = $1", [id]);
        
        if (comment.rows.length > 0 && comment.rows[0].hours_logged > 0) {
            await pool.query(`
                UPDATE maintenance_requests 
                SET duration = GREATEST(0, COALESCE(duration, 0) - $1)
                WHERE id = $2
            `, [comment.rows[0].hours_logged, comment.rows[0].request_id]);
        }
        
        await pool.query("DELETE FROM worksheet_comments WHERE id = $1", [id]);
        res.json("Comment deleted");
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

module.exports = router;
