import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { auth as authApi } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => localStorage.getItem('sb_token'));
    const [loading, setLoading] = useState(!!localStorage.getItem('sb_token'));

    // ── Persist token ────────────────────────────────────────────────────────────
    const saveToken = useCallback((t) => {
        if (t) {
            localStorage.setItem('sb_token', t);
        } else {
            localStorage.removeItem('sb_token');
        }
        setToken(t);
    }, []);

    // ── Hydrate user from stored token on first load ─────────────────────────────
    useEffect(() => {
        console.log('Auth effect running, token:', token ? 'exists' : 'missing');
        if (!token) {
            setLoading(false);
            return;
        }
        authApi.me()
            .then((data) => {
                console.log('User data fetched:', data);
                setUser(data);
            })
            .catch((error) => {
                console.error('Failed to fetch user:', error);
                saveToken(null);
            })          // token invalid / expired
            .finally(() => setLoading(false));
    }, [token, saveToken]); // Add token dependency

    // ── Login ────────────────────────────────────────────────────────────────────
    const login = useCallback(async (email, password) => {
        const data = await authApi.login(email, password);
        // Our backend returns token directly, not nested in session
        const jwt = data.token;
        if (jwt) saveToken(jwt);
        setUser(data.user);
        return data;
    }, [saveToken]);

    // ── Sign-up ──────────────────────────────────────────────────────────────────
    const signUp = useCallback(async (email, password, fullName) => {
        const data = await authApi.signUp(email, password, fullName);
        // Our backend returns token directly, not nested in session
        const jwt = data.token;
        if (jwt) saveToken(jwt);
        setUser(data.user);
        return data;
    }, [saveToken]);

    // ── Logout ───────────────────────────────────────────────────────────────────
    const logout = useCallback(async () => {
        try { await authApi.logout(); } catch (_) { /* ignore */ }
        saveToken(null);
        setUser(null);
    }, [saveToken]);

    const value = {
        user,
        token,
        loading,
        isAuthenticated: !!user,
        login,
        signUp,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
    return ctx;
}
