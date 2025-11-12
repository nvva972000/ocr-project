const ENV = {
    local: "local",
    staging: "staging",
    production: "production",
};

const CONFIG: Record<string, { API_BASE_URL: string; DOMAIN: string }> = {
    local: {
        API_BASE_URL: "http://localhost:8080",
        DOMAIN: "http://localhost:3000",
    },
    staging: {
        API_BASE_URL: "http://localhost:8080",
        DOMAIN: "http://localhost:3000",
    },
    production: {
        API_BASE_URL: "http://localhost:8080",
        DOMAIN: "http://localhost:3000",
    },
};

const env = ENV.local;
export const AUTH_MODE = true;
export const SOCKET_HOST = ""; 
export const API_BASE_URL = CONFIG[env].API_BASE_URL;
export const DOMAIN = CONFIG[env].DOMAIN;

export const MOCK_AUTH = import.meta.env.VITE_MOCK_AUTH === 'true' || import.meta.env.VITE_MOCK_AUTH === true;