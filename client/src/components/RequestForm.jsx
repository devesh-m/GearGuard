import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RequestForm = ({ onClose, onSubmit, defaultDate }) => {
    const [formData, setFormData] = useState({
        subject: '',
        maintenance_for: 'equipment',
        resource_id: '',
        type: 'corrective',
        team_id: '',
        technician_id: '',
        scheduled_date: defaultDate ? `${defaultDate}T09:00` : '',
        duration: '',
        priority: 'medium',
        instructions: '',
        notes: ''
    });

    const [equipment, setEquipment] = useState([]);
    const [workCenters, setWorkCenters] = useState([]);
    const [teams, setTeams] = useState([]);
    const [technicians, setTechnicians] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const [eqRes, wcRes, teamRes, techRes, catRes] = await Promise.all([
                axios.get('http://localhost:5000/api/equipment', { headers: { token } }),
                axios.get('http://localhost:5000/api/work-centers', { headers: { token } }),
                axios.get('http://localhost:5000/api/teams', { headers: { token } }),
                axios.get('http://localhost:5000/api/users?role=technician', { headers: { token } }),
                axios.get('http://localhost:5000/api/categories', { headers: { token } })
            ]);
            setEquipment(eqRes.data);
            setWorkCenters(wcRes.data);
            setTeams(teamRes.data);
            setTechnicians(techRes.data);
            setCategories(catRes.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Auto-fill logic: When equipment is selected, auto-fill technician from equipment record
    const handleResourceChange = (e) => {
        const resourceId = e.target.value;
        setFormData({ ...formData, resource_id: resourceId });
        
        if (formData.maintenance_for === 'equipment' && resourceId) {
            const selectedEquipment = equipment.find(eq => eq.id === resourceId);
            if (selectedEquipment) {
                // Auto-fill technician from equipment
                if (selectedEquipment.technician_id) {
                    setFormData(prev => ({ 
                        ...prev, 
                        resource_id: resourceId,
                        technician_id: selectedEquipment.technician_id 
                    }));
                }
                // Auto-set category filter
                if (selectedEquipment.category_id) {
                    setSelectedCategory(selectedEquipment.category_id);
                }
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/requests', formData, {
                headers: { token: token }
            });
            onSubmit();
            onClose();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const filteredEquipment = selectedCategory 
        ? equipment.filter(eq => eq.category_id === selectedCategory)
        : equipment;

    const resourceOptions = formData.maintenance_for === 'equipment' ? filteredEquipment : workCenters;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Create Maintenance Request</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Subject</label>
                        <input 
                            type="text" 
                            name="subject" 
                            value={formData.subject} 
                            onChange={handleChange} 
                            required 
                        />
                    </div>

                    <div className="form-group">
                        <label>Maintenance For</label>
                        <select name="maintenance_for" value={formData.maintenance_for} onChange={handleChange}>
                            <option value="equipment">Equipment</option>
                            <option value="work_center">Work Center</option>
                        </select>
                    </div>

                    {formData.maintenance_for === 'equipment' && (
                        <div className="form-group">
                            <label>Filter by Category</label>
                            <select 
                                value={selectedCategory} 
                                onChange={(e) => setSelectedCategory(e.target.value)}
                            >
                                <option value="">All Categories</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="form-group">
                        <label>{formData.maintenance_for === 'equipment' ? 'Equipment' : 'Work Center'}</label>
                        <select name="resource_id" value={formData.resource_id} onChange={handleResourceChange} required>
                            <option value="">Select...</option>
                            {resourceOptions.map(item => (
                                <option key={item.id} value={item.id}>
                                    {item.name} {item.is_scrapped ? '(SCRAPPED)' : ''}
                                </option>
                            ))}
                        </select>
                        {formData.maintenance_for === 'equipment' && formData.resource_id && (
                            <small className="auto-fill-note">
                                ✓ Technician auto-filled from equipment record
                            </small>
                        )}
                    </div>

                    <div className="form-group">
                        <label>Type</label>
                        <select name="type" value={formData.type} onChange={handleChange}>
                            <option value="corrective">Corrective</option>
                            <option value="preventive">Preventive</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Priority</label>
                        <select name="priority" value={formData.priority} onChange={handleChange}>
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="critical">Critical</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Team</label>
                        <select name="team_id" value={formData.team_id} onChange={handleChange}>
                            <option value="">Select...</option>
                            {teams.map(team => (
                                <option key={team.id} value={team.id}>{team.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Technician</label>
                        <select name="technician_id" value={formData.technician_id} onChange={handleChange}>
                            <option value="">Select...</option>
                            {technicians.map(tech => (
                                <option key={tech.id} value={tech.id}>{tech.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Scheduled Date</label>
                        <input 
                            type="datetime-local" 
                            name="scheduled_date" 
                            value={formData.scheduled_date} 
                            onChange={handleChange} 
                        />
                    </div>

                    <div className="form-group">
                        <label>Duration (hours)</label>
                        <input 
                            type="number" 
                            name="duration" 
                            value={formData.duration} 
                            onChange={handleChange} 
                            step="0.5"
                        />
                    </div>

                    <div className="form-group">
                        <label>Instructions</label>
                        <textarea 
                            name="instructions" 
                            value={formData.instructions} 
                            onChange={handleChange} 
                            rows="3"
                        />
                    </div>

                    <div className="form-group">
                        <label>Notes</label>
                        <textarea 
                            name="notes" 
                            value={formData.notes} 
                            onChange={handleChange} 
                            rows="3"
                        />
                    </div>

                    <div className="form-actions">
                        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Request'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RequestForm;
