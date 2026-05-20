// src/context/authStore.js
import { create } from 'zustand';
import { authAPI } from '../services/api';

export const useAuthStore = create((set, get) => ({
  user:    JSON.parse(localStorage.getItem('kc_user') || 'null'),
  token:   localStorage.getItem('kc_token') || null,
  loading: false,
  error:   null,

  setUser: (user) => {
    localStorage.setItem('kc_user', JSON.stringify(user));
    set({ user });
  },

  login: async (credentials) => {
    set({ loading: true, error: null });
    try {
      const { data } = await authAPI.login(credentials);
      localStorage.setItem('kc_token', data.token);
      localStorage.setItem('kc_user', JSON.stringify(data.user));
      set({ token: data.token, user: data.user, loading: false });
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      set({ error: msg, loading: false });
      throw new Error(msg);
    }
  },

  register: async (formData) => {
    set({ loading: true, error: null });
    try {
      const { data } = await authAPI.register(formData);
      localStorage.setItem('kc_token', data.token);
      localStorage.setItem('kc_user', JSON.stringify(data.user));
      set({ token: data.token, user: data.user, loading: false });
      return data;
    } catch (err) {
      const errors = err.response?.data?.errors || {};
      const msg    = err.response?.data?.message || 'Registration failed';
      set({ error: msg, loading: false });
      throw { message: msg, errors };
    }
  },

  logout: async () => {
    try { await authAPI.logout(); } catch {}
    localStorage.removeItem('kc_token');
    localStorage.removeItem('kc_user');
    set({ user: null, token: null });
    window.location.href = '/login';
  },

  fetchMe: async () => {
    try {
      const { data } = await authAPI.me();
      get().setUser(data.user);
    } catch {}
  },

  isAdmin:   () => ['admin','staff'].includes(get().user?.role),
  isTailor:  () => get().user?.role === 'tailor',
  isLoggedIn:() => !!get().token,
}));


// src/context/cartStore.js
import toast from 'react-hot-toast';

export const useCartStore = create((set, get) => ({
  items: JSON.parse(localStorage.getItem('kc_cart') || '[]'),

  _save: (items) => {
    localStorage.setItem('kc_cart', JSON.stringify(items));
    set({ items });
  },

  addItem: (product, quantity = 1, variant = null) => {
    const items = get().items;
    const key   = `${product.id}-${variant?.id || 'default'}`;
    const idx   = items.findIndex(i => i.key === key);

    if (idx >= 0) {
      const updated = [...items];
      updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + quantity };
      get()._save(updated);
    } else {
      get()._save([...items, {
        key, product, variant, quantity,
        price: variant?.price || product.sale_price || product.price,
      }]);
    }
    toast.success(`${product.name} added to cart!`);
  },

  removeItem: (key) => {
    get()._save(get().items.filter(i => i.key !== key));
  },

  updateQty: (key, qty) => {
    if (qty <= 0) { get().removeItem(key); return; }
    get()._save(get().items.map(i => i.key === key ? { ...i, quantity: qty } : i));
  },

  clearCart: () => {
    localStorage.removeItem('kc_cart');
    set({ items: [] });
  },

  // Plain computed functions — call as total(), count() after destructuring
  // OR use selector: useCartStore(s => s.total())
  total:    () => get().items.reduce((s, i) => s + (i.price * i.quantity), 0),
  count:    () => get().items.reduce((s, i) => s + i.quantity, 0),
  subtotal: () => get().items.reduce((s, i) => s + (i.price * i.quantity), 0),
}));

