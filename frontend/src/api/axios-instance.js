import axios from "axios";

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "/api"
});

export const customInstance = (config) => {
    return axiosInstance(config).then((response) => response.data);
};

export default customInstance;
