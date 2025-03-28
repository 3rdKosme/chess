import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'http://localhost:5057/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

apiClient.interceptors.request.use(config => {
    const user = JSON.parse(localStorage.getItem('user'));
    if(user && user.token){
        config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

export const registerUser = (userData) => {
    return apiClient.post('/auth/register', userData);
};

export const loginUser = (credentials) => {
    return apiClient.post('/auth/login', credentials);
};

export const createGame = () => {
    return apiClient.post('/game/create');
};

export const joinGame = (gameId) => {
    return apiClient.post(`/game/join/${gameId}`);
}

export const makeMove = (gameId, move) => {
    return apiClient.post(`/game/move/${gameId}`, { move });
};
