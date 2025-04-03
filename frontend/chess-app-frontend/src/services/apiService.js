import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'http://localhost:5057/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

apiClient.interceptors.request.use(config => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
        console.log("Adding token to request headers:", user.token);
    } else {
        console.warn("No token found in localStorage. User may not be authenticated.");
    }
    return config;
}, error => {
    return Promise.reject(error);
});

apiClient.interceptors.response.use(
    response => response,
    error => {
        if(error.response && error.response.status === 401){
            console.error("Unauthorized request. Logging out user.");
            const logout = () => {
                localStorage.removeItem('user');
                window.location.href = '/login';
            };
            logout();
        }
        return Promise.reject(error);
    }
)

export const registerUser = (userData) => {
    return apiClient.post('/auth/register', userData);
};

export const loginUser = (credentials) => {
    return apiClient.post('/auth/login', credentials);
};

export const createGame = () => {
    return apiClient.post('/game/create').then(response => {
        console.log("Created game successfully: ", response.data);
        return response;
    }).catch(err => {
        console.error("Error on creating game: ", err);
        throw err;
    });
};

export const joinGame = (gameId) => {
    return apiClient.post(`/game/join/${gameId}`);
};

export const makeMove = (gameId, move) => {
    return apiClient.post(`/game/move/${gameId}`, { move });
};
