import React, { useState } from 'react';
import WorksheetModal from './WorksheetModal';

const RequestKanban = ({ requests, onStatusUpdate }) => {
    const [selectedRequest, setSelectedRequest] = useState(null);
    
    const columns = {
        new: { title: 'New', color: '#e3f2fd' },
        in_progress: { title: 'In Progress', color: '#fff3e0' },
        repaired: { title: 'Repaired', color: '#e8f5e8' },
        scrap: { title: 'Scrap', color: '#ffebee' }
    };

    const getRequestsByStatus = (status) => {
        return requests.filter(req => req.status === status);
    };

    const handleDragStart = (e, requestId) => {
        e.dataTransfer.setData('text/plain', requestId);
    };

    const handleDrop = (e, newStatus) => {
        e.preventDefault();
        const requestId = e.dataTransfer.getData('text/plain');
        onStatusUpdate(requestId, newStatus);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    // Check if a request is overdue (scheduled_date is in the past and not completed)
    const isOverdue = (request) => {
        if (!request.scheduled_date) return false;
        if (request.status === 'repaired' || request.status === 'scrap') return false;
        return new Date(request.scheduled_date) < new Date();
    };

    // Get technician initials for avatar
    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <div className="kanban-board">
            {Object.entries(columns).map(([status, config]) => (
                <div 
                    key={status} 
                    className="kanban-column"
                    style={{ backgroundColor: config.color }}
                    onDrop={(e) => handleDrop(e, status)}
                    onDragOver={handleDragOver}
                >
                    <h3>{config.title} ({getRequestsByStatus(status).length})</h3>
                    <div className="kanban-cards">
                        {getRequestsByStatus(status).map(request => (
                            <div 
                                key={request.id} 
                                className={`kanban-card ${isOverdue(request) ? 'overdue' : ''}`}
                                draggable
                                onDragStart={(e) => handleDragStart(e, request.id)}
                            >
                                {isOverdue(request) && (
                                    <div className="overdue-strip">OVERDUE</div>
                                )}
                                <div className="card-header">
                                    <h4>{request.subject}</h4>
                                    {request.technician_name && (
                                        <div className="technician-avatar" title={request.technician_name}>
                                            {getInitials(request.technician_name)}
                                        </div>
                                    )}
                                </div>
                                <p><strong>Resource:</strong> {request.resource_name}</p>
                                {request.category_name && (
                                    <p><strong>Category:</strong> {request.category_name}</p>
                                )}
                                <p><strong>Type:</strong> <span className={`type-${request.type}`}>{request.type}</span></p>
                                <p><strong>Priority:</strong> <span className={`priority-${request.priority}`}>{request.priority}</span></p>
                                <p><strong>Created:</strong> {new Date(request.request_date).toLocaleDateString()}</p>
                                {request.scheduled_date && (
                                    <p className={isOverdue(request) ? 'overdue-text' : ''}>
                                        <strong>Scheduled:</strong> {new Date(request.scheduled_date).toLocaleString()}
                                    </p>
                                )}
                                {request.team_name && (
                                    <p><strong>Team:</strong> {request.team_name}</p>
                                )}
                                {request.duration && (
                                    <p><strong>Duration:</strong> {request.duration}h</p>
                                )}
                                <div className="card-actions">
                                    <button 
                                        className="btn-worksheet"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedRequest(request);
                                        }}
                                        title="Open Worksheet"
                                    >
                                        📝 Worksheet
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
            
            {selectedRequest && (
                <WorksheetModal 
                    request={selectedRequest} 
                    onClose={() => setSelectedRequest(null)} 
                />
            )}
        </div>
    );
};

export default RequestKanban;
