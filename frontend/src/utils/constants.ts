const ENV = {
    local: "local",
    staging: "staging",
    production: "production",
};

const CONFIG: Record<string, { API_BASE_URL: string; DOMAIN: string }> = {
    local: {
        // Use empty string for relative path (will use proxy in dev, or same origin in production)
        API_BASE_URL: import.meta.env.VITE_API_BASE_URL || "",
        DOMAIN: import.meta.env.VITE_DOMAIN || "http://localhost:3000",
    },
    staging: {
        API_BASE_URL: import.meta.env.VITE_API_BASE_URL || "",
        DOMAIN: import.meta.env.VITE_DOMAIN || "http://localhost:3000",
    },
    production: {
        // Use empty string for relative path (same origin)
        API_BASE_URL: import.meta.env.VITE_API_BASE_URL || "",
        DOMAIN: import.meta.env.VITE_DOMAIN || "http://localhost:3000",
    },
};

const env = (import.meta.env.VITE_ENV as keyof typeof ENV) || ENV.local;
export const AUTH_MODE = import.meta.env.VITE_AUTH_MODE !== 'false';
export const SOCKET_HOST = import.meta.env.VITE_SOCKET_HOST || ""; 
export const API_BASE_URL = CONFIG[env]?.API_BASE_URL || CONFIG.local.API_BASE_URL;
export const DOMAIN = CONFIG[env]?.DOMAIN || CONFIG.local.DOMAIN;

// API Path - configurable via environment variable (default: /api/v1)
export const API_PATH = import.meta.env.VITE_API_PATH || "/api/v1";

export const MOCK_AUTH = import.meta.env.VITE_MOCK_AUTH === 'true' || import.meta.env.VITE_MOCK_AUTH === true;

