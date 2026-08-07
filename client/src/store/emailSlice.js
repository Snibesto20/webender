export const createEmailSlice = (set, get) => ({
  sendEmail: async (clientData) => {
    const to = (clientData.to || clientData.email || '').trim();
    const name = (clientData.name || '').trim().toUpperCase();
    const language = clientData.language || get().language || 'lt';

    const payload = {
      to,
      name,
      language,
      clientId: clientData.id || null,
    };

    if (!to) {
      return { success: false, error: 'EMAIL_RECIPIENT_REQUIRED' };
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/send-email`, {
        method: 'POST',
        headers: get().getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        return { success: false, error: result.code || result.error || 'EMAIL_SEND_ERROR' };
      }

      const data = result.data ?? result;
      if (data?.client) {
        get().mergeClient(data.client);
      }

      return { success: true, data };
    } catch (error) {
      console.error('Klaida siunčiant laišką:', error);
      return { success: false, error: 'EMAIL_SERVER_UNREACHABLE' };
    }
  }
});
