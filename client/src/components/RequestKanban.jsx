import React from 'react';

const RequestKanban = ({ requests, onStatusUpdate }) => {
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
                                className="kanban-card"
                                draggable
                                onDragStart={(e) => handleDragStart(e, request.id)}
                            >
                                <h4>{request.subject}</h4>
                                <p><strong>Resource:</strong> {request.resource_name}</p>
                                {request.category_name && (
                                    <p><strong>Category:</strong> {request.category_name}</p>
                                )}
                                <p><strong>Type:</strong> {request.type}</p>
                                <p><strong>Priority:</strong> {request.priority}</p>
                                <p><strong>Created:</strong> {new Date(request.request_date).toLocaleDateString()}</p>
                                {request.scheduled_date && (
                                    <p><strong>Scheduled:</strong> {new Date(request.scheduled_date).toLocaleString()}</p>
                                )}
                                {request.technician_name && (
                                    <p><strong>Technician:</strong> {request.technician_name}</p>
                                )}
                                {request.team_name && (
                                    <p><strong>Team:</strong> {request.team_name}</p>
                                )}
                                {request.alternative_work_center_name && (
                                    <p><strong>Alt WC:</strong> {request.alternative_work_center_name}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default RequestKanban;
