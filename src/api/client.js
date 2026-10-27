import { createClient } from '@supabase/supabase-js';
import initialSuppliers from '@/data/suppliers.json';
import initialNewsEvents from '@/data/newsEvents.json';

// ---------------------------------------------------------------------------
// Supabase client
// ---------------------------------------------------------------------------
const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

// ---------------------------------------------------------------------------
// Admin credentials (local check — no Supabase Auth required for admin)
// ---------------------------------------------------------------------------
const ADMIN_EMAIL    = 'admin@pegasusgeneralstore.co.nz';
const ADMIN_PASSWORD = 'pegasus-admin';
const STORAGE_KEY_ADMIN_SESSION = 'pegasus_admin_session';

// ---------------------------------------------------------------------------
// productsApi — reads/writes the `products` table in Supabase
// ---------------------------------------------------------------------------
export const productsApi = {
  /** List all products, newest first */
  list: async (_sort = '-created_at', limit = 100) => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw new Error(error.message);
    return data ?? [];
  },

  /** Filter products by optional criteria */
  filter: async (filters = {}, _sort = '-created_at', limit = 100) => {
    let query = supabase.from('products').select('*').order('created_at', { ascending: false }).limit(limit);
    if (filters.available_for_preorder !== undefined) {
      query = query.eq('available_for_preorder', filters.available_for_preorder);
    }
    if (filters.category) {
      query = query.eq('category', filters.category);
    }
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data ?? [];
  },

  /** Create a new product row */
  create: async (data = {}) => {
    const name  = String(data.name  || '').trim();
    const price = Number(data.price);
    if (!name || !Number.isFinite(price) || price < 0 || !data.category) {
      throw new Error('Product name, category, and a valid price are required.');
    }
    const payload = {
      name,
      description:            String(data.description  || '').trim(),
      price,
      category:               data.category,
      available_for_preorder: data.available_for_preorder !== false,
      image_url:              String(data.image_url || '').trim() || null,
      supplier:               String(data.supplier  || '').trim() || null,
    };
    const { data: row, error } = await supabase.from('products').insert([payload]).select().single();
    if (error) throw new Error(error.message);
    return row;
  },

  /** Update an existing product row */
  update: async (productId, data = {}) => {
    const name  = String(data.name  || '').trim();
    const price = Number(data.price);
    if (!name || !Number.isFinite(price) || price < 0 || !data.category) {
      throw new Error('Product name, category, and a valid price are required.');
    }
    const payload = {
      name,
      description:            String(data.description  || '').trim(),
      price,
      category:               data.category,
      available_for_preorder: data.available_for_preorder !== false,
      image_url:              String(data.image_url || '').trim() || null,
      supplier:               String(data.supplier  || '').trim() || null,
    };
    const { data: row, error } = await supabase.from('products').update(payload).eq('id', productId).select().single();
    if (error) throw new Error(error.message);
    return row;
  },

  /** Delete a product row */
  delete: async (productId) => {
    const { error } = await supabase.from('products').delete().eq('id', productId);
    if (error) throw new Error(error.message);
    return { success: true };
  },
};

// ---------------------------------------------------------------------------
// ordersApi — reads/writes the `orders` table in Supabase
// ---------------------------------------------------------------------------
export const ordersApi = {
  submitClickCollectOrder: async (data) => {
    const { customer_name, phone, email, items, collection_date, notes, total } = data || {};
    if (!customer_name || !phone || !collection_date) {
      throw new Error('Missing required fields (name, phone, collection date).');
    }
    const payload = {
      customer_name,
      phone,
      email:           email           || null,
      items:           items           || '',
      collection_date,
      notes:           notes           || null,
      total:           Number(total)   || 0,
      status:          'pending',
    };
    const { data: row, error } = await supabase.from('orders').insert([payload]).select().single();
    if (error) throw new Error(error.message);
    console.log('Order submitted successfully:', row);
    return { success: true, order: row };
  },

  list: async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  },
};

// ---------------------------------------------------------------------------
// authApi — admin uses localStorage session; customers use Supabase Auth
// ---------------------------------------------------------------------------
export const authApi = {
  /** Admin login — checks hardcoded credentials, stores session in localStorage */
  adminLogin: async (email, password) => {
    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      throw new Error('Incorrect admin email or password.');
    }
    localStorage.setItem(STORAGE_KEY_ADMIN_SESSION, 'active');
    return { success: true, user: { email: ADMIN_EMAIL, role: 'admin' } };
  },

  adminSession: async () => localStorage.getItem(STORAGE_KEY_ADMIN_SESSION) === 'active',

  adminLogout: async () => {
    localStorage.removeItem(STORAGE_KEY_ADMIN_SESSION);
    return { success: true };
  },

  /** Register a customer via Supabase Auth */
  customerRegister: async (name, email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) throw new Error(error.message);
    return { success: true, user: data.user };
  },

  /** Login a customer via Supabase Auth */
  customerLogin: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    return { success: true, user: data.user };
  },

  /** Get the current Supabase Auth session */
  customerSession: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user ?? null;
  },

  customerLogout: async () => {
    await supabase.auth.signOut();
    return { success: true };
  },

  me: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user ?? null;
  },
};

// ---------------------------------------------------------------------------
// suppliersApi — still reads from local JSON (no Supabase table yet)
// ---------------------------------------------------------------------------
export const suppliersApi = {
  list: async (_sort = '-created_date', limit = 50) => {
    let items = [...initialSuppliers];
    if (limit) items = items.slice(0, limit);
    return items;
  },
};

// ---------------------------------------------------------------------------
// newsEventsApi — still reads from local JSON (no Supabase table yet)
// ---------------------------------------------------------------------------
export const newsEventsApi = {
  list: async (_sort = '-date', limit = 20) => {
    let items = [...initialNewsEvents];
    if (limit) items = items.slice(0, limit);
    return items;
  },
};

// ---------------------------------------------------------------------------
// Legacy default export — keeps old `import api from '@/api/client'` working
// ---------------------------------------------------------------------------
export const api = {
  products:   productsApi,
  orders:     ordersApi,
  auth:       authApi,
  suppliers:  suppliersApi,
  newsEvents: newsEventsApi,
};

export default api;
