import React, { useState, useEffect } from 'react';
import axios from 'axios';

const WorksheetModal = ({ request, onClose }) => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [hoursLogged, setHoursLogged] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        fetchComments();
    }, [request.id]);

    const fetchComments = async () => {
        try {
            const res = await axios.get(
                `http://localhost:5000/api/worksheets/request/${request.id}`,
                { headers: { token } }
            );
            setComments(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setSubmitting(true);
        try {
            await axios.post(
                'http://localhost:5000/api/worksheets',
                {
                    request_id: request.id,
                    comment: newComment,
                    hours_logged: hoursLogged ? parseFloat(hoursLogged) : 0
                },
                { headers: { token } }
            );
            setNewComment('');
            setHoursLogged('');
            fetchComments();
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (commentId) => {
        if (!window.confirm('Delete this comment?')) return;
        try {
            await axios.delete(
                `http://localhost:5000/api/worksheets/${commentId}`,
                { headers: { token } }
            );
            fetchComments();
        } catch (err) {
            console.error(err);
        }
    };

    const totalHours = comments.reduce((sum, c) => sum + (c.hours_logged || 0), 0);

    return (
        <div className="modal-overlay">
            <div className="modal-content modal-large">
                <div className="modal-header">
                    <h2>📝 Worksheet: {request.subject}</h2>
                    <button className="btn-close" onClick={onClose}>&times;</button>
                </div>

                <div className="worksheet-summary">
                    <div className="summary-item">
                        <span className="summary-label">Status:</span>
                        <span className={`status-badge ${request.status}`}>{request.status}</span>
                    </div>
                    <div className="summary-item">
                        <span className="summary-label">Technician:</span>
                        <span>{request.technician_name || 'Unassigned'}</span>
                    </div>
                    <div className="summary-item">
                        <span className="summary-label">Total Hours Logged:</span>
                        <span className="hours-total">{totalHours.toFixed(1)}h</span>
                    </div>
                </div>

                <div className="worksheet-comments-section">
                    <h3>Work Log ({comments.length} entries)</h3>
                    
                    {loading ? (
                        <p>Loading comments...</p>
                    ) : comments.length === 0 ? (
                        <p className="no-comments">No work entries yet. Add your first comment below.</p>
                    ) : (
                        <div className="comments-list">
                            {comments.map(comment => (
                                <div key={comment.id} className="comment-item">
                                    <div className="comment-header">
                                        <div className="comment-user">
                                            <span className="user-avatar">{comment.user_name?.charAt(0) || '?'}</span>
                                            <span className="user-name">{comment.user_name}</span>
                                        </div>
                                        <div className="comment-meta">
                                            {comment.hours_logged > 0 && (
                                                <span className="hours-badge">⏱️ {comment.hours_logged}h</span>
                                            )}
                                            <span className="comment-date">
                                                {new Date(comment.created_at).toLocaleString()}
                                            </span>
                                            <button 
                                                className="btn-delete-comment"
                                                onClick={() => handleDelete(comment.id)}
                                                title="Delete"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                    <div className="comment-body">
                                        {comment.comment}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <form className="add-comment-form" onSubmit={handleSubmit}>
                    <h4>Add Work Entry</h4>
                    <div className="form-row">
                        <div className="form-group flex-grow">
                            <label>Comment / Work Description</label>
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Describe the work performed..."
                                rows="3"
                                required
                            />
                        </div>
                        <div className="form-group hours-input">
                            <label>Hours</label>
                            <input
                                type="number"
                                value={hoursLogged}
                                onChange={(e) => setHoursLogged(e.target.value)}
                                placeholder="0.0"
                                step="0.5"
                                min="0"
                            />
                        </div>
                    </div>
                    <div className="form-actions">
                        <button 
                            type="submit" 
                            className="btn-primary"
                            disabled={submitting || !newComment.trim()}
                        >
                            {submitting ? 'Adding...' : 'Add Entry'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default WorksheetModal;
