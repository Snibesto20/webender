export const createEventSlice = (set, get) => ({
  events: [],
  eventsLoading: false,

  fetchEvents: async () => {
    try {
      set({ eventsLoading: true });
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/events`, {
        headers: get().getAuthHeaders()
      });
      if (res.status === 401 || res.status === 403) {
        get().logout();
        return;
      }
      const body = await res.json();
      const data = body.data ?? body;
      const remote = Array.isArray(data) ? data : [];
      const localSimulated = get().events.filter(e => e.isGuestSimulated);
      set({ events: [...localSimulated, ...remote], eventsLoading: false });
    } catch {
      set({ eventsLoading: false });
    }
  },

  addEvent: async (eventData) => {
    const currentUser = get().user;

    if (currentUser?.role === 'guest') {
      const tempId = `guest-event-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const eventDate = new Date(eventData.date);
      const clientId = eventData.clientId || null;
      const linked = clientId
        ? get().clients.find(c => String(c._id || c.id) === String(clientId))
        : null;

      const simulated = {
        _id: tempId,
        id: tempId,
        note: eventData.note,
        date: eventDate.toISOString(),
        clientId: linked ? (linked._id || linked.id) : null,
        client: linked ? { name: linked.name, tag: linked.tag } : null,
        createdBy: currentUser._id || currentUser.id || null,
        createdByName: currentUser.username || 'guest',
        archived: eventDate < new Date(),
        isGuestSimulated: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      set((state) => ({ events: [simulated, ...state.events] }));
      return { ...simulated, _guestSimulated: true };
    }

    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/events`, {
      method: 'POST',
      headers: get().getAuthHeaders(),
      body: JSON.stringify(eventData)
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(body.code || 'EVENT_CREATE_ERROR');
    }
    const data = body.data ?? body;
    set((state) => ({ events: [...state.events, data] }));
    return data;
  },

  updateEvent: async (id, eventData) => {
    const currentUser = get().user;
    const existing = get().events.find(e => e._id === id || e.id === id);

    if (currentUser?.role === 'guest') {
      if (existing?.isGuestSimulated) {
        const eventDate = eventData.date ? new Date(eventData.date) : new Date(existing.date);
        const clientId = eventData.clientId !== undefined ? eventData.clientId : existing.clientId;
        const linked = clientId
          ? get().clients.find(c => String(c._id || c.id) === String(clientId?._id || clientId))
          : null;

        const merged = {
          ...existing,
          ...eventData,
          date: eventDate.toISOString(),
          clientId: linked ? (linked._id || linked.id) : (clientId || null),
          client: linked ? { name: linked.name, tag: linked.tag } : null,
          archived: eventDate < new Date(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          events: state.events.map(e => (e._id === id || e.id === id) ? merged : e)
        }));
        return merged;
      }
      throw new Error('CLIENT_GUEST_FORBIDDEN');
    }

    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/events/${id}`, {
      method: 'PUT',
      headers: get().getAuthHeaders(),
      body: JSON.stringify(eventData)
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(body.code || 'EVENT_UPDATE_ERROR');
    }
    const data = body.data ?? body;
    set((state) => ({
      events: state.events.map(e => (e._id === id || e.id === id) ? data : e)
    }));
    return data;
  },

  deleteEvent: async (id) => {
    const currentUser = get().user;
    const existing = get().events.find(e => e._id === id || e.id === id);

    if (currentUser?.role === 'guest') {
      if (existing?.isGuestSimulated) {
        set((state) => ({
          events: state.events.filter(e => e._id !== id && e.id !== id)
        }));
        return;
      }
      throw new Error('CLIENT_GUEST_FORBIDDEN');
    }

    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/events/${id}`, {
      method: 'DELETE',
      headers: get().getAuthHeaders()
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.code || 'EVENT_DELETE_ERROR');
    }
    set((state) => ({
      events: state.events.filter(e => e._id !== id && e.id !== id)
    }));
  }
});
