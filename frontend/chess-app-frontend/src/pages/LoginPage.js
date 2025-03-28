import React, { useState, useContext} from 'react';
import { AuthContext } from '../AuthContext';
import { loginUser } from '../services/apiService';

const LoginPage = () => {
    const { login } = useContext(AuthContext);
    const [ credentials, setCredentials ] = useState({ email: '', password: ''});

    const handleSubmit = (e) => {
        e.preventDefault();
        loginUser(credentials).then(response => {
            const token = response.data.token;
            login({ ...credentials, token});
            alert('Logged in successfully!');
        }).catch(err => console.error(err));

    };

    return (
        <div>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Email"
                    value={credentials.email}
                    onChange={(e) => setCredentials({ ...credentials, email: e.target.value})}
                /><br/>
                <input
                    type="password"
                    placeholder="Password"
                    value={credentials.password}
                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value})}
                /><br/>
                <button type="submit">Login</button>
            </form>
        </div>
    );
};

export default LoginPage;