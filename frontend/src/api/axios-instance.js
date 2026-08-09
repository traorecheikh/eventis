import axios from "axios";

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "/api"
});

let authToken = null;

export function setAuthToken(token) {
    authToken = token;
}

export function clearAuthToken() {
    authToken = null;
}

axiosInstance.interceptors.request.use((config) => {
    if (authToken) {
        config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
});

export const customInstance = (config) => {
    return axiosInstance(config).then((response) => response.data);
};

export default customInstance;
