import { useEffect, useState } from 'react';
import { ArrowLeft, Check, LogIn, LogOut, PackagePlus, Pencil, ShieldCheck, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { productsApi, authApi } from '@/api/client';

const categories = ['Bakery', 'Pantry', 'Ready Meals', 'Specialty Meats', 'Wine & Drinks', 'Other'];

const emptyForm = {
  name: '',
  description: '',
  price: '',
  category: 'Pantry',
  supplier: '',
  image_url: '',
  available_for_preorder: true,
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

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingProduct, setEditingProduct] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    authApi.adminSession().then((active) => {
      setIsAuthenticated(active);
      setAuthChecked(true);
    });
  }, []);

  const loadProducts = () => {
    productsApi.list('-created_date', 100).then(setProducts).catch(() => setProducts([]));
  };

  useEffect(() => {
    if (isAuthenticated) loadProducts();
  }, [isAuthenticated]);

  const updateField = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    try {
      if (editingProduct) {
        await productsApi.update(editingProduct.id, form);
      } else {
        await productsApi.create(form);
      }
      setForm(emptyForm);
      setEditingProduct(null);
      setMessage(editingProduct ? 'Product updated.' : 'Product added to the store.');
      loadProducts();
    } catch (submitError) {
      setError(submitError?.message || 'The product could not be added.');
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setError('');
    try {
      authApi.adminLogin(credentials.email, credentials.password);
      setIsAuthenticated(true);
      setCredentials({ email: '', password: '' });
    } catch (loginError) {
      setError(loginError?.message || 'Unable to sign in.');
    }
  };

  const startEditing = (product) => {
    setEditingProduct(product);
    setForm({
      name: product.name || '',
      description: product.description || '',
      price: product.price ?? '',
      category: product.category || 'Pantry',
      supplier: product.supplier || '',
      image_url: product.image_url || '',
      available_for_preorder: product.available_for_preorder !== false,
    });
    setMessage('');
    setError('');
  };

  const cancelEditing = () => {
    setEditingProduct(null);
    setForm(emptyForm);
    setError('');
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`Remove ${product.name} from the store?`)) return;
    await productsApi.delete(product.id);
    setProducts((current) => current.filter((item) => item.id !== product.id));
    setMessage(`${product.name} removed.`);
  };

  if (!authChecked) return null;

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linen px-5 py-10 text-forest">
        <section className="w-full max-w-md rounded-3xl border border-stone/15 bg-white p-6 shadow-sm sm:p-8">
          <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-stone transition-colors hover:text-harvest"><ArrowLeft className="h-4 w-4" /> Back to storefront</Link>
          <div className="mb-7"><div className="mb-4 inline-flex rounded-full bg-harvest/10 p-3 text-harvest-dark"><ShieldCheck className="h-6 w-6" /></div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-harvest">Staff access</p><h1 className="mt-2 font-heading text-3xl font-extrabold">Admin sign in</h1><p className="mt-2 text-sm text-stone">Sign in to manage the Pegasus General Store catalogue.</p></div>
          <form className="space-y-4" onSubmit={handleLogin}>
            <Field label="Email"><input required type="email" value={credentials.email} onChange={(event) => setCredentials({ ...credentials, email: event.target.value })} className={inputClass} placeholder="admin@pegasusgeneralstore.co.nz" /></Field>
            <Field label="Password"><input required type="password" value={credentials.password} onChange={(event) => setCredentials({ ...credentials, password: event.target.value })} className={inputClass} placeholder="Enter admin password" /></Field>
            {error && <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            <button type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-harvest px-5 py-3 text-sm font-semibold text-linen transition-colors hover:bg-harvest-dark"><LogIn className="h-4 w-4" /> Sign in</button>
          </form>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linen text-forest">
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:py-10">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link to="/" className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-stone transition-colors hover:text-harvest">
              <ArrowLeft className="h-4 w-4" /> Back to storefront
            </Link>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-harvest">Store management</p>
            <h1 className="mt-2 font-heading text-4xl font-extrabold sm:text-5xl">Manage products</h1>
            <p className="mt-2 max-w-xl text-stone">Keep the click & collect range fresh with products your customers can actually order.</p>
          </div>
          <div className="flex items-center gap-3"><div className="flex items-center gap-2 rounded-full border border-stone/15 bg-white px-4 py-2 text-sm text-stone"><PackagePlus className="h-4 w-4 text-harvest-dark" /> {products.length} products in range</div><button type="button" onClick={async () => { await authApi.adminLogout(); setIsAuthenticated(false); }} className="inline-flex items-center gap-2 rounded-full border border-stone/20 px-4 py-2 text-sm font-semibold text-forest hover:border-harvest"><LogOut className="h-4 w-4" /> Sign out</button></div>
        </header>

        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <section className="h-fit rounded-3xl border border-stone/15 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-full bg-harvest/10 p-2 text-harvest-dark"><PackagePlus className="h-5 w-5" /></div>
              <div>
                <h2 className="font-heading text-2xl font-bold">{editingProduct ? 'Edit product' : 'New product'}</h2>
                <p className="text-sm text-stone">Required fields are marked by the form.</p>
              </div>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <Field label="Product name"><input required name="name" value={form.name} onChange={updateField} className={inputClass} placeholder="e.g. Farmhouse granola" /></Field>
              <Field label="Description"><textarea name="description" value={form.description} onChange={updateField} className={inputClass} rows="3" placeholder="A short description for customers" /></Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Price (NZD)"><input required min="0" step="0.01" type="number" name="price" value={form.price} onChange={updateField} className={inputClass} placeholder="12.50" /></Field>
                <Field label="Category"><select name="category" value={form.category} onChange={updateField} className={inputClass}>{categories.map((category) => <option key={category}>{category}</option>)}</select></Field>
              </div>
              <Field label="Supplier"><input name="supplier" value={form.supplier} onChange={updateField} className={inputClass} placeholder="Supplier or maker" /></Field>
              <Field label="Image URL"><input type="url" name="image_url" value={form.image_url} onChange={updateField} className={inputClass} placeholder="/images/product.jpg" /></Field>
              <label className="flex items-center gap-3 rounded-xl border border-stone/15 bg-linen p-3 text-sm font-medium">
                <input type="checkbox" name="available_for_preorder" checked={form.available_for_preorder} onChange={updateField} className="h-4 w-4 accent-harvest" /> Available for click & collect
              </label>
              {error && <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
              {message && <p className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700"><Check className="h-4 w-4" /> {message}</p>}
              <div className="flex gap-3"><button type="submit" className="flex-1 rounded-full bg-harvest px-5 py-3 text-sm font-semibold text-linen transition-colors hover:bg-harvest-dark">{editingProduct ? 'Save changes' : 'Add product'}</button>{editingProduct && <button type="button" onClick={cancelEditing} className="rounded-full border border-stone/20 px-5 py-3 text-sm font-semibold text-forest hover:border-harvest">Cancel</button>}</div>
            </form>
          </section>

          <section className="rounded-3xl border border-stone/15 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-harvest">Current catalogue</p><h2 className="mt-2 font-heading text-2xl font-bold">Products in store</h2></div>
              <Link to="/click-and-collect" className="text-sm font-semibold text-harvest-dark hover:text-harvest">View shop</Link>
            </div>
            <div className="space-y-3">
              {products.map((product) => (
                <article key={product.id} className="flex items-center gap-3 rounded-2xl border border-stone/15 bg-linen p-3 sm:gap-4">
                  <img src={product.image_url || '/images/pantry.jpg'} alt="" className="h-16 w-16 rounded-xl object-cover" />
                  <div className="min-w-0 flex-1"><h3 className="truncate font-heading font-bold">{product.name}</h3><p className="text-sm text-stone">{product.category} · ${Number(product.price).toFixed(2)}</p></div>
                  <button type="button" onClick={() => startEditing(product)} className="rounded-full p-2 text-stone transition-colors hover:bg-harvest/10 hover:text-harvest-dark" aria-label={`Edit ${product.name}`}><Pencil className="h-4 w-4" /></button>
                  <button type="button" onClick={() => handleDelete(product)} className="rounded-full p-2 text-stone transition-colors hover:bg-red-50 hover:text-red-700" aria-label={`Remove ${product.name}`}><Trash2 className="h-4 w-4" /></button>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}