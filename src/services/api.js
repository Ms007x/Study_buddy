// ─── API Base ─────────────────────────────────────────────────────────────────
const BASE_URL = import.meta.env.VITE_API_URL || '/api';

function getToken() {
    return localStorage.getItem('sb_token');
}

async function request(path, options = {}) {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
    };

    const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
    const json = await res.json();

    if (!res.ok) {
        throw new Error(json.error || `Request failed: ${res.status}`);
    }
    return json.data ?? json;
}

// ─── Auth ──────────────────────────────────────────────────────────────────────
export const auth = {
    /** POST /auth/signup */
    signUp: (email, password, fullName) =>
        request('/auth/signup', {
            method: 'POST',
            body: JSON.stringify({ email, password, fullName }),
        }),

    /** POST /auth/login */
    login: (email, password) =>
        request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        }),

    /** POST /auth/logout */
    logout: () => request('/auth/logout', { method: 'POST' }),

    /** GET /auth/me */
    me: () => request('/auth/me'),

    /** GET /auth/providers — returns available OAuth providers */
    providers: () => request('/auth/providers'),

    /** Redirect helpers for OAuth (server-side redirect flow) */
    oauthUrl: (provider) => `${BASE_URL}/auth/${provider}`,
};

// ─── Courses ───────────────────────────────────────────────────────────────────
export const courses = {
    /** GET /courses */
    list: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return request(`/courses${qs ? `?${qs}` : ''}`);
    },

    /** GET /courses/:id */
    get: (id) => request(`/courses/${id}`),

    /** POST /courses */
    create: (body) =>
        request('/courses', { method: 'POST', body: JSON.stringify(body) }),

    /** PUT /courses/:id */
    update: (id, body) =>
        request(`/courses/${id}`, { method: 'PUT', body: JSON.stringify(body) }),

    /** DELETE /courses/:id */
    remove: (id) => request(`/courses/${id}`, { method: 'DELETE' }),
};

// ─── Enrollments ───────────────────────────────────────────────────────────────
export const enrollments = {
    /** POST /courses/:courseId/enroll */
    enroll: (courseId) =>
        request(`/courses/${courseId}/enroll`, { method: 'POST' }),

    /** DELETE /courses/:courseId/enroll */
    unenroll: (courseId) =>
        request(`/courses/${courseId}/enroll`, { method: 'DELETE' }),

    /** GET /courses/:courseId/enrollments */
    list: (courseId) => request(`/courses/${courseId}/enrollments`),
};

// ─── Notes ─────────────────────────────────────────────────────────────────────
export const notes = {
    /** GET /courses/:courseId/notes */
    list: (courseId) => request(`/courses/${courseId}/notes`),

    /** GET /courses/:courseId/notes/:id */
    get: (courseId, noteId) => request(`/courses/${courseId}/notes/${noteId}`),

    /** POST /courses/:courseId/notes */
    create: (courseId, body) =>
        request(`/courses/${courseId}/notes`, {
            method: 'POST',
            body: JSON.stringify(body),
        }),

    /** PUT /courses/:courseId/notes/:id */
    update: (courseId, noteId, body) =>
        request(`/courses/${courseId}/notes/${noteId}`, {
            method: 'PUT',
            body: JSON.stringify(body),
        }),

    /** DELETE /courses/:courseId/notes/:id */
    remove: (courseId, noteId) =>
        request(`/courses/${courseId}/notes/${noteId}`, { method: 'DELETE' }),

    /** POST /courses/:courseId/notes/:id/summarize */
    summarize: (courseId, noteId) =>
        request(`/courses/${courseId}/notes/${noteId}/summarize`, {
            method: 'POST',
        }),
};

// ─── Dashboard ─────────────────────────────────────────────────────────────────
export const dashboard = {
    /** GET /user/dashboard */
    get: () => request('/user/dashboard'),
};
