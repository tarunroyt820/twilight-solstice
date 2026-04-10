import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const requestUrl = String(originalRequest?.url || "");
        const isAuthRoute = requestUrl.includes("/api/auth/");

        if (
            error.response?.status === 401 &&
            originalRequest &&
            !originalRequest._retry &&
            !isAuthRoute
        ) {
            originalRequest._retry = true;

            const refreshToken = localStorage.getItem("nextro_refresh_token");
            if (!refreshToken) {
                localStorage.removeItem("nextro_token");
                localStorage.removeItem("nextro_refresh_token");
                window.location.href = "/login";
                return Promise.reject(error);
            }

            try {
                const res = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
                    refreshToken,
                });
                const newToken = res.data.token;

                localStorage.setItem("nextro_token", newToken);
                originalRequest.headers = originalRequest.headers || {};
                originalRequest.headers["Authorization"] = `Bearer ${newToken}`;

                return axios(originalRequest);
            } catch (refreshError) {
                localStorage.removeItem("nextro_token");
                localStorage.removeItem("nextro_refresh_token");
                window.location.href = "/login";
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    },
);

export default axios;
