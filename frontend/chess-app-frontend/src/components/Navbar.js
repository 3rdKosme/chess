import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
    return (
        <nav className="navbar">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/login" className="nav-link">Sign in</Link>
            <Link to="/register" className="nav-link">Sign up</Link>
            <Link to="/game" className="nav-link">Game</Link>
        </nav>
    );
}

export default Navbar;