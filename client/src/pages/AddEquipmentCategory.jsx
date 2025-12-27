import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AddEquipmentCategory = () => {
    const [name, setName] = useState('');
    const [responsibleUserId, setResponsibleUserId] = useState('');
    const [companyId, setCompanyId] = useState('');
    const [teamId, setTeamId] = useState('');
    const [users, setUsers] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [teams, setTeams] = useState([]);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const headers = { token: token };
                
                const [usersRes, companiesRes, teamsRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/users', { headers }),
                    axios.get('http://localhost:5000/api/companies', { headers }),
                    axios.get('http://localhost:5000/api/teams', { headers })
                ]);

                setUsers(usersRes.data);
                setCompanies(companiesRes.data);
                setTeams(teamsRes.data);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Failed to load form data');
            }
        };

        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/categories', {
                name,
                responsible_user_id: responsibleUserId,
                company_id: companyId,
                team_id: teamId
            }, {
                headers: { token: token }
            });
            alert('Category added successfully');
            navigate('/dashboard');
        } catch (err) {
            console.error('Error adding category:', err);
            setError('Failed to add category');
        }
    };

    return (
        <div className="form-container">
            <h1>Add Equipment Category</h1>
            {error && <p className="error-message">{error}</p>}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Category Name:</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Company:</label>
                    <select
                        value={companyId}
                        onChange={(e) => setCompanyId(e.target.value)}
                        required
                    >
                        <option value="">Select Company</option>
                        {companies.map(company => (
                            <option key={company.id} value={company.id}>
                                {company.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label>Responsible User:</label>
                    <select
                        value={responsibleUserId}
                        onChange={(e) => setResponsibleUserId(e.target.value)}
                        required
                    >
                        <option value="">Select User</option>
                        {users.map(user => (
                            <option key={user.id} value={user.id}>
                                {user.name} ({user.role})
                            </option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label>Team:</label>
                    <select
                        value={teamId}
                        onChange={(e) => setTeamId(e.target.value)}
                    >
                        <option value="">Select Team (Optional)</option>
                        {teams.map(team => (
                            <option key={team.id} value={team.id}>
                                {team.name}
                            </option>
                        ))}
                    </select>
                </div>
                <button type="submit" className="btn-primary">Add Category</button>
            </form>
        </div>
    );
};

export default AddEquipmentCategory;