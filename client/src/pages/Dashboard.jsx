import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const [stats, setStats] = useState({
        criticalEquipment: 0,
        technicianLoad: 0,
        openRequests: 0,
        overdueRequests: 0
    });
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem('user'));
    const navigate = useNavigate();

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/dashboard/stats', {
                    headers: { token: token }
                });
                setStats(res.data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) return <div className="dashboard-loading">Loading Dashboard...</div>;

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1>GearGuard Dashboard</h1>
                <div className="user-info">
                    <span>Welcome, {user?.name}</span>
                    <button onClick={logout} className="btn-secondary btn-sm">Logout</button>
                </div>
            </header>

            <div className="stats-grid">
                {/* Critical Equipment Card */}
                <div className="stat-card critical">
                    <h3>Critical Equipment</h3>
                    <div className="stat-value">{stats.criticalEquipment}</div>
                    <p>Units with Health &lt; 30%</p>
                </div>

                {/* Technician Load Card */}
                <div className="stat-card load">
                    <h3>Technician Load</h3>
                    <div className="stat-value">{stats.technicianLoad}%</div>
                    <p>Utilization</p>
                </div>

                {/* Open Requests Card */}
                <div className="stat-card requests">
                    <h3>Open Requests</h3>
                    <div className="stat-value">{stats.openRequests}</div>
                    <p>{stats.overdueRequests} Overdue</p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
