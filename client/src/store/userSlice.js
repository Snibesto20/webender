export const createUserSlice = (set, get) => ({
  users: [],
  isUsersLoading: false,
  usersError: null,

  fetchUsers: async () => {
    set({ isUsersLoading: true, usersError: null });
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users`, {
        headers: get().getAuthHeaders()
      });

      if (!response.ok) throw new Error('Nepavyko gauti vartotojų');

      const body = await response.json();
      const data = body.data ?? body;
      set({ users: Array.isArray(data) ? data : [], isUsersLoading: false });
    } catch (error) {
      set({ usersError: error.message, isUsersLoading: false });
    }
  },

  createUser: async (userData) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users`, {
      method: 'POST',
      headers: get().getAuthHeaders(),
      body: JSON.stringify(userData)
    });
    const body = await res.json();
    if (!res.ok) {
      throw new Error(body.code || 'USER_CREATE_ERROR');
    }
    const data = body.data ?? body;
    set(state => ({ users: [...state.users, data] }));
    return data;
  },

  deleteUser: async (id) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${id}`, {
        method: 'DELETE',
        headers: get().getAuthHeaders()
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.code || 'USER_DELETE_ERROR');
      }

      set((state) => ({
        users: state.users.filter((u) => u._id !== id && u.id !== id)
      }));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
});
