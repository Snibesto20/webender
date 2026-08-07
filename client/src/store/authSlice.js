export const createAuthSlice = (set, get) => ({
  user: null,
  token: localStorage.getItem('crm-token') || null,
  isAuthenticated: !!localStorage.getItem('crm-token'),
  isLoading: true,

  getAuthHeaders: () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${get().token}`
  }),

  verifyAuth: async () => {
    const token = get().token;
    if (!token) {
      set({ isLoading: false, isAuthenticated: false, user: null });
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/me`, {
        headers: get().getAuthHeaders()
      });
      if (res.ok) {
        const body = await res.json();
        const user = body.data || body;
        set({ user, isAuthenticated: true, isLoading: false });
      } else {
        get().logout();
      }
    } catch {
      get().logout();
    }
  },

  login: async (username, password) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        return {
          success: false,
          code: body.code || 'AUTH_INVALID_CREDENTIALS',
          message: body.message || body.code || 'AUTH_INVALID_CREDENTIALS'
        };
      }

      const data = body.data || body;
      set({
        user: data.user,
        token: data.token,
        isAuthenticated: true,
        isLoading: false
      });
      localStorage.setItem('crm-token', data.token);

      return { success: true, code: body.message || 'AUTH_LOGIN_SUCCESS' };
    } catch {
      return { success: false, code: 'AUTH_SERVER_ERROR', message: 'AUTH_SERVER_ERROR' };
    }
  },

  logout: () => {
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      clients: [],
      users: [],
      events: []
    });
    localStorage.removeItem('crm-token');
  },

  updateOwnPassword: async (currentPassword, newPassword) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/me/password`, {
        method: 'PUT',
        headers: get().getAuthHeaders(),
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const body = await res.json().catch(() => ({}));

      if (res.ok) {
        return { success: true, message: body.message || 'AUTH_PASSWORD_UPDATED' };
      }

      return { success: false, error: body.code || body.message || 'AUTH_PASSWORD_UPDATE_ERROR' };
    } catch {
      return { success: false, error: 'AUTH_SERVER_ERROR' };
    }
  }
});
