import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Minus, Plus, ShoppingBag, Store } from 'lucide-react';
import { Link } from 'react-router-dom';
import { productsApi, ordersApi, formatPickupReference } from '@/api/client';

const emptyForm = {
  customer_name: '',
  phone: '',
  email: '',
  collection_date: '',
  collection_time: '',
  notes: '',
};

const COLLECTION_TIMES = [
  '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM',
  '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM',
  '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM',
  '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM',
];

export default function ClickCollect() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({});
  const [form, setForm] = useState(emptyForm);
  const [submitted, setSubmitted] = useState(null);
  const [error, setError] = useState('');
  const [emailWarning, setEmailWarning] = useState('');

  useEffect(() => {
    productsApi.list('-created_at', 100)
      .then((data) => setProducts(Array.isArray(data) ? data.filter(p => p.available_for_preorder) : []))
      .catch(() => setProducts([]));
  }, []);

  const cartItems = useMemo(
    () =>
      Object.entries(cart)
        .filter(([, qty]) => qty > 0)
        .map(([productId, qty]) => {
          const product = products.find((item) => item.id === productId);
          return product ? { ...product, qty } : null;
        })
        .filter(Boolean),
    [cart, products],
  );

  const subtotal = cartItems.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.qty || 0), 0);

  const updateQuantity = (productId, delta) => {
    setCart((current) => {
      const next = { ...current, [productId]: Math.max(0, (current[productId] || 0) + delta) };
      if (next[productId] === 0) delete next[productId];
      return next;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.customer_name || !form.phone || !form.email || !form.collection_date || !form.collection_time || cartItems.length === 0) {
      setError('Please add at least one item and complete your name, phone, email, collection date and time.');
      return;
    }

    try {
      // Capture the pickup slot before the form is cleared below.
      const pickup = { collection_date: form.collection_date, collection_time: form.collection_time };
      const itemsText = cartItems.map((item) => `${item.name} x${item.qty}`).join(', ');
      const response = await ordersApi.submitClickCollectOrder({
        ...form,
        items: itemsText,
        total: subtotal,
      });

      // The full Supabase id stays on the order object (background / Admin
      // use) but is never rendered to the customer — see the display below.
      const placedOrder = { ...response?.order, ...pickup };
      setSubmitted(placedOrder);
      setError('');
      setEmailWarning('');
      setCart({});
      setForm(emptyForm);

      // Email the confirmation to the customer and a notification to the
      // store via the Pages Function in functions/api/order-email.js.
      // A failed email must never undo a placed order, so this runs
      // after the confirmation is shown and its failure only warns.
      try {
        const emailResponse = await fetch('/api/order-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'order-placed',
            order: { ...placedOrder, items: itemsText, total: subtotal },
          }),
        });
        if (!emailResponse.ok) throw new Error('Order email failed.');
      } catch {
        setEmailWarning('Your order is placed, but we could not email your confirmation — please save your reference above.');
      }
    } catch (submitError) {
      setError(submitError?.message || 'Your order could not be submitted right now.');
    }
  };

  const inputClass = 'w-full rounded-xl border border-stone/20 bg-linen px-3 py-2.5 text-forest outline-none focus:border-harvest';

  return (
    <div className="min-h-screen bg-linen text-forest">
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:py-10">
        <div className="mb-8 flex items-center justify-between gap-3">
          <Link to="/" className="inline-flex items-center gap-2 rounded-full border border-stone/20 bg-white px-4 py-2 text-sm font-medium text-forest hover:border-harvest">
            <ArrowLeft className="h-4 w-4" /> Back to home
          </Link>
          <div className="rounded-full bg-harvest/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-harvest-dark">
            Click &amp; Collect
          </div>
        </div>

        {/* Pay at counter notice */}
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-harvest/30 bg-harvest/5 px-5 py-4">
          <Store className="h-5 w-5 shrink-0 text-harvest-dark" />
          <p className="text-sm text-forest">
            <span className="font-semibold">Pay at counter</span> — Place your order online and pay when you collect in store. No online payment required.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.5fr_0.9fr]">
          {/* Product list */}
          <section className="rounded-3xl border border-stone/15 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-harvest">Shop the pantry</p>
              <h1 className="mt-3 font-heading text-3xl font-extrabold sm:text-4xl">Pre-order your favourites</h1>
            </div>

            <div className="grid gap-4">
              {products.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-stone/25 bg-linen p-8 text-center text-stone">
                  Loading products…
                </div>
              ) : (
                products.map((product) => {
                  const quantity = cart[product.id] || 0;
                  return (
                    <article key={product.id} className="flex flex-col gap-4 rounded-2xl border border-stone/15 bg-linen p-4 sm:flex-row sm:items-center">
                      <div className="h-24 w-full overflow-hidden rounded-2xl bg-forest/5 sm:w-28">
                        <img src={product.image_url || '/images/pantry.jpg'} alt={product.name} className="h-full w-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h2 className="font-heading text-xl font-bold text-forest">{product.name}</h2>
                            <p className="mt-1 text-sm text-stone">{product.description}</p>
                          </div>
                          <div className="text-base font-semibold text-harvest-dark">${Number(product.price || 0).toFixed(2)}</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-3 sm:justify-end">
                        <div className="flex items-center rounded-full border border-stone/20 bg-white px-2 py-1">
                          <button type="button" onClick={() => updateQuantity(product.id, -1)} className="rounded-full p-2 text-forest hover:bg-stone/5" aria-label={`Decrease ${product.name}`}>
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="min-w-8 text-center text-sm font-semibold">{quantity}</span>
                          <button type="button" onClick={() => updateQuantity(product.id, 1)} className="rounded-full p-2 text-forest hover:bg-stone/5" aria-label={`Increase ${product.name}`}>
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </section>

          {/* Order form */}
          <aside className="rounded-3xl border border-stone/15 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-harvest/10 p-2 text-harvest-dark">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <h2 className="font-heading text-2xl font-bold text-forest">Your order</h2>
            </div>

            <div className="mt-6 space-y-3">
              {cartItems.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-stone/25 bg-linen p-4 text-sm text-stone">No items selected yet.</p>
              ) : (
                cartItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-3 rounded-2xl border border-stone/15 bg-linen p-3">
                    <div>
                      <div className="font-medium text-forest">{item.name}</div>
                      <div className="text-xs text-stone">Qty {item.qty}</div>
                    </div>
                    <div className="font-semibold text-harvest-dark">${(Number(item.price || 0) * Number(item.qty || 0)).toFixed(2)}</div>
                  </div>
                ))
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="mt-4 border-t border-stone/15 pt-4 text-sm">
                <div className="flex items-center justify-between font-semibold text-forest">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <p className="mt-1 text-xs text-stone">Pay at counter on collection.</p>
              </div>
            )}

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="mb-1 block text-sm font-medium text-forest">Name *</label>
                <input value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} className={inputClass} placeholder="Your name" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-forest">Phone *</label>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass} placeholder="021 123 4567" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-forest">Email *</label>
                <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} placeholder="you@example.com" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-forest">Collection date *</label>
                  <input type="date" value={form.collection_date} min={new Date().toISOString().split('T')[0]} onChange={(e) => setForm({ ...form, collection_date: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-forest">Collection time *</label>
                  <select value={form.collection_time} onChange={(e) => setForm({ ...form, collection_time: e.target.value })} className={inputClass}>
                    <option value="">Select time</option>
                    {COLLECTION_TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-forest">Notes</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows="2" className={inputClass} placeholder="Anything else we should know?" />
              </div>

              {error && <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

              {submitted && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  <p className="font-semibold">Order placed! ✓</p>
                  <p className="mt-1">Reference: {formatPickupReference(submitted)}</p>
                  <p className="mt-1 text-xs">Please bring this reference when collecting. Payment at counter. A confirmation email is on its way.</p>
                </div>
              )}
              {emailWarning && <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">{emailWarning}</p>}

              <button type="submit" className="w-full rounded-full bg-harvest px-5 py-3 text-sm font-semibold text-linen transition-colors hover:bg-harvest-dark">
                Place order — Pay at counter
              </button>
            </form>
          </aside>
        </div>
      </div>
    </div>
  );
}
