import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Teams = () => {
    const [teams, setTeams] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        company_id: ''
    });

    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const config = { headers: { token } };
            const [teamsRes, companiesRes, usersRes] = await Promise.all([
                axios.get('http://localhost:5000/api/teams', config),
                axios.get('http://localhost:5000/api/companies', config),
                axios.get('http://localhost:5000/api/users', config)
            ]);
            setTeams(teamsRes.data);
            setCompanies(companiesRes.data);
            setUsers(usersRes.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/teams', formData, {
                headers: { token }
            });
            setShowForm(false);
            setFormData({ name: '', company_id: '' });
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this team?')) {
            try {
                await axios.delete(`http://localhost:5000/api/teams/${id}`, {
                    headers: { token }
                });
                fetchData();
            } catch (err) {
                console.error(err);
            }
        }
    };

    const handleViewTeam = async (team) => {
        try {
            const res = await axios.get(`http://localhost:5000/api/teams/${team.id}`, {
                headers: { token }
            });
            setSelectedTeam(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddMember = async (userId) => {
        try {
            await axios.post(`http://localhost:5000/api/teams/${selectedTeam.id}/members`, 
                { user_id: userId },
                { headers: { token } }
            );
            // Refresh team details
            handleViewTeam(selectedTeam);
            fetchData();
        } catch (err) {
            console.error(err);
            alert(err.response?.data || 'Error adding member');
        }
    };

    const handleRemoveMember = async (userId) => {
        try {
            await axios.delete(`http://localhost:5000/api/teams/${selectedTeam.id}/members/${userId}`, {
                headers: { token }
            });
            handleViewTeam(selectedTeam);
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="page-container">
            <div className="page-header">
                <h2>Teams Management</h2>
                <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
                    {showForm ? 'Cancel' : 'Add Team'}
                </button>
            </div>

            {showForm && (
                <div className="form-card">
                    <h3>Add New Team</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Team Name</label>
                            <input 
                                name="name" 
                                value={formData.name} 
                                onChange={handleChange} 
                                placeholder="e.g., Mechanics, Electricians, IT Support"
                                required 
                            />
                        </div>
                        <div className="form-group">
                            <label>Company</label>
                            <select name="company_id" value={formData.company_id} onChange={handleChange}>
                                <option value="">Select Company</option>
                                {companies.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                        <button type="submit" className="btn-primary">Save Team</button>
                    </form>
                </div>
            )}

            <div className="teams-layout">
                <div className="teams-list">
                    <h3>Teams</h3>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Team Name</th>
                                <th>Company</th>
                                <th>Members</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {teams.map(team => (
                                <tr key={team.id} className={selectedTeam?.id === team.id ? 'selected-row' : ''}>
                                    <td>{team.name}</td>
                                    <td>{team.company_name || '-'}</td>
                                    <td>
                                        <span className="member-badge">{team.member_count || 0}</span>
                                    </td>
                                    <td>
                                        <button 
                                            className="btn-smart btn-sm" 
                                            onClick={() => handleViewTeam(team)}
                                        >
                                            Manage
                                        </button>
                                        <button 
                                            className="btn-danger btn-sm" 
                                            onClick={() => handleDelete(team.id)}
                                            style={{ marginLeft: '5px' }}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {selectedTeam && (
                    <div className="team-detail">
                        <div className="team-detail-header">
                            <h3>{selectedTeam.name} - Members</h3>
                            <button className="btn-close" onClick={() => setSelectedTeam(null)}>&times;</button>
                        </div>
                        
                        <div className="team-members">
                            <h4>Current Members ({selectedTeam.members?.length || 0})</h4>
                            {selectedTeam.members?.length === 0 ? (
                                <p className="no-members">No members in this team yet.</p>
                            ) : (
                                <ul className="member-list">
                                    {selectedTeam.members?.map(member => (
                                        <li key={member.id} className="member-item">
                                            <div className="member-info">
                                                <span className="member-avatar">
                                                    {member.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                                </span>
                                                <div>
                                                    <strong>{member.name}</strong>
                                                    <span className="member-role">{member.role}</span>
                                                </div>
                                            </div>
                                            <button 
                                                className="btn-danger btn-sm"
                                                onClick={() => handleRemoveMember(member.id)}
                                            >
                                                Remove
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div className="add-member">
                            <h4>Add Member</h4>
                            <div className="available-users">
                                {users
                                    .filter(u => u.role === 'technician')
                                    .filter(u => !selectedTeam.members?.some(m => m.id === u.id))
                                    .map(user => (
                                        <div key={user.id} className="available-user">
                                            <span>{user.name}</span>
                                            <button 
                                                className="btn-primary btn-sm"
                                                onClick={() => handleAddMember(user.id)}
                                            >
                                                Add
                                            </button>
                                        </div>
                                    ))
                                }
                                {users.filter(u => u.role === 'technician').filter(u => !selectedTeam.members?.some(m => m.id === u.id)).length === 0 && (
                                    <p className="no-members">All technicians are already in this team.</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Teams;
