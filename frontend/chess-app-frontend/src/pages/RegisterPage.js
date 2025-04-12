import React, { useState } from 'react';
import { registerUser, loginUser } from '../services/apiService';
import { AuthContext } from '../AuthContext'

const RegisterPage = () => {
    const [formData, setFormData] = useState({ username: '', email: '', password: ''});
    const [credentials, setCredentials] = useState({ email: '', password: ''});
    const { login } = useState(AuthContext);
    
    const handleSubmit = (e) => {
        e.preventDefault();
        registerUser(formData).then(() => {
            alert('User registered successfully!');
            
        }).catch(err => console.error(err));
        setCredentials({ ...credentials, email: formData.email, password: formData.password});
        loginUser(credentials).then(response => {

                    const token = response.data.token;

                    login({ ...credentials, token});
                    alert('Logged in successfully!');
                }).catch(err => console.error(err));
        
    };

    return (
        <div>
            <h2>Register</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value})}
                />
                <input
                    type="email"
                    placeholder="E-mail"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value})}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value})}
                />  
                <button type="submit">Register</button>
            </form>
        </div>
    )
}

export default RegisterPage;