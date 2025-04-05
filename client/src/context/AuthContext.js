import React, { createContext, useState, useContext, useEffect } from 'react';
import API from '../api/config';
import { toast } from 'react-toastify';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        if (token && userData) {
            try {
                setUser(JSON.parse(userData));
            } catch (error) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, []);

    const login = async (credentials) => {
        try {
            const response = await API.post('/voters/login', credentials);
            const { token, ...userData } = response.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
            return response.data;
        } catch (error) {
            const message = error.message || 'Login failed';
            toast.error(message);
            throw new Error(message);
        }
    };

    const register = async (userData) => {
        try {
            const response = await API.post('/voters/register', userData);
            const { token, ...userInfo } = response.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userInfo));
            setUser(userInfo);
            return response.data;
        } catch (error) {
            const message = error.message || 'Registration failed';
            toast.error(message);
            throw new Error(message);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}; 