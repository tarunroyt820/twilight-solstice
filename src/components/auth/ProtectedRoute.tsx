import { Navigate, Outlet } from "react-router-dom";

const decodeJwtPayload = (token: string): Record<string, unknown> | null => {
    try {
        const parts = token.split('.');
        if (parts.length < 2) {
            return null;
        }

        // JWT payload uses base64url encoding, so normalize before decoding.
        const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
        return JSON.parse(atob(padded));
    } catch {
        return null;
    }
};

export const isTokenExpired = (token: string): boolean => {
    try {
        const payload = decodeJwtPayload(token);
        const exp = typeof payload?.exp === "number" ? payload.exp : null;
        if (!exp) {
            return true;
        }

        return exp * 1000 < Date.now();
    } catch {
        return true;
    }
};

export const hasValidToken = (): boolean => {
    const token = localStorage.getItem("nextro_token");
    return !!token && !isTokenExpired(token);
};

export const ProtectedRoute = () => {
    if (!hasValidToken()) {
        localStorage.removeItem("nextro_token");
        localStorage.removeItem("nextro_refresh_token");
        // If no token, redirect to login
        return <Navigate to="/login" replace />;
    }

    // If token exists, render the child routes
    return <Outlet />;
};
