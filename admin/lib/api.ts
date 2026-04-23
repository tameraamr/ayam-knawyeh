const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const apiClient = {
  get: async (path: string, token?: string) => {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: 'no-store',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'خطأ غير معروف' }));
      throw new Error(err.error || 'خطأ في الطلب');
    }
    return res.json();
  },

  post: async (path: string, data: unknown, token?: string) => {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'خطأ غير معروف' }));
      throw new Error(err.error || 'خطأ في الطلب');
    }
    return res.json();
  },

  put: async (path: string, data: unknown, token?: string) => {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'خطأ غير معروف' }));
      throw new Error(err.error || 'خطأ في الطلب');
    }
    return res.json();
  },

  delete: async (path: string, token?: string) => {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'خطأ غير معروف' }));
      throw new Error(err.error || 'خطأ في الطلب');
    }
    return res.json();
  },

  uploadImage: async (file: File, token: string): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch(`${API_BASE}/api/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'فشل رفع الصورة' }));
      throw new Error(err.error || 'فشل رفع الصورة');
    }
    const data = await res.json();
    return data.imageUrl;
  },
};

export const API_BASE_URL = API_BASE;
