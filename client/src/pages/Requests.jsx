import React, { useState, useEffect } from 'react';
import axios from 'axios';
import RequestForm from '../components/RequestForm';
import RequestKanban from '../components/RequestKanban';

const Requests = () => {
    const [requests, setRequests] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchRequests = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/requests', {
                headers: { token: token }
            });
            setRequests(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleStatusUpdate = async (requestId, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            
            // If moving to scrap, also mark the equipment as scrapped
            if (newStatus === 'scrap') {
                const request = requests.find(r => r.id === requestId);
                if (request && request.maintenance_for === 'equipment') {
                    const confirmScrap = window.confirm(
                        'Moving to SCRAP will mark this equipment as unusable. Continue?'
                    );
                    if (!confirmScrap) return;
                    
                    // Mark equipment as scrapped
                    await axios.put(
                        `http://localhost:5000/api/equipment/${request.resource_id}/scrap`,
                        {},
                        { headers: { token: token } }
                    );
                }
            }
            
            await axios.put(`http://localhost:5000/api/requests/${requestId}/status`, 
                { status: newStatus }, 
                { headers: { token: token } }
            );
            fetchRequests(); // Refresh the list
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div>Loading requests...</div>;

    return (
        <div className="requests-container">
            <div className="requests-header">
                <h1>Maintenance Requests</h1>
                <button 
                    className="btn-primary" 
                    onClick={() => setShowForm(true)}
                >
                    New Request
                </button>
            </div>

            {showForm && (
                <RequestForm 
                    onClose={() => setShowForm(false)} 
                    onSubmit={fetchRequests} 
                />
            )}

            <RequestKanban 
                requests={requests} 
                onStatusUpdate={handleStatusUpdate} 
            />
        </div>
    );
};

export const RequestCard = ({ request }) => {
    return (
        <div className="request-card">
            <h3>{request.subject}</h3>
            <p>Priority: {request.priority}</p>
            <p>Status: {request.status}</p>
            <p>Equipment Category: {request.equipmentCategory}</p>
        </div>
    );
};

export default Requests;
