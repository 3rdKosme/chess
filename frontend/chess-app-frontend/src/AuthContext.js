import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        
        const savedUser = localStorage.getItem('user');
        if(savedUser){
            try{
                const parsedUser = JSON.parse(savedUser);
                console.log("Loaded user from localstorage.", parsedUser);
                if(parsedUser && parsedUser.token && parsedUser.username){
                    setUser(parsedUser);
                } else {
                    console.error("Invalid user data in localstorage: ", parsedUser);
                    localStorage.removeItem('user');
                }
            } catch (error){
                console.error(`Error on parsing user from localstorage ${error}`);
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, []);

    const login = (userData) => {
        const userWithUsername = {
            ...userData,
            username: userData.email
        };
        console.log("Logging in user:", userWithUsername);
        setUser(userWithUsername);
        localStorage.setItem('user', JSON.stringify(userWithUsername));
    };

    const logout = () => {
        console.log("Logging out user.");
        setUser(null);
        localStorage.removeItem('user');
    };

    if(loading){
        return <div>Loading...</div>;
    }

    return (
        <AuthContext.Provider value={{user, loading, login, logout}}>
            {children}
        </AuthContext.Provider>
    );
};
