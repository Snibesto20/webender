export const createClientSlice = (set, get) => ({
  clients: [],
  isLoading: false,
  filterType: 'processed',

  setFilterType: (type) => set({ filterType: type }),

  mergeClient: (client) => {
    if (!client) return;
    const clientId = client._id || client.id;
    set((state) => {
      const byId = state.clients.findIndex(c => (c._id || c.id) === clientId);
      if (byId >= 0) {
        const updated = [...state.clients];
        updated[byId] = client;
        return { clients: updated };
      }
      const byName = state.clients.findIndex(
        c => (c.name || '').trim().toUpperCase() === (client.name || '').trim().toUpperCase()
      );
      if (byName >= 0) {
        const updated = [...state.clients];
        updated[byName] = client;
        return { clients: updated };
      }
      return { clients: [client, ...state.clients] };
    });
  },

  fetchClients: async () => {
    try {
      set({ isLoading: true });
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/clients`, {
        headers: get().getAuthHeaders()
      });
      if (res.status === 401 || res.status === 403) {
        get().logout();
        return;
      }
      const body = await res.json();
      const data = body.data ?? body;
      const remote = Array.isArray(data) ? data : [];
      const localSimulated = get().clients.filter(c => c.isGuestSimulated);
      set({ clients: [...localSimulated, ...remote], isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  addClient: async (clientData) => {
    const currentUser = get().user;

    // Guest simulation: UI-only, never hits the database
    if (currentUser?.role === 'guest') {
      const tempId = `guest-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const simulated = {
        ...clientData,
        _id: tempId,
        id: tempId,
        marketer: currentUser.username || 'guest',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        moneyMade: clientData.moneyMade || 0,
        isGuestSimulated: true
      };
      set((state) => ({ clients: [simulated, ...state.clients] }));
      return { ...simulated, _guestSimulated: true };
    }

    try {
      const dataWithMarketer = {
        ...clientData,
        marketer: currentUser ? currentUser.username : 'nenurodyta'
      };

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/clients`, {
        method: 'POST',
        headers: get().getAuthHeaders(),
        body: JSON.stringify(dataWithMarketer)
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        const error = new Error(body.code || 'CLIENT_CREATE_ERROR');
        error.meta = body.meta;
        throw error;
      }

      const resData = body.data ?? body;
      set((state) => ({ clients: [...state.clients, resData] }));
      return resData;
    } catch (err) {
      console.error('Klaida pridedant klientą:', err);
      throw err;
    }
  },

  updateClient: async (id, updatedData) => {
    const currentUser = get().user;
    const existing = get().clients.find(c => c._id === id || c.id === id);

    if (currentUser?.role === 'guest') {
      if (existing?.isGuestSimulated) {
        const merged = { ...existing, ...updatedData, updatedAt: new Date().toISOString() };
        set((state) => ({
          clients: state.clients.map(c => (c._id === id || c.id === id) ? merged : c)
        }));
        return merged;
      }
      const error = new Error('CLIENT_GUEST_FORBIDDEN');
      throw error;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/clients/${id}`, {
        method: 'PUT',
        headers: get().getAuthHeaders(),
        body: JSON.stringify(updatedData)
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        const error = new Error(body.code || 'CLIENT_UPDATE_ERROR');
        error.meta = body.meta;
        throw error;
      }

      const resData = body.data ?? body;
      set((state) => ({
        clients: state.clients.map(c => (c._id === id || c.id === id) ? resData : c)
      }));
      return resData;
    } catch (err) {
      console.error('Klaida atnaujinant klientą:', err);
      throw err;
    }
  },

  deleteClient: async (id) => {
    const currentUser = get().user;
    const existing = get().clients.find(c => c._id === id || c.id === id);

    if (currentUser?.role === 'guest') {
      if (existing?.isGuestSimulated) {
        set((state) => ({
          clients: state.clients.filter(c => c._id !== id && c.id !== id)
        }));
        return;
      }
      throw new Error('CLIENT_GUEST_FORBIDDEN');
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/clients/${id}`, {
        method: 'DELETE',
        headers: get().getAuthHeaders()
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.code || 'CLIENT_DELETE_ERROR');
      }

      set((state) => ({
        clients: state.clients.filter(c => c._id !== id && c.id !== id)
      }));
    } catch (err) {
      console.error('Klaida trinant klientą:', err);
      throw err;
    }
  },
});
