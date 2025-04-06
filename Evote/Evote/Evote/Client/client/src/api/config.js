import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 10000 // 10 second timeout
});

// Add request logging
API.interceptors.request.use((config) => {
    console.log('Making request:', {
        url: config.url,
        method: config.method,
        headers: config.headers,
        data: config.data
    });
    
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
});

// Add response logging
API.interceptors.response.use(
    (response) => {
        console.log('Response received:', {
            status: response.status,
            data: response.data
        });
        return response;
    },
    (error) => {
        console.error('Response error:', {
            config: error.config,
            response: error.response,
            message: error.message
        });

        if (error.response) {
            // Handle 401 and 403 errors (unauthorized/forbidden)
            if (error.response.status === 401 || error.response.status === 403) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
            
            // Format error message
            const errorMessage = error.response.data?.error?.message || 
                               error.response.data?.message || 
                               'An error occurred';
            
            // Create a formatted error object
            const formattedError = new Error(errorMessage);
            formattedError.status = error.response.status;
            formattedError.data = error.response.data;
            
            return Promise.reject(formattedError);
        }
        
        if (error.request) {
            console.error('No response received:', error.request);
            return Promise.reject(new Error('Network error - no response received'));
        }
        
        // Something happened in setting up the request
        return Promise.reject(new Error('Error setting up request'));
    }
);

export default API; 