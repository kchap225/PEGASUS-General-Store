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
// Admin role identifier stored in Supabase user_metadata
// ---------------------------------------------------------------------------
const ADMIN_ROLE = 'admin';

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
// Customer-facing order reference: pickup date/time + a random 5-digit
// number. The full database id is kept in the background (it stays on the
// order row and in Admin) and is never shown to the customer as the ref.
export function makeShortReference() {
  return String(Math.floor(10000 + Math.random() * 90000));
}

export function formatPickupReference({ short_reference, collection_date, collection_time } = {}) {
  const date = collection_date
    ? new Date(`${collection_date}T12:00:00`).toLocaleDateString('en-NZ', { weekday: 'short', day: 'numeric', month: 'short' })
    : '';
  const parts = [date, collection_time].filter(Boolean).join(' · ');
  const code = short_reference ? `PGS-${short_reference}` : 'PGS';
  return parts ? `${code} — pickup ${parts}` : code;
}

export const ordersApi = {
  submitClickCollectOrder: async (data) => {
    const { customer_name, phone, email, items, collection_date, collection_time, notes, total } = data || {};
    if (!customer_name || !phone || !collection_date) {
      throw new Error('Missing required fields (name, phone, collection date).');
    }
    const short_reference = makeShortReference();
    const payload = {
      customer_name,
      phone,
      email:           email           || null,
      items:           items           || '',
      collection_date,
      collection_time: collection_time || null,
      notes:           notes           || null,
      total:           Number(total)   || 0,
      status:          'pending',
      short_reference,
    };
    // If the orders table has not had the short_reference column added yet
    // (see supabase-setup.sql), retry without it so checkout still works —
    // the customer still sees the generated ref from this response.
    let { data: row, error } = await supabase.from('orders').insert([payload]).select().single();
    if (error && /short_reference/i.test(error.message || '')) {
      const { short_reference: _dropped, ...legacyPayload } = payload;
      ({ data: row, error } = await supabase.from('orders').insert([legacyPayload]).select().single());
    }
    if (error) throw new Error(error.message);
    console.log('Order submitted successfully:', row);
    return { success: true, order: { ...row, short_reference: row?.short_reference || short_reference } };
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
// authApi — admin + customers both use Supabase Auth
// ---------------------------------------------------------------------------
export const authApi = {
  /**
   * Admin login via Supabase Auth.
   * The admin user must have user_metadata.role = 'admin' set in Supabase.
   */
  adminLogin: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    const role = data.user?.user_metadata?.role;
    if (role !== ADMIN_ROLE) {
      await supabase.auth.signOut();
      throw new Error('This account does not have admin access.');
    }
    return { success: true, user: data.user };
  },

  /** Returns true if there is an active Supabase session with role=admin */
  adminSession: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return false;
    return session.user?.user_metadata?.role === ADMIN_ROLE;
  },

  adminLogout: async () => {
    await supabase.auth.signOut();
    return { success: true };
  },

  /** Register a customer via Supabase Auth */
  customerRegister: async (name, email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, role: 'customer' } },
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

  /** Get the current Supabase Auth session user */
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
// Local-storage helpers — fallback when Supabase is unavailable, so Admin
// features still work in a preview without credentials. Supabase remains
// the source of truth whenever it answers.
// ---------------------------------------------------------------------------
function readLocalJson(key) {
  try {
    if (typeof window === 'undefined') return null;
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeLocalJson(key, value) {
  try {
    if (typeof window !== 'undefined') window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full / unavailable — the in-memory state still works.
  }
}

// ---------------------------------------------------------------------------
// Image upload — Supabase Storage, with a clean failure (never a broken save)
// ---------------------------------------------------------------------------
export async function uploadImage(file, bucket = 'product-images') {
  if (!file) throw new Error('No file selected.');
  const safeName = String(file.name || 'image').replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `${Date.now()}-${safeName}`;
  const { data, error } = await supabase.storage.from(bucket).upload(path, file, { upsert: false });
  if (error) throw new Error(error.message);
  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
  if (!urlData?.publicUrl) throw new Error('Upload succeeded but no public URL was returned.');
  return urlData.publicUrl;
}

// ---------------------------------------------------------------------------
// suppliersApi — Supabase `suppliers` table, falling back to local JSON +
// a localStorage override (key: pegasus_suppliers) when Supabase is
// unavailable or the table does not exist yet.
// ---------------------------------------------------------------------------
const SUPPLIERS_LOCAL_KEY = 'pegasus_suppliers';
let suppliersLocalMode = false;

function localSuppliers() {
  const stored = readLocalJson(SUPPLIERS_LOCAL_KEY);
  if (Array.isArray(stored)) return stored;
  // First local use: start from the shipped seed list, giving each entry a
  // stable local id so edits/deletes can target it.
  return initialSuppliers.map((s, i) => ({ ...s, id: `local-${i}` }));
}

function supplierPayload(data = {}) {
  const name = String(data.name || '').trim();
  if (!name) throw new Error('Supplier name is required.');
  return {
    name,
    region:        String(data.region || '').trim() || null,
    story:         String(data.story || '').trim() || null,
    product_range: String(data.product_range || '').trim() || null,
    image_url:     String(data.image_url || '').trim() || null,
  };
}

export const suppliersApi = {
  list: async (_sort = '-created_date', limit = 50) => {
    if (!suppliersLocalMode) {
      try {
        const { data, error } = await supabase
          .from('suppliers')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(limit || 50);
        if (error) throw new Error(error.message);
        return data ?? [];
      } catch {
        suppliersLocalMode = true;
      }
    }
    let items = localSuppliers();
    if (limit) items = items.slice(0, limit);
    return items;
  },

  create: async (data = {}) => {
    const payload = supplierPayload(data);
    if (!suppliersLocalMode) {
      try {
        const { data: row, error } = await supabase.from('suppliers').insert([payload]).select().single();
        if (error) throw new Error(error.message);
        return row;
      } catch {
        suppliersLocalMode = true;
      }
    }
    const row = { ...payload, id: `local-${Date.now()}` };
    const items = localSuppliers();
    items.unshift(row);
    writeLocalJson(SUPPLIERS_LOCAL_KEY, items);
    return { ...row, _local: true };
  },

  update: async (supplierId, data = {}) => {
    const payload = supplierPayload(data);
    if (!suppliersLocalMode) {
      try {
        const { data: row, error } = await supabase.from('suppliers').update(payload).eq('id', supplierId).select().single();
        if (error) throw new Error(error.message);
        return row;
      } catch {
        suppliersLocalMode = true;
      }
    }
    const items = localSuppliers().map((s) => (String(s.id) === String(supplierId) ? { ...s, ...payload } : s));
    writeLocalJson(SUPPLIERS_LOCAL_KEY, items);
    return { ...payload, id: supplierId, _local: true };
  },

  delete: async (supplierId) => {
    if (!suppliersLocalMode) {
      try {
        const { error } = await supabase.from('suppliers').delete().eq('id', supplierId);
        if (error) throw new Error(error.message);
        return { success: true };
      } catch {
        suppliersLocalMode = true;
      }
    }
    writeLocalJson(SUPPLIERS_LOCAL_KEY, localSuppliers().filter((s) => String(s.id) !== String(supplierId)));
    return { success: true, _local: true };
  },

  /** True once a Supabase call has failed and local mode is in use. */
  isLocalMode: () => suppliersLocalMode,
};

// ---------------------------------------------------------------------------
// storeSettingsApi — Supabase `store_settings` single row (id = 1), falling
// back to localStorage (key: pegasus_store_settings). The Admin panel
// applies saved values via storeInfo.applyStoreSettings so the storefront
// in the same session picks them up.
// ---------------------------------------------------------------------------
const STORE_SETTINGS_LOCAL_KEY = 'pegasus_store_settings';

function settingsToDb(settings = {}) {
  return {
    id: 1,
    address: settings.address || null,
    address_short: settings.addressShort || null,
    phone: settings.phone || null,
    email: settings.email || null,
    hours: settings.hours || null,
    open_hours: settings.openHours || null,
    coords_lat: settings.coords ? Number(settings.coords.lat) : null,
    coords_lng: settings.coords ? Number(settings.coords.lng) : null,
    status_override: settings.statusOverride || 'auto',
  };
}

function settingsFromDb(row = {}) {
  return {
    address: row.address || undefined,
    addressShort: row.address_short || undefined,
    phone: row.phone || undefined,
    email: row.email || undefined,
    hours: row.hours || undefined,
    openHours: row.open_hours || undefined,
    coords: row.coords_lat != null && row.coords_lng != null
      ? { lat: Number(row.coords_lat), lng: Number(row.coords_lng) }
      : undefined,
    statusOverride: row.status_override || undefined,
  };
}

export const storeSettingsApi = {
  get: async () => {
    try {
      const { data, error } = await supabase.from('store_settings').select('*').eq('id', 1).maybeSingle();
      if (error) throw new Error(error.message);
      if (data) return settingsFromDb(data);
    } catch {
      // Fall through to the local override below.
    }
    return readLocalJson(STORE_SETTINGS_LOCAL_KEY);
  },

  save: async (settings = {}) => {
    writeLocalJson(STORE_SETTINGS_LOCAL_KEY, settings);
    try {
      const { error } = await supabase.from('store_settings').upsert([settingsToDb(settings)]).select().single();
      if (error) throw new Error(error.message);
      return { success: true };
    } catch {
      // Supabase unavailable / table missing: the local copy above is the
      // fallback, and the caller reports that plainly.
      return { success: true, _local: true };
    }
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
  storeSettings: storeSettingsApi,
  uploadImage,
};

export default api;
