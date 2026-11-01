import { useEffect, useState } from 'react';
import { ArrowLeft, Check, Key, LogOut, PackageSearch, UserRound } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi, supabase } from '@/api/client';

const inputClass = 'w-full rounded-xl border border-stone/20 bg-linen px-3 py-2.5 text-forest outline-none transition-colors placeholder:text-stone/60 focus:border-harvest focus:ring-2 focus:ring-harvest/10';

function fmtDate(d) {
  if (!d) return '';
  try { return new Date(d).toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric' }); }
  catch { return d; }
}

const STATUS_COLORS = {
  pending:   'bg-amber-50 text-amber-700 border-amber-200',
  confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
  ready:     'bg-emerald-50 text-emerald-700 border-emerald-200',
  collected: 'bg-stone/10 text-stone border-stone/20',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
};

export default function Account() {
  const navigate = useNavigate();
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]         = useState('orders');

  // Orders
  const [orders, setOrders]   = useState([]);

  // Password change
  const [pwForm, setPwForm]   = useState({ next: '', confirm: '' });
  const [pwMsg, setPwMsg]     = useState('');
  const [pwErr, setPwErr]     = useState('');

  useEffect(() => {
    authApi.customerSession().then((u) => {
      if (!u) { navigate('/login'); return; }
      setUser(u);
      setLoading(false);
    });
  }, [navigate]);

  // Load customer orders by email
  useEffect(() => {
    if (!user?.email) return;
    supabase
      .from('orders')
      .select('*')
      .eq('email', user.email)
      .order('created_at', { ascending: false })
      .then(({ data }) => setOrders(data ?? []));
  }, [user]);

  const handleLogout = async () => {
    await authApi.customerLogout();
    navigate('/');
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwErr(''); setPwMsg('');
    if (pwForm.next !== pwForm.confirm) { setPwErr('Passwords do not match.'); return; }
    if (pwForm.next.length < 8) { setPwErr('Password must be at least 8 characters.'); return; }
    const { error } = await supabase.auth.updateUser({ password: pwForm.next });
    if (error) { setPwErr(error.message); return; }
    setPwMsg('Password updated successfully!');
    setPwForm({ next: '', confirm: '' });
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-linen text-forest">
      <div className="mx-auto max-w-4xl px-5 py-8 sm:px-8 lg:py-10">

        {/* Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <Link to="/" className="inline-flex items-center gap-2 rounded-full border border-stone/20 bg-white px-4 py-2 text-sm font-medium text-forest hover:border-harvest">
            <ArrowLeft className="h-4 w-4" /> Back to store
          </Link>
          <button onClick={handleLogout} className="inline-flex items-center gap-2 rounded-full border border-stone/20 px-4 py-2 text-sm font-semibold text-forest hover:border-harvest">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>

        {/* Welcome */}
        <div className="mb-8 flex items-center gap-4">
          <div className="rounded-full bg-harvest/10 p-4 text-harvest-dark"><UserRound className="h-8 w-8" /></div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-harvest">My account</p>
            <h1 className="mt-1 font-heading text-3xl font-extrabold">
              {user?.user_metadata?.name || user?.email?.split('@')[0]}
            </h1>
            <p className="text-sm text-stone">{user?.email}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 rounded-2xl bg-white p-1.5 border border-stone/15 w-fit">
          {[
            { key: 'orders',   label: `My Orders (${orders.length})`, icon: PackageSearch },
            { key: 'password', label: 'Change Password',              icon: Key },
          ].map(({ key, label, icon: Icon }) => (
            <button key={key} type="button" onClick={() => setTab(key)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${tab === key ? 'bg-harvest text-linen' : 'text-stone hover:text-forest'}`}>
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </div>

        {/* ── Orders tab ──────────────────────────────────────── */}
        {tab === 'orders' && (
          <section className="rounded-3xl border border-stone/15 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="mb-6 font-heading text-xl font-bold">Your click &amp; collect orders</h2>
            {orders.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-stone/25 bg-linen p-10 text-center text-stone">
                <PackageSearch className="mx-auto mb-3 h-10 w-10 text-stone/40" />
                <p className="font-medium">No orders yet.</p>
                <Link to="/click-and-collect" className="mt-3 inline-block text-sm font-semibold text-harvest-dark hover:text-harvest">Browse &amp; order →</Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((o) => (
                  <div key={o.id} className="rounded-2xl border border-stone/15 bg-linen p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-mono text-xs text-stone">Ref: {String(o.id).slice(0, 8)}…</p>
                        <p className="mt-1 font-heading font-bold text-forest">{o.items}</p>
                      </div>
                      <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${STATUS_COLORS[o.status] || STATUS_COLORS.pending}`}>
                        {o.status}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-stone">
                      <span>Collect: <strong className="text-forest">{fmtDate(o.collection_date)}{o.collection_time ? ` at ${o.collection_time}` : ''}</strong></span>
                      <span>Total: <strong className="text-forest">${Number(o.total || 0).toFixed(2)} (pay at counter)</strong></span>
                    </div>
                    {o.notes && <p className="mt-2 text-xs text-stone">Note: {o.notes}</p>}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ── Password tab ────────────────────────────────────── */}
        {tab === 'password' && (
          <section className="max-w-md rounded-3xl border border-stone/15 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-full bg-harvest/10 p-2 text-harvest-dark"><Key className="h-5 w-5" /></div>
              <div>
                <h2 className="font-heading text-xl font-bold">Change Password</h2>
                <p className="text-sm text-stone">Update your account password.</p>
              </div>
            </div>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-forest">New password</span>
                <input required type="password" value={pwForm.next} onChange={(e) => setPwForm({ ...pwForm, next: e.target.value })} className={inputClass} placeholder="At least 8 characters" />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-forest">Confirm new password</span>
                <input required type="password" value={pwForm.confirm} onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })} className={inputClass} placeholder="Repeat new password" />
              </label>
              {pwErr && <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{pwErr}</p>}
              {pwMsg && <p className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700"><Check className="h-4 w-4" /> {pwMsg}</p>}
              <button type="submit" className="w-full rounded-full bg-harvest px-5 py-3 text-sm font-semibold text-linen hover:bg-harvest-dark">
                Update password
              </button>
            </form>
          </section>
        )}

      </div>
    </div>
  );
}

