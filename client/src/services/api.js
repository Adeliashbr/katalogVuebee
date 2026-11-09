const API_BASE = '/api';

// Token Management
export const getAuthToken = () => localStorage.getItem('katalogwa_token');
export const setAuthToken = (token) => localStorage.setItem('katalogwa_token', token);
export const clearAuthToken = () => localStorage.removeItem('katalogwa_token');
export const isAuthenticated = () => !!getAuthToken();

// Auth Headers
const getHeaders = (isFormData = false) => {
    const token = getAuthToken();
    const headers = {};
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    if (!isFormData) {
        headers['Content-Type'] = 'application/json';
    }
    return headers;
};

// Error Handler
const handleResponse = async (response) => {
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        const errorMsg = data.message || `Request failed with status ${response.status}`;
        throw new Error(errorMsg);
    }
    return data;
};

// Store Settings
export const fetchStoreSettings = async () => {
    const res = await fetch(`${API_BASE}/store`);
    return handleResponse(res);
};

export const updateStoreSettings = async (settings) => {
    const res = await fetch(`${API_BASE}/store`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(settings)
    });
    return handleResponse(res);
};

// Categories
export const fetchCategories = async () => {
    const res = await fetch(`${API_BASE}/categories`);
    return handleResponse(res);
};

export const createCategory = async (name) => {
    const res = await fetch(`${API_BASE}/categories`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ name })
    });
    return handleResponse(res);
};

export const updateCategory = async (id, name) => {
    const res = await fetch(`${API_BASE}/categories/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ name })
    });
    return handleResponse(res);
};

export const deleteCategory = async (id) => {
    const res = await fetch(`${API_BASE}/categories/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
    });
    return handleResponse(res);
};

// Products
export const fetchProducts = async ({ categoryId = '', search = '' } = {}) => {
    const params = new URLSearchParams();
    if (categoryId) params.append('categoryId', categoryId);
    if (search) params.append('search', search);

    const url = `${API_BASE}/products${params.toString() ? `?${params.toString()}` : ''}`;
    const res = await fetch(url);
    return handleResponse(res);
};

export const createProduct = async (formData) => {
    const isFormData = formData instanceof FormData;
    const res = await fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers: getHeaders(isFormData),
        body: isFormData ? formData : JSON.stringify(formData)
    });
    return handleResponse(res);
};

export const updateProduct = async (id, formData) => {
    const isFormData = formData instanceof FormData;
    const res = await fetch(`${API_BASE}/products/${id}`, {
        method: 'PUT',
        headers: getHeaders(isFormData),
        body: isFormData ? formData : JSON.stringify(formData)
    });
    return handleResponse(res);
};

export const toggleProductStock = async (id) => {
    const res = await fetch(`${API_BASE}/products/${id}/stock`, {
        method: 'PATCH',
        headers: getHeaders()
    });
    return handleResponse(res);
};

export const adjustProductStock = async (id, { action, amount, exactStock }) => {
    const res = await fetch(`${API_BASE}/products/${id}/stock-adjust`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ action, amount, exactStock })
    });
    return handleResponse(res);
};

export const deleteProduct = async (id) => {
    const res = await fetch(`${API_BASE}/products/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
    });
    return handleResponse(res);
};

// Auth
export const loginAdmin = async (email, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    return handleResponse(res);
};

export const fetchAdminProfile = async () => {
    const res = await fetch(`${API_BASE}/auth/me`, {
        headers: getHeaders()
    });
    return handleResponse(res);
};

export const updateAdminProfile = async (profileData) => {
    const res = await fetch(`${API_BASE}/auth/profile`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(profileData)
    });
    return handleResponse(res);
};

export const uploadAdminAvatar = async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    const res = await fetch(`${API_BASE}/auth/avatar`, {
        method: 'POST',
        headers: getHeaders(true),
        body: formData
    });
    return handleResponse(res);
};

export const deleteAdminAvatar = async () => {
    const res = await fetch(`${API_BASE}/auth/avatar`, {
        method: 'DELETE',
        headers: getHeaders()
    });
    return handleResponse(res);
};

export const updateAdminPassword = async (passwordData) => {
    const res = await fetch(`${API_BASE}/auth/password`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(passwordData)
    });
    return handleResponse(res);
};

export const fetchAdminDemoInfo = async () => {
    const res = await fetch(`${API_BASE}/auth/demo-info`);
    return handleResponse(res);
};

export const requestPasswordReset = async (email) => {
    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
    });
    return handleResponse(res);
};

export const verifyResetToken = async (token) => {
    const res = await fetch(`${API_BASE}/auth/verify-reset-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
    });
    return handleResponse(res);
};

export const resetPasswordWithToken = async ({ token, newPassword, confirmPassword }) => {
    const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword, confirmPassword })
    });
    return handleResponse(res);
};
