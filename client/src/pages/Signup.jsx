import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const Signup = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const { name, email, password, confirmPassword } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        
        try {
            const res = await axios.post('http://localhost:5000/auth/signup', { name, email, password });
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data || 'Signup Failed');
        }
    };

    return (
        <div className="auth-container">
            <h2>Create Account</h2>
            {error && <p className="error-msg">{error}</p>}
            <form onSubmit={onSubmit}>
                <div className="form-group">
                    <label>Full Name</label>
                    <input 
                        type="text" 
                        name="name" 
                        value={name} 
                        onChange={onChange} 
                        required 
                    />
                </div>
                <div className="form-group">
                    <label>Email</label>
                    <input 
                        type="email" 
                        name="email" 
                        value={email} 
                        onChange={onChange} 
                        required 
                    />
                </div>
                <div className="form-group">
                    <label>Password</label>
                    <input 
                        type="password" 
                        name="password" 
                        value={password} 
                        onChange={onChange} 
                        required 
                        minLength="8"
                    />
                    <small>Must contain 8+ chars, 1 uppercase, 1 lowercase, 1 special char.</small>
                </div>
                <div className="form-group">
                    <label>Confirm Password</label>
                    <input 
                        type="password" 
                        name="confirmPassword" 
                        value={confirmPassword} 
                        onChange={onChange} 
                        required 
                    />
                </div>
                <button type="submit" className="btn-primary">Sign Up</button>
            </form>
            <p>
                Already have an account? <Link to="/login">Login</Link>
            </p>
        </div>
    );
};

export default Signup;
