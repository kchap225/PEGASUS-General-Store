import { useEffect, useState } from 'react';
import {
  ArrowLeft, Check, ClipboardList, Key, LogIn, LogOut,
  PackagePlus, Pencil, ShieldCheck, Store, Trash2, Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { productsApi, ordersApi, authApi, supabase, suppliersApi, storeSettingsApi, uploadImage } from '@/api/client';
import { STORE, applyStoreSettings } from '@/lib/storeInfo';

const categories = ['Bakery', 'Pantry', 'Ready Meals', 'Specialty Meats', 'Wine & Drinks', 'Other'];

const emptyForm = {
  name: '', description: '', price: '', category: 'Pantry',
  supplier: '', image_url: '', available_for_preorder: true,
};

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-forest">{label}</span>
      {children}
    </label>
  );
}

const inputClass = 'w-full rounded-xl border border-stone/20 bg-linen px-3 py-2.5 text-forest outline-none transition-colors placeholder:text-stone/60 focus:border-harvest focus:ring-2 focus:ring-harvest/10';

// ── Status badge ──────────────────────────────────────────────
const STATUS_COLORS = {
  pending:   'bg-amber-50 text-amber-700 border-amber-200',
  confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
  ready:     'bg-emerald-50 text-emerald-700 border-emerald-200',
  collected: 'bg-stone/10 text-stone border-stone/20',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
};

