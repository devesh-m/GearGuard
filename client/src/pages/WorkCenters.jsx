import React, { useState, useEffect } from 'react';
import axios from 'axios';

const WorkCenters = () => {
    const [workCenters, setWorkCenters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        tag: '',
        cost_per_hour: '',
        capacity: '',
        oee_target: '',
        alternative_work_center_id: '',
        time_efficiency: ''
    });

    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/work-centers', {
                headers: { token }
            });
            setWorkCenters(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this work center?')) {
            try {
                await axios.delete(`http://localhost:5000/api/work-centers/${id}`, {
                    headers: { token }
                });
                fetchData();
            } catch (err) {
                console.error(err);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/work-centers', formData, {
                headers: { token }
            });
            setShowForm(false);
            setFormData({
                name: '',
                code: '',
                tag: '',
                cost_per_hour: '',
                capacity: '',
                oee_target: '',
                alternative_work_center_id: '',
                time_efficiency: ''
            });
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
                <h2>Work Centers</h2>
                <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
                    {showForm ? 'Cancel' : 'Add Work Center'}
                </button>
            </div>

            {showForm && (
                <div className="form-card">
                    <h3>Add New Work Center</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Name</label>
                            <input name="name" value={formData.name} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>Code</label>
                            <input name="code" value={formData.code} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Tag</label>
                            <input name="tag" value={formData.tag} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Cost Per Hour</label>
                            <input type="number" name="cost_per_hour" value={formData.cost_per_hour} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Capacity</label>
                            <input type="number" name="capacity" value={formData.capacity} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>OEE Target (%)</label>
                            <input type="number" name="oee_target" value={formData.oee_target} onChange={handleChange} step="0.01" />
                        </div>
                        <div className="form-group">
                            <label>Alternative Work Center</label>
                            <select name="alternative_work_center_id" value={formData.alternative_work_center_id} onChange={handleChange}>
                                <option value="">None</option>
                                {workCenters.map(wc => (
                                    <option key={wc.id} value={wc.id}>{wc.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Time Efficiency (Ratio)</label>
                            <input type="number" name="time_efficiency" value={formData.time_efficiency} onChange={handleChange} step="0.01" placeholder="e.g. 1.0" />
                        </div>
                        <button type="submit" className="btn-primary">Save Work Center</button>
                    </form>
                </div>
            )}

            <table className="data-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Code</th>
                        <th>Tag</th>
                        <th>Cost/Hr</th>
                        <th>Capacity</th>
                        <th>OEE Target</th>
                        <th>Alt WC</th>
                        <th>Efficiency</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {workCenters.map(wc => (
                        <tr key={wc.id}>
                            <td>{wc.name}</td>
                            <td>{wc.code}</td>
                            <td>{wc.tag}</td>
                            <td>${wc.cost_per_hour}</td>
                            <td>{wc.capacity}</td>
                            <td>{wc.oee_target}%</td>
                            <td>{workCenters.find(w => w.id === wc.alternative_work_center_id)?.name || '-'}</td>
                            <td>{wc.time_efficiency || '-'}</td>
                            <td>
                                <button className="btn-danger btn-sm" onClick={() => handleDelete(wc.id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default WorkCenters;
