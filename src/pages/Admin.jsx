import { useEffect, useState } from 'react';
import {
  ArrowLeft, Check, ClipboardList, Key, LogIn, LogOut,
  PackagePlus, Pencil, ShieldCheck, Trash2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { productsApi, ordersApi, authApi, supabase } from '@/api/client';

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

  useEffect(() => {
    if (isAuthenticated) { loadProducts(); loadOrders(); }
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

  // ── Order status update ──────────────────────────────────────
  const updateOrderStatus = async (orderId, status) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
    if (!error) setOrders((c) => c.map((o) => o.id === orderId ? { ...o, status } : o));
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
        <div className="mb-8 flex gap-2 rounded-2xl bg-white p-1.5 border border-stone/15 w-fit">
          {[
            { key: 'products', label: 'Products', icon: PackagePlus },
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

        {/* ── Orders tab ─────────────────────────────────────────── */}
        {tab === 'orders' && (
          <section className="rounded-3xl border border-stone/15 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6 flex items-center justify-between">
              <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-harvest">Click &amp; collect</p><h2 className="mt-2 font-heading text-2xl font-bold">Orders ({orders.length})</h2></div>
              <button type="button" onClick={loadOrders} className="rounded-full border border-stone/20 px-4 py-2 text-sm font-semibold text-forest hover:border-harvest">Refresh</button>
            </div>
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
                        <td className="py-3 pr-4 font-mono text-xs text-stone">{String(o.id).slice(0,8)}…</td>
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
                          <select value={o.status} onChange={(e) => updateOrderStatus(o.id, e.target.value)}
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