function StatusBadge({ status }) {
  return (
    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${STATUS_COLORS[status] || STATUS_COLORS.pending}`}>
      {status}
    </span>
  );
}

// File picker that uploads to Supabase Storage ("product-images" bucket)
// and fills in the Image URL field with the public URL. A storage failure
// never breaks saving: the message says so plainly and the URL field
// stays usable.
function ImageUploadField({ onUrl }) {
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true); setErr(''); setMsg('');
    try {
      const url = await uploadImage(file);
      onUrl(url);
      setMsg('Image uploaded — its URL is now in the Image URL field below.');
    } catch (e) {
      setErr(`Upload failed (${e?.message || 'storage not available'}). The "product-images" bucket may not be set up yet — see supabase-setup.sql. You can still paste an Image URL, and saving still works.`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <span className="mb-1.5 block text-sm font-medium text-forest">Upload image</span>
      <input type="file" accept="image/*" onChange={handleFile} disabled={uploading}
        className="w-full rounded-xl border border-stone/20 bg-linen px-3 py-2.5 text-sm text-forest file:mr-3 file:rounded-full file:border-0 file:bg-harvest file:px-4 file:py-1.5 file:text-sm file:font-semibold file:text-linen" />
      {uploading && <p className="mt-1.5 text-sm text-stone">Uploading…</p>}
      {msg && <p className="mt-1.5 text-sm text-emerald-700">{msg}</p>}
      {err && <p className="mt-1.5 text-sm text-red-700">{err}</p>}
    </div>
  );
}

const emptySupplierForm = {
  name: '', region: '', story: '', product_range: '', image_url: '',
};

// Store-settings form, seeded from the current (possibly Admin-overridden)
// store values. Hours rows carry both the display string and the numeric
// open/close hours the open/closed status is computed from.
function storeFormFromStore() {
  const row = (day, weekday) => {
    const hoursRow = STORE.hours.find((h) => h.day === day) || { day, time: '' };
    const [o, c] = STORE.openHours[weekday] || [7, 20];
    return { day, time: hoursRow.time, open: o, close: c };
  };
  return {
    address: STORE.address,
    addressShort: STORE.addressShort,
    phone: STORE.phone,
    email: STORE.email,
    lat: String(STORE.coords.lat),
    lng: String(STORE.coords.lng),
    statusOverride: STORE.statusOverride || 'auto',
    hours: [
      row('Monday – Friday', 1),
      row('Saturday', 6),
      row('Sunday', 0),
    ],
  };
}

function fmtDate(d) {
  if (!d) return '';
  try { return new Date(d).toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric' }); }
  catch { return d; }
}

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [tab, setTab] = useState('products'); // 'products' | 'orders' | 'password'

  // Products
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productMsg, setProductMsg] = useState('');
  const [productErr, setProductErr] = useState('');

  // Orders
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Suppliers (same format as products)
  const [suppliers, setSuppliers] = useState([]);
  const [supplierForm, setSupplierForm] = useState(emptySupplierForm);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [supplierMsg, setSupplierMsg] = useState('');
  const [supplierErr, setSupplierErr] = useState('');

  // Store settings
  const [storeForm, setStoreForm] = useState(storeFormFromStore);
  const [storeMsg, setStoreMsg] = useState('');
  const [storeErr, setStoreErr] = useState('');

  // Password change
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [pwMsg, setPwMsg] = useState('');
  const [pwErr, setPwErr] = useState('');

  // Login error
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    authApi.adminSession().then((active) => {
      setIsAuthenticated(!!active);
      setAuthChecked(true);
    }).catch(() => setAuthChecked(true));
  }, []);

  const loadProducts = () =>
    productsApi.list('-created_at', 200).then(setProducts).catch(() => setProducts([]));

  const loadOrders = () => {
    setOrdersLoading(true);
    ordersApi.list().then(setOrders).catch(() => setOrders([])).finally(() => setOrdersLoading(false));
  };

  const loadSuppliers = () =>
    suppliersApi.list('-created_at', 200).then(setSuppliers).catch(() => setSuppliers([]));

  const loadStoreSettings = async () => {
    try {
      const saved = await storeSettingsApi.get();
      if (saved) {
        applyStoreSettings(saved);
        setStoreForm(storeFormFromStore());
      }
    } catch {
      // Local / compiled-in defaults already in the form — keep them.
    }
  };

  useEffect(() => {
    if (isAuthenticated) { loadProducts(); loadOrders(); loadSuppliers(); loadStoreSettings(); }
  }, [isAuthenticated]);

  // ── Product form ─────────────────────────────────────────────
  const updateField = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((c) => ({ ...c, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setProductErr(''); setProductMsg('');
    try {
      if (editingProduct) {
        await productsApi.update(editingProduct.id, form);
      } else {
        await productsApi.create(form);
      }
      setForm(emptyForm); setEditingProduct(null);
      setProductMsg(editingProduct ? 'Product updated.' : 'Product added to the store.');
      loadProducts();
    } catch (e) { setProductErr(e?.message || 'Could not save product.'); }
  };

  const startEditing = (p) => {
    setEditingProduct(p);
    setForm({
      name: p.name || '', description: p.description || '',
      price: p.price ?? '', category: p.category || 'Pantry',
      supplier: p.supplier || '', image_url: p.image_url || '',
      available_for_preorder: p.available_for_preorder !== false,
    });
    setProductMsg(''); setProductErr('');
    setTab('products');
  };

  const handleDelete = async (p) => {
    if (!window.confirm(`Remove ${p.name} from the store?`)) return;
    await productsApi.delete(p.id);
    setProducts((c) => c.filter((item) => item.id !== p.id));
    setProductMsg(`${p.name} removed.`);
  };

  // ── Supplier form (same shape as the product form) ─────────────
  const updateSupplierField = (event) => {
    const { name, value } = event.target;
    setSupplierForm((c) => ({ ...c, [name]: value }));
  };

  const handleSupplierSubmit = async (event) => {
    event.preventDefault();
    setSupplierErr(''); setSupplierMsg('');
    try {
      const saved = editingSupplier
        ? await suppliersApi.update(editingSupplier.id, supplierForm)
        : await suppliersApi.create(supplierForm);
      setSupplierForm(emptySupplierForm); setEditingSupplier(null);
      setSupplierMsg(saved?._local
        ? 'Supplier saved in this browser only (Supabase suppliers table not available yet — run supabase-setup.sql to share it).'
        : (editingSupplier ? 'Supplier updated.' : 'Supplier added.'));
      loadSuppliers();
    } catch (e) { setSupplierErr(e?.message || 'Could not save supplier.'); }
  };

  const startEditingSupplier = (s) => {
    setEditingSupplier(s);
    setSupplierForm({
      name: s.name || '', region: s.region || '', story: s.story || '',
      product_range: s.product_range || '', image_url: s.image_url || '',
    });
    setSupplierMsg(''); setSupplierErr('');
    setTab('suppliers');
  };

  const handleSupplierDelete = async (s) => {
    if (!window.confirm(`Remove ${s.name} from the suppliers?`)) return;
    try {
      await suppliersApi.delete(s.id);
      setSuppliers((c) => c.filter((item) => String(item.id) !== String(s.id)));
      setSupplierMsg(`${s.name} removed.`);
    } catch (e) { setSupplierErr(e?.message || 'Could not remove supplier.'); }
  };

  // ── Store settings form ────────────────────────────────────────
  const updateStoreField = (event) => {
    const { name, value } = event.target;
    setStoreForm((c) => ({ ...c, [name]: value }));
  };

  const updateStoreHoursRow = (index, field, value) => {
    setStoreForm((c) => ({
      ...c,
      hours: c.hours.map((row, i) => (i === index ? { ...row, [field]: field === 'time' || field === 'day' ? value : Number(value) } : row)),
    }));
  };

  const handleStoreSubmit = async (event) => {
    event.preventDefault();
    setStoreErr(''); setStoreMsg('');
    const lat = Number(storeForm.lat);
    const lng = Number(storeForm.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) { setStoreErr('Map latitude and longitude must be numbers.'); return; }
    if (storeForm.hours.some((r) => !r.time || !(r.open < r.close))) { setStoreErr('Each hours row needs a display time and an opening hour before its closing hour.'); return; }
    const mf = storeForm.hours[0];
    const sat = storeForm.hours[1];
    const sun = storeForm.hours[2];
    const settings = {
      address: storeForm.address.trim(),
      addressShort: storeForm.addressShort.trim(),
      phone: storeForm.phone.trim(),
      phoneHref: `tel:+${storeForm.phone.replace(/[^0-9]/g, '')}`,
      email: storeForm.email.trim(),
      hours: storeForm.hours.map(({ day, time }) => ({ day, time })),
      openHours: {
        0: [sun.open, sun.close],
        1: [mf.open, mf.close], 2: [mf.open, mf.close], 3: [mf.open, mf.close],
        4: [mf.open, mf.close], 5: [mf.open, mf.close],
        6: [sat.open, sat.close],
      },
      coords: { lat, lng },
      statusOverride: storeForm.statusOverride,
    };
    try {
      const saved = await storeSettingsApi.save(settings);
      applyStoreSettings(settings);
      setStoreForm(storeFormFromStore());
      setStoreMsg(saved?._local
        ? 'Store settings saved in this browser only (Supabase store_settings not available yet — run supabase-setup.sql to share them).'
        : 'Store settings saved.');
    } catch (e) { setStoreErr(e?.message || 'Could not save store settings.'); }
  };

  // ── Order status update ──────────────────────────────────────
  // Updates the order in Supabase, then emails the customer about the
  // new status via the Pages Function in functions/api/order-email.js.
  // The status change is kept even if the email fails — an email
  // failure must never undo an Admin action.
  const [orderEmailMsg, setOrderEmailMsg] = useState('');
  const updateOrderStatus = async (order, status) => {
    if (!order || order.status === status) return;
    const { error } = await supabase.from('orders').update({ status }).eq('id', order.id);
    if (error) return;
    const updated = { ...order, status };
    setOrders((c) => c.map((o) => o.id === order.id ? updated : o));
    setOrderEmailMsg('');
    if (!order.email) {
      setOrderEmailMsg(`Status saved as ${status}, but no email was sent — this order has no customer email.`);
      return;
    }
    try {
      const response = await fetch('/api/order-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'status-changed', order: updated }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.emailedCustomer) {
        setOrderEmailMsg(`Status saved as ${status}, but the customer email could not be sent${data.reason ? ` — ${data.reason}` : '.'}`);
      }
    } catch {
      setOrderEmailMsg(`Status saved as ${status}, but the customer email could not be sent.`);
    }
  };

  // ── Login ────────────────────────────────────────────────────
  const handleLogin = async (event) => {
    event.preventDefault();
    setLoginError('');
    try {
      await authApi.adminLogin(credentials.email, credentials.password);
      setIsAuthenticated(true);
      setCredentials({ email: '', password: '' });
    } catch (e) { setLoginError(e?.message || 'Unable to sign in.'); }
  };

  // ── Password change ──────────────────────────────────────────
  const handlePasswordChange = async (event) => {
    event.preventDefault();
    setPwErr(''); setPwMsg('');
    if (pwForm.next !== pwForm.confirm) { setPwErr('New passwords do not match.'); return; }
    if (pwForm.next.length < 8) { setPwErr('Password must be at least 8 characters.'); return; }
    try {
      const { error } = await supabase.auth.updateUser({ password: pwForm.next });
      if (error) throw new Error(error.message);
      setPwMsg('Password updated successfully.');
      setPwForm({ current: '', next: '', confirm: '' });
    } catch (e) { setPwErr(e?.message || 'Could not update password.'); }
  };

  if (!authChecked) return null;

  // ── Login screen ─────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linen px-5 py-10 text-forest">
        <section className="w-full max-w-md rounded-3xl border border-stone/15 bg-white p-6 shadow-sm sm:p-8">
          <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-stone transition-colors hover:text-harvest">
            <ArrowLeft className="h-4 w-4" /> Back to storefront
          </Link>
          <div className="mb-7">
            <div className="mb-4 inline-flex rounded-full bg-harvest/10 p-3 text-harvest-dark"><ShieldCheck className="h-6 w-6" /></div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-harvest">Staff access</p>
            <h1 className="mt-2 font-heading text-3xl font-extrabold">Admin sign in</h1>
            <p className="mt-2 text-sm text-stone">Sign in to manage the Pegasus General Store catalogue.</p>
          </div>
          <form className="space-y-4" onSubmit={handleLogin}>
            <Field label="Email">
              <input required type="email" value={credentials.email} onChange={(e) => setCredentials({ ...credentials, email: e.target.value })} className={inputClass} placeholder="admin@pegasusgeneralstore.co.nz" />
            </Field>
            <Field label="Password">
              <input required type="password" value={credentials.password} onChange={(e) => setCredentials({ ...credentials, password: e.target.value })} className={inputClass} placeholder="Enter admin password" />
            </Field>
            {loginError && <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{loginError}</p>}
            <button type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-harvest px-5 py-3 text-sm font-semibold text-linen transition-colors hover:bg-harvest-dark">
              <LogIn className="h-4 w-4" /> Sign in
            </button>
          </form>
        </section>
      </div>
    );
  }

  // ── Main admin UI ─────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-linen text-forest">
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:py-10">

        {/* Header */}
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link to="/" className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-stone transition-colors hover:text-harvest">
              <ArrowLeft className="h-4 w-4" /> Back to storefront
            </Link>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-harvest">Store management</p>
            <h1 className="mt-2 font-heading text-4xl font-extrabold sm:text-5xl">Admin panel</h1>
          </div>
          <button type="button" onClick={async () => { await authApi.adminLogout(); setIsAuthenticated(false); }}
            className="inline-flex items-center gap-2 rounded-full border border-stone/20 px-4 py-2 text-sm font-semibold text-forest hover:border-harvest">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </header>

        {/* Tabs */}
        <div className="mb-8 flex flex-wrap gap-2 rounded-2xl bg-white p-1.5 border border-stone/15 w-fit">
          {[
            { key: 'products', label: 'Products', icon: PackagePlus },
            { key: 'suppliers', label: `Suppliers (${suppliers.length})`, icon: Users },
            { key: 'store', label: 'Store', icon: Store },
            { key: 'orders',   label: `Orders (${orders.length})`, icon: ClipboardList },
            { key: 'password', label: 'Change Password', icon: Key },
          ].map(({ key, label, icon: Icon }) => (
            <button key={key} type="button" onClick={() => setTab(key)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${tab === key ? 'bg-harvest text-linen' : 'text-stone hover:text-forest'}`}>
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </div>

        {/* ── Products tab ───────────────────────────────────────── */}
        {tab === 'products' && (
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
            <section className="h-fit rounded-3xl border border-stone/15 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-full bg-harvest/10 p-2 text-harvest-dark"><PackagePlus className="h-5 w-5" /></div>
                <div>
                  <h2 className="font-heading text-2xl font-bold">{editingProduct ? 'Edit product' : 'New product'}</h2>
                  <p className="text-sm text-stone">Required fields marked below.</p>
                </div>
              </div>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <Field label="Product name *"><input required name="name" value={form.name} onChange={updateField} className={inputClass} placeholder="e.g. Farmhouse granola" /></Field>
                <Field label="Description"><textarea name="description" value={form.description} onChange={updateField} className={inputClass} rows="3" placeholder="A short description for customers" /></Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Price (NZD) *"><input required min="0" step="0.01" type="number" name="price" value={form.price} onChange={updateField} className={inputClass} placeholder="12.50" /></Field>
                  <Field label="Category *"><select name="category" value={form.category} onChange={updateField} className={inputClass}>{categories.map((c) => <option key={c}>{c}</option>)}</select></Field>
                </div>
                <Field label="Supplier"><input name="supplier" value={form.supplier} onChange={updateField} className={inputClass} placeholder="Supplier or maker" /></Field>
                <ImageUploadField onUrl={(url) => setForm((c) => ({ ...c, image_url: url }))} />
                <Field label="Image URL"><input type="text" name="image_url" value={form.image_url} onChange={updateField} className={inputClass} placeholder="/images/product.jpg or https://..." /></Field>
                <label className="flex items-center gap-3 rounded-xl border border-stone/15 bg-linen p-3 text-sm font-medium">
                  <input type="checkbox" name="available_for_preorder" checked={form.available_for_preorder} onChange={updateField} className="h-4 w-4 accent-harvest" /> Available for click &amp; collect
                </label>
                {productErr && <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{productErr}</p>}
                {productMsg && <p className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700"><Check className="h-4 w-4" /> {productMsg}</p>}
                <div className="flex gap-3">
                  <button type="submit" className="flex-1 rounded-full bg-harvest px-5 py-3 text-sm font-semibold text-linen hover:bg-harvest-dark">{editingProduct ? 'Save changes' : 'Add product'}</button>
                  {editingProduct && <button type="button" onClick={() => { setEditingProduct(null); setForm(emptyForm); setProductErr(''); }} className="rounded-full border border-stone/20 px-5 py-3 text-sm font-semibold text-forest hover:border-harvest">Cancel</button>}
                </div>
              </form>
            </section>

            <section className="rounded-3xl border border-stone/15 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6 flex items-end justify-between gap-4">
                <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-harvest">Current catalogue</p><h2 className="mt-2 font-heading text-2xl font-bold">Products in store ({products.length})</h2></div>
                <Link to="/click-and-collect" className="text-sm font-semibold text-harvest-dark hover:text-harvest">View shop</Link>
              </div>
              <div className="space-y-3">
                {products.map((p) => (
                  <article key={p.id} className="flex items-center gap-3 rounded-2xl border border-stone/15 bg-linen p-3 sm:gap-4">
                    <img src={p.image_url || '/images/pantry.jpg'} alt="" className="h-16 w-16 rounded-xl object-cover" />
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-heading font-bold">{p.name}</h3>
                      <p className="text-sm text-stone">{p.category} · ${Number(p.price).toFixed(2)}</p>
                    </div>
                    <button type="button" onClick={() => startEditing(p)} className="rounded-full p-2 text-stone hover:bg-harvest/10 hover:text-harvest-dark" aria-label={`Edit ${p.name}`}><Pencil className="h-4 w-4" /></button>
                    <button type="button" onClick={() => handleDelete(p)} className="rounded-full p-2 text-stone hover:bg-red-50 hover:text-red-700" aria-label={`Remove ${p.name}`}><Trash2 className="h-4 w-4" /></button>
                  </article>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* ── Suppliers tab (same format as products) ─────────────── */}
        {tab === 'suppliers' && (
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
            <section className="h-fit rounded-3xl border border-stone/15 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-full bg-harvest/10 p-2 text-harvest-dark"><Users className="h-5 w-5" /></div>
                <div>
                  <h2 className="font-heading text-2xl font-bold">{editingSupplier ? 'Edit supplier' : 'New supplier'}</h2>
                  <p className="text-sm text-stone">The people behind the produce — same fields as shown on the homepage.</p>
                </div>
              </div>
              <form className="space-y-4" onSubmit={handleSupplierSubmit}>
                <Field label="Name *"><input required name="name" value={supplierForm.name} onChange={updateSupplierField} className={inputClass} placeholder="e.g. Bellbird Bakery" /></Field>
                <Field label="Location"><input name="region" value={supplierForm.region} onChange={updateSupplierField} className={inputClass} placeholder="e.g. Christchurch" /></Field>
                <Field label="Description"><textarea name="story" value={supplierForm.story} onChange={updateSupplierField} className={inputClass} rows="3" placeholder="What this supplier is known for" /></Field>
                <Field label="Product summary"><input name="product_range" value={supplierForm.product_range} onChange={updateSupplierField} className={inputClass} placeholder="e.g. Sourdough breads, French pastries" /></Field>
                <ImageUploadField onUrl={(url) => setSupplierForm((c) => ({ ...c, image_url: url }))} />
                <Field label="Image URL"><input type="text" name="image_url" value={supplierForm.image_url} onChange={updateSupplierField} className={inputClass} placeholder="/images/supplier.jpg or https://..." /></Field>
                {supplierForm.image_url && <img src={supplierForm.image_url} alt="" className="h-24 w-24 rounded-xl object-cover" />}
                {supplierErr && <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{supplierErr}</p>}
                {supplierMsg && <p className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700"><Check className="h-4 w-4" /> {supplierMsg}</p>}
                <div className="flex gap-3">
                  <button type="submit" className="flex-1 rounded-full bg-harvest px-5 py-3 text-sm font-semibold text-linen hover:bg-harvest-dark">{editingSupplier ? 'Save changes' : 'Add supplier'}</button>
                  {editingSupplier && <button type="button" onClick={() => { setEditingSupplier(null); setSupplierForm(emptySupplierForm); setSupplierErr(''); }} className="rounded-full border border-stone/20 px-5 py-3 text-sm font-semibold text-forest hover:border-harvest">Cancel</button>}
                </div>
              </form>
            </section>

            <section className="rounded-3xl border border-stone/15 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6 flex items-end justify-between gap-4">
                <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-harvest">The people behind the produce</p><h2 className="mt-2 font-heading text-2xl font-bold">Suppliers ({suppliers.length})</h2></div>
                <Link to="/#suppliers" className="text-sm font-semibold text-harvest-dark hover:text-harvest">View section</Link>
              </div>
              {suppliersApi.isLocalMode() && (
                <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">Supabase suppliers table not available — changes here are saved in this browser only until supabase-setup.sql is run.</p>
              )}
              <div className="space-y-3">
                {suppliers.map((s) => (
                  <article key={s.id || s.name} className="flex items-center gap-3 rounded-2xl border border-stone/15 bg-linen p-3 sm:gap-4">
                    <img src={s.image_url || '/images/pantry.jpg'} alt="" className="h-16 w-16 rounded-xl object-cover" />
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-heading font-bold">{s.name}</h3>
                      <p className="text-sm text-stone">{s.region}{s.product_range ? ` · ${s.product_range}` : ''}</p>
                    </div>
                    <button type="button" onClick={() => startEditingSupplier(s)} className="rounded-full p-2 text-stone hover:bg-harvest/10 hover:text-harvest-dark" aria-label={`Edit ${s.name}`}><Pencil className="h-4 w-4" /></button>
                    <button type="button" onClick={() => handleSupplierDelete(s)} className="rounded-full p-2 text-stone hover:bg-red-50 hover:text-red-700" aria-label={`Remove ${s.name}`}><Trash2 className="h-4 w-4" /></button>
                  </article>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* ── Store settings tab ───────────────────────────────────── */}
        {tab === 'store' && (
          <section className="max-w-3xl rounded-3xl border border-stone/15 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-full bg-harvest/10 p-2 text-harvest-dark"><Store className="h-5 w-5" /></div>
              <div>
                <h2 className="font-heading text-2xl font-bold">Store details &amp; hours</h2>
                <p className="text-sm text-stone">These drive the homepage status, the hours card, the contact section and the map pin. Status is normally worked out from the hours; override it only for a one-off closure or opening.</p>
              </div>
            </div>
            <form className="space-y-4" onSubmit={handleStoreSubmit}>
              <Field label="Address"><input name="address" value={storeForm.address} onChange={updateStoreField} className={inputClass} /></Field>
              <Field label="Short address (shown on the hero hours card)"><input name="addressShort" value={storeForm.addressShort} onChange={updateStoreField} className={inputClass} /></Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Phone"><input name="phone" value={storeForm.phone} onChange={updateStoreField} className={inputClass} /></Field>
                <Field label="Email"><input type="email" name="email" value={storeForm.email} onChange={updateStoreField} className={inputClass} /></Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Map latitude"><input type="number" step="any" name="lat" value={storeForm.lat} onChange={updateStoreField} className={inputClass} /></Field>
                <Field label="Map longitude"><input type="number" step="any" name="lng" value={storeForm.lng} onChange={updateStoreField} className={inputClass} /></Field>
              </div>
              <Field label="Current status">
                <select name="statusOverride" value={storeForm.statusOverride} onChange={updateStoreField} className={inputClass}>
                  <option value="auto">Auto — work it out from the hours</option>
                  <option value="open">Open (override)</option>
                  <option value="closed">Closed (override)</option>
                </select>
              </Field>
              <div>
                <span className="mb-1.5 block text-sm font-medium text-forest">Opening hours</span>
                <div className="space-y-3">
                  {storeForm.hours.map((row, i) => (
                    <div key={row.day} className="grid gap-3 sm:grid-cols-[1fr_1.4fr_0.6fr_0.6fr] sm:items-center">
                      <span className="text-sm font-medium text-forest">{row.day}</span>
                      <input value={row.time} onChange={(e) => updateStoreHoursRow(i, 'time', e.target.value)} className={inputClass} placeholder="7:00 AM – 8:00 PM" aria-label={`${row.day} display time`} />
                      <input type="number" min="0" max="24" value={row.open} onChange={(e) => updateStoreHoursRow(i, 'open', e.target.value)} className={inputClass} aria-label={`${row.day} opens (24h)`} />
                      <input type="number" min="0" max="24" value={row.close} onChange={(e) => updateStoreHoursRow(i, 'close', e.target.value)} className={inputClass} aria-label={`${row.day} closes (24h)`} />
                    </div>
                  ))}
                  <p className="text-xs text-stone">The two numbers per row are the opening and closing hours in 24-hour time (e.g. 7 and 20) — those are what the Open/Closed status uses.</p>
                </div>
              </div>
              {storeErr && <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{storeErr}</p>}
              {storeMsg && <p className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700"><Check className="h-4 w-4" /> {storeMsg}</p>}
              <button type="submit" className="w-full rounded-full bg-harvest px-5 py-3 text-sm font-semibold text-linen hover:bg-harvest-dark">Save store settings</button>
            </form>
          </section>
        )}

        {/* ── Orders tab ─────────────────────────────────────────── */}
        {tab === 'orders' && (
          <section className="rounded-3xl border border-stone/15 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6 flex items-center justify-between">
              <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-harvest">Click &amp; collect</p><h2 className="mt-2 font-heading text-2xl font-bold">Orders ({orders.length})</h2></div>
              <button type="button" onClick={loadOrders} className="rounded-full border border-stone/20 px-4 py-2 text-sm font-semibold text-forest hover:border-harvest">Refresh</button>
            </div>
            {orderEmailMsg && <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">{orderEmailMsg}</p>}
            {ordersLoading ? (
              <p className="text-stone text-sm">Loading orders…</p>
            ) : orders.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-stone/25 bg-linen p-8 text-center text-stone">No orders yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-stone/15 text-left text-xs font-semibold uppercase tracking-wider text-stone">
                      <th className="pb-3 pr-4">Ref</th>
                      <th className="pb-3 pr-4">Customer</th>
                      <th className="pb-3 pr-4">Items</th>
                      <th className="pb-3 pr-4">Collection</th>
                      <th className="pb-3 pr-4">Total</th>
                      <th className="pb-3 pr-4">Status</th>
                      <th className="pb-3">Update</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone/10">
                    {orders.map((o) => (
                      <tr key={o.id} className="align-top">
                        <td className="py-3 pr-4 font-mono text-xs text-stone" title={o.id ? `Full order id: ${o.id}` : undefined}>{o.short_reference ? `PGS-${o.short_reference}` : `${String(o.id).slice(0,8)}…`}</td>
                        <td className="py-3 pr-4">
                          <div className="font-semibold text-forest">{o.customer_name}</div>
                          <div className="text-stone">{o.phone}</div>
                          {o.email && <div className="text-stone text-xs">{o.email}</div>}
                        </td>
                        <td className="py-3 pr-4 max-w-[200px]">
                          <div className="text-forest">{o.items}</div>
                          {o.notes && <div className="text-stone text-xs mt-1">Note: {o.notes}</div>}
                        </td>
                        <td className="py-3 pr-4 whitespace-nowrap">
                          <div>{fmtDate(o.collection_date)}</div>
                          {o.collection_time && <div className="text-stone text-xs">{o.collection_time}</div>}
                        </td>
                        <td className="py-3 pr-4 font-semibold text-forest">${Number(o.total || 0).toFixed(2)}</td>
                        <td className="py-3 pr-4"><StatusBadge status={o.status} /></td>
                        <td className="py-3">
                          <select value={o.status} onChange={(e) => updateOrderStatus(o, e.target.value)}
                            className="rounded-lg border border-stone/20 bg-linen px-2 py-1.5 text-xs text-forest outline-none focus:border-harvest">
                            {['pending','confirmed','ready','collected','cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* ── Change password tab ───────────────────────────────── */}
        {tab === 'password' && (
          <section className="max-w-md rounded-3xl border border-stone/15 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-full bg-harvest/10 p-2 text-harvest-dark"><Key className="h-5 w-5" /></div>
              <div><h2 className="font-heading text-2xl font-bold">Change Password</h2><p className="text-sm text-stone">Update your admin password.</p></div>
            </div>
            <form className="space-y-4" onSubmit={handlePasswordChange}>
              <Field label="New password">
                <input required type="password" value={pwForm.next} onChange={(e) => setPwForm({ ...pwForm, next: e.target.value })} className={inputClass} placeholder="At least 8 characters" />
              </Field>
              <Field label="Confirm new password">
                <input required type="password" value={pwForm.confirm} onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })} className={inputClass} placeholder="Repeat new password" />
              </Field>
              {pwErr && <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{pwErr}</p>}
              {pwMsg && <p className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700"><Check className="h-4 w-4" /> {pwMsg}</p>}
              <button type="submit" className="w-full rounded-full bg-harvest px-5 py-3 text-sm font-semibold text-linen hover:bg-harvest-dark">Update password</button>
            </form>
          </section>
        )}

      </div>
    </div>
  );
}
