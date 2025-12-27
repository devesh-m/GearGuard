import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EquipmentCategories = () => {
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState({ name: '', responsible: '', company: '' });

    useEffect(() => {
        // Fetch existing categories
        axios.get('/api/equipment-categories')
            .then(response => setCategories(response.data))
            .catch(error => console.error('Error fetching categories:', error));
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewCategory({ ...newCategory, [name]: value });
    };

    const handleAddCategory = () => {
        axios.post('/api/equipment-categories', newCategory)
            .then(response => {
                setCategories([...categories, response.data]);
                setNewCategory({ name: '', responsible: '', company: '' });
            })
            .catch(error => console.error('Error adding category:', error));
    };

    return (
        <div>
            <h1>Equipment Categories</h1>
            <div>
                <input
                    type="text"
                    name="name"
                    placeholder="Name"
                    value={newCategory.name}
                    onChange={handleInputChange}
                />
                <input
                    type="text"
                    name="responsible"
                    placeholder="Responsible"
                    value={newCategory.responsible}
                    onChange={handleInputChange}
                />
                <input
                    type="text"
                    name="company"
                    placeholder="Company"
                    value={newCategory.company}
                    onChange={handleInputChange}
                />
                <button onClick={handleAddCategory}>Add</button>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Responsible</th>
                        <th>Company</th>
                    </tr>
                </thead>
                <tbody>
                    {categories.map((category, index) => (
                        <tr key={index}>
                            <td>{category.name}</td>
                            <td>{category.responsible}</td>
                            <td>{category.company}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default EquipmentCategories;