export const getAuthToken = (): string | null => localStorage.getItem("nextro_token");

export const getCurrentUserIdFromToken = (): string | null => {
  const token = getAuthToken();
  if (!token) return null;

  try {
    const [, payloadPart] = token.split(".");
    if (!payloadPart) return null;
    const base64 = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    const payload = JSON.parse(atob(padded)) as { id?: string };
    return payload.id || null;
  } catch {
    return null;
  }
};

export const getAuthHeader = (): Record<string, string> => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};
