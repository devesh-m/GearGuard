import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AddEquipmentCategory = () => {
    const [equipment, setEquipment] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedEquipment, setSelectedEquipment] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');

    useEffect(() => {
        // Fetch equipment
        axios.get('/api/equipment')
            .then(response => setEquipment(response.data))
            .catch(error => console.error('Error fetching equipment:', error));

        // Fetch categories
        axios.get('/api/equipment-categories')
            .then(response => setCategories(response.data))
            .catch(error => console.error('Error fetching categories:', error));
    }, []);

    const handleAssignCategory = () => {
        axios.post('/api/equipment/assign-category', {
            equipmentId: selectedEquipment,
            categoryId: selectedCategory
        })
            .then(() => {
                alert('Category assigned successfully!');
                setSelectedEquipment('');
                setSelectedCategory('');
            })
            .catch(error => console.error('Error assigning category:', error));
    };

    return (
        <div>
            <h1>Assign Equipment Category</h1>
            <div>
                <select
                    value={selectedEquipment}
                    onChange={(e) => setSelectedEquipment(e.target.value)}
                >
                    <option value="">Select Equipment</option>
                    {equipment.map((item) => (
                        <option key={item.id} value={item.id}>{item.name}</option>
                    ))}
                </select>

                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                </select>

                <button onClick={handleAssignCategory}>Assign Category</button>
            </div>
        </div>
    );
};

export default AddEquipmentCategory;