import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Equipment = () => {
    const [equipment, setEquipment] = useState([]);
    const [categories, setCategories] = useState([]);
    const [workCenters, setWorkCenters] = useState([]);
    const [users, setUsers] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        serial_number: '',
        category_id: '',
        location: '',
        work_center_id: '',
        technician_id: '',
        assigned_to_user_id: '',
        department: '',
        health_status: 100,
        company_id: '',
        purchase_date: '',
        warranty_expiry: ''
    });
    const [selectedEquipment, setSelectedEquipment] = useState(null);

    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const config = { headers: { token } };
            const [eqRes, catRes, wcRes, userRes, compRes] = await Promise.all([
                axios.get('http://localhost:5000/api/equipment', config),
                axios.get('http://localhost:5000/api/categories', config),
                axios.get('http://localhost:5000/api/work-centers', config),
                axios.get('http://localhost:5000/api/users', config),
                axios.get('http://localhost:5000/api/companies', config)
            ]);
            setEquipment(eqRes.data);
            setCategories(catRes.data);
            setWorkCenters(wcRes.data);
            setUsers(userRes.data);
            setCompanies(compRes.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this equipment?')) {
            try {
                await axios.delete(`http://localhost:5000/api/equipment/${id}`, {
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
            await axios.post('http://localhost:5000/api/equipment', formData, {
                headers: { token }
            });
            setShowForm(false);
            setFormData({
                name: '',
                serial_number: '',
                category_id: '',
                location: '',
                work_center_id: '',
                technician_id: '',
                assigned_to_user_id: '',
                department: '',
                health_status: 100,
                company_id: '',
                purchase_date: '',
                warranty_expiry: ''
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
                <h2>Equipment Management</h2>
                <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
                    {showForm ? 'Cancel' : 'Add Equipment'}
                </button>
            </div>

            {showForm && (
                <div className="form-card">
                    <h3>Add New Equipment</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Name</label>
                            <input name="name" value={formData.name} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>Serial Number</label>
                            <input name="serial_number" value={formData.serial_number} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Category</label>
                            <select name="category_id" value={formData.category_id} onChange={handleChange}>
                                <option value="">Select Category</option>
                                {categories.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Work Center</label>
                            <select name="work_center_id" value={formData.work_center_id} onChange={handleChange}>
                                <option value="">Select Work Center</option>
                                {workCenters.map(wc => (
                                    <option key={wc.id} value={wc.id}>{wc.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Department</label>
                            <input name="department" value={formData.department} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Assigned Technician</label>
                            <select name="technician_id" value={formData.technician_id} onChange={handleChange}>
                                <option value="">Select Technician</option>
                                {users.filter(u => u.role === 'technician').map(u => (
                                    <option key={u.id} value={u.id}>{u.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Assigned User (Owner)</label>
                            <select name="assigned_to_user_id" value={formData.assigned_to_user_id} onChange={handleChange}>
                                <option value="">Select User</option>
                                {users.map(u => (
                                    <option key={u.id} value={u.id}>{u.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Location</label>
                            <input name="location" value={formData.location} onChange={handleChange} />
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
                        <div className="form-group">
                            <label>Purchase Date</label>
                            <input type="date" name="purchase_date" value={formData.purchase_date} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Warranty Expiry</label>
                            <input type="date" name="warranty_expiry" value={formData.warranty_expiry} onChange={handleChange} />
                        </div>
                        <button type="submit" className="btn-primary">Save Equipment</button>
                    </form>
                </div>
            )}

            <table className="data-table">
                <thead>
                    <tr>
                        <th>Equipment Name</th>
                        <th>Employee</th>
                        <th>Department</th>
                        <th>Serial Number</th>
                        <th>Technician</th>
                        <th>Category</th>
                        <th>Company</th>
                        <th>Warranty</th>
                        <th>Maintenance</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {equipment.map(item => (
                        <tr key={item.id} className={item.is_scrapped ? 'scrapped-row' : ''}>
                            <td>{item.name} {item.is_scrapped && <span className="badge-scrap">SCRAPPED</span>}</td>
                            <td>{item.assigned_user_name}</td>
                            <td>{item.department}</td>
                            <td>{item.serial_number}</td>
                            <td>{item.technician_name}</td>
                            <td>{item.category_name}</td>
                            <td>{item.company_name}</td>
                            <td>
                                {item.warranty_expiry ? (
                                    <span className={new Date(item.warranty_expiry) < new Date() ? 'warranty-expired' : 'warranty-valid'}>
                                        {new Date(item.warranty_expiry).toLocaleDateString()}
                                    </span>
                                ) : '-'}
                            </td>
                            <td>
                                <button 
                                    className="btn-smart" 
                                    onClick={() => setSelectedEquipment(item)}
                                    title="View Maintenance Requests"
                                >
                                    🔧 Maintenance ({item.open_requests_count || 0})
                                </button>
                            </td>
                            <td>
                                <button className="btn-danger btn-sm" onClick={() => handleDelete(item.id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Equipment Detail Modal with Maintenance Requests */}
            {selectedEquipment && (
                <EquipmentDetailModal 
                    equipment={selectedEquipment} 
                    onClose={() => setSelectedEquipment(null)} 
                    token={token}
                />
            )}
        </div>
    );
};

// Equipment Detail Modal Component - Shows maintenance requests for specific equipment
const EquipmentDetailModal = ({ equipment, onClose, token }) => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRequests();
    }, [equipment.id]);

    const fetchRequests = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/requests?resource_id=${equipment.id}`, {
                headers: { token }
            });
            // Filter to only show requests for this equipment
            const equipmentRequests = res.data.filter(r => r.resource_id === equipment.id);
            setRequests(equipmentRequests);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content modal-large">
                <div className="modal-header">
                    <h2>Equipment: {equipment.name}</h2>
                    <button className="btn-close" onClick={onClose}>&times;</button>
                </div>
                
                <div className="equipment-details">
                    <div className="detail-row">
                        <span><strong>Serial:</strong> {equipment.serial_number || 'N/A'}</span>
                        <span><strong>Category:</strong> {equipment.category_name || 'N/A'}</span>
                        <span><strong>Department:</strong> {equipment.department || 'N/A'}</span>
                    </div>
                    <div className="detail-row">
                        <span><strong>Technician:</strong> {equipment.technician_name || 'N/A'}</span>
                        <span><strong>Location:</strong> {equipment.location || 'N/A'}</span>
                        <span><strong>Health:</strong> {equipment.health_status}%</span>
                    </div>
                    {equipment.is_scrapped && (
                        <div className="scrap-warning">
                            ⚠️ This equipment has been marked as SCRAPPED
                        </div>
                    )}
                </div>

                <h3>Maintenance Requests ({requests.length})</h3>
                
                {loading ? (
                    <p>Loading requests...</p>
                ) : requests.length === 0 ? (
                    <p>No maintenance requests for this equipment.</p>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Subject</th>
                                <th>Type</th>
                                <th>Priority</th>
                                <th>Status</th>
                                <th>Technician</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.map(req => (
                                <tr key={req.id}>
                                    <td>{req.subject}</td>
                                    <td>{req.type}</td>
                                    <td className={`priority-${req.priority}`}>{req.priority}</td>
                                    <td>{req.status}</td>
                                    <td>{req.technician_name || 'Unassigned'}</td>
                                    <td>{new Date(req.request_date).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default Equipment;
