import { useState, useEffect, useCallback } from 'react';
import {
  Package,
  Plus,
  Pencil,
  Trash2,
  LogOut,
  Search,
  CircleCheck,
  CircleAlert,
  CircleX,
  Info,
  Coins,
  TrendingUp,
  Layers,
  LogIn,
  X,
  PackageOpen
} from 'lucide-react';
import api from './api';
import './index.css';

/* ── Toast ──────────────────────────────────────── */
function Toast({ toasts }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`}>
          {t.type === 'success' && <CircleCheck size={18} />}
          {t.type === 'error' && <CircleX size={18} />}
          {t.type === 'info' && <Info size={18} />}
          <span>{t.msg}</span>
        </div>
      ))}
    </div>
  );
}

function useToast() {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((msg, type = 'info') => {
    const id = Date.now();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3000);
  }, []);
  return { toasts, push };
}

/* ── Confirm Dialog ─────────────────────────────── */
function ConfirmDialog({ title, text, onConfirm, onCancel, loading }) {
  return (
    <div className="modal-overlay confirm-dialog" onClick={e => e.target === e.currentTarget && onCancel()}>
      <div className="modal">
        <div className="confirm-icon">
          <Trash2 size={24} />
        </div>
        <div className="confirm-title">{title}</div>
        <div className="confirm-text">{text}</div>
        <div className="confirm-actions">
          <button className="btn btn-ghost" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? <span className="spinner" /> : (
              <>
                <Trash2 size={16} />
                <span>Delete</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Product Modal ──────────────────────────────── */
function ProductModal({ product, onClose, onSaved, push }) {
  const isEdit = !!product?.id;
  const [form, setForm] = useState({
    product_name: product?.product_name || '',
    description: product?.description || '',
    price: product?.price || '',
    quantity: product?.quantity || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.product_name.trim()) {
      setError('Product name is required.');
      return;
    }
    setLoading(true);
    try {
      if (isEdit) {
        await api.put(`/products/update/${product.id}`, form);
        push('Product updated successfully!', 'success');
      } else {
        await api.post('/products/store', form);
        push('Product added successfully!', 'success');
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">
            {isEdit ? <Pencil size={20} className="text-primary" /> : <Plus size={20} className="text-primary" />}
            <span>{isEdit ? 'Edit Product' : 'Add Product'}</span>
          </h2>
          <button className="btn-icon" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="alert alert-error">
            <CircleAlert size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Product Name *</label>
            <input
              id="field-product-name"
              className="form-input"
              value={form.product_name}
              onChange={set('product_name')}
              placeholder="e.g. Wireless Noise-Cancelling Headphones"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <input
              id="field-description"
              className="form-input"
              value={form.description}
              onChange={set('description')}
              placeholder="Brief description of product features"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Price (PHP)</label>
            <input
              id="field-price"
              className="form-input"
              type="number"
              step="0.01"
              min="0"
              value={form.price}
              onChange={set('price')}
              placeholder="0.00"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Quantity</label>
            <input
              id="field-quantity"
              className="form-input"
              type="number"
              min="0"
              value={form.quantity}
              onChange={set('quantity')}
              placeholder="0"
            />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button id="btn-save-product" type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : (
                <>
                  {isEdit ? <Pencil size={16} /> : <Plus size={16} />}
                  <span>{isEdit ? 'Save Changes' : 'Add Product'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Login Page ─────────────────────────────────── */
function LoginPage({ onLogin, push }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      localStorage.setItem('access_token', data.data.access_token);
      localStorage.setItem('refresh_token', data.data.refresh_token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      push('Welcome back!', 'success');
      onLogin(data.data.user);
    } catch (err) {
      if (!err.response) {
        setError('Cannot connect to backend API. Please verify the server is live.');
      } else if (err.response.status === 404 || err.response.status === 405) {
        setError(`API error (${err.response.status}): VITE_API_URL is not reaching the backend.`);
      } else {
        setError(err.response?.data?.message || 'Invalid email or password.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-icon">
            <Package size={22} />
          </div>
          <h1>ProductManager</h1>
        </div>
        <p className="login-sub">Sign in to manage your inventory catalog</p>

        {error && (
          <div className="alert alert-error">
            <CircleAlert size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              id="login-email"
              className="form-input"
              type="email"
              value={form.email}
              onChange={set('email')}
              placeholder="admin@lab6.com"
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              id="login-password"
              className="form-input"
              type="password"
              value={form.password}
              onChange={set('password')}
              placeholder="••••••••"
              required
            />
          </div>
          <button id="btn-login" type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ marginTop: 8 }}>
            {loading ? <span className="spinner" /> : (
              <>
                <LogIn size={18} />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>

        <div className="default-credentials">
          Default: <code>admin@lab6.com</code> / <code>Admin@123</code>
        </div>
      </div>
    </div>
  );
}

/* ── Dashboard Page ─────────────────────────────── */
function DashboardPage({ user, onLogout, push }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null); // null | 'add' | product object
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/products');
      setProducts(data.data || []);
    } catch {
      push('Failed to load products.', 'error');
    } finally {
      setLoading(false);
    }
  }, [push]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      /* ignore */
    }
    localStorage.clear();
    push('Logged out successfully.', 'info');
    onLogout();
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/products/destroy/${deleteTarget.id}`);
      push('Product deleted.', 'success');
      setDeleteTarget(null);
      fetchProducts();
    } catch {
      push('Delete failed.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const filtered = products.filter(p =>
    p.product_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.toLowerCase())
  );

  const totalValue = products.reduce((s, p) => s + parseFloat(p.price || 0) * parseInt(p.quantity || 0), 0);
  const avgPrice = products.length ? products.reduce((s, p) => s + parseFloat(p.price || 0), 0) / products.length : 0;

  return (
    <>
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-brand">
          <div className="navbar-brand-icon">
            <Package size={20} />
          </div>
          <span>ProductManager</span>
        </div>
        <div className="navbar-right">
          <div className="navbar-user">
            <div className="avatar">{user?.username?.[0]?.toUpperCase()}</div>
            <span style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text-main)' }}>{user?.username}</span>
          </div>
          <button id="btn-logout" className="btn btn-ghost" onClick={handleLogout} style={{ fontSize: 13, padding: '7px 14px' }}>
            <LogOut size={15} />
            <span>Logout</span>
          </button>
        </div>
      </nav>

      <div className="main-layout">
        {/* Page Header */}
        <div className="page-header">
          <div>
            <h2 className="page-title">Products</h2>
            <p className="page-subtitle">Manage inventory and catalog items</p>
          </div>
          <button id="btn-add-product" className="btn btn-primary" onClick={() => setModal('add')}>
            <Plus size={18} />
            <span>Add Product</span>
          </button>
        </div>

        {/* Stats */}
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-icon pastel-mint">
              <Package size={22} />
            </div>
            <div>
              <div className="stat-value">{products.length}</div>
              <div className="stat-label">Total Products</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon pastel-sage">
              <Coins size={22} />
            </div>
            <div>
              <div className="stat-value">₱{totalValue.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</div>
              <div className="stat-label">Total Value</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon pastel-olive">
              <TrendingUp size={22} />
            </div>
            <div>
              <div className="stat-value">₱{avgPrice.toFixed(2)}</div>
              <div className="stat-label">Avg. Price</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon pastel-teal">
              <Layers size={22} />
            </div>
            <div>
              <div className="stat-value">{filtered.length}</div>
              <div className="stat-label">Showing</div>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="toolbar">
          <div className="search-wrap">
            <span className="search-icon-inside">
              <Search size={16} />
            </span>
            <input
              id="search-products"
              className="search-input"
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="table-wrap">
          {loading ? (
            <div className="empty-state">
              <div className="spinner spinner-dark" style={{ width: 36, height: 36, borderWidth: 3 }} />
              <p style={{ marginTop: 16 }}>Loading products...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                {search ? <Search size={28} /> : <PackageOpen size={28} />}
              </div>
              <h3>{search ? 'No results found' : 'No products yet'}</h3>
              <p>{search ? 'Try searching with a different keyword.' : 'Add your first product to get started.'}</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: 48 }}>#</th>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Qty</th>
                  <th>Added</th>
                  <th style={{ width: 100 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => (
                  <tr key={p.id}>
                    <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{i + 1}</td>
                    <td>
                      <div className="product-name">{p.product_name}</div>
                      <div className="product-desc">{p.description || '—'}</div>
                    </td>
                    <td>
                      <span className="price-badge">
                        ₱{parseFloat(p.price).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td>
                      <span className="qty-badge">{p.quantity}</span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                      {p.created_at ? new Date(p.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                    </td>
                    <td>
                      <div className="actions">
                        <button
                          id={`btn-edit-${p.id}`}
                          className="btn-icon"
                          title="Edit"
                          onClick={() => setModal(p)}
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          id={`btn-delete-${p.id}`}
                          className="btn-icon delete-btn"
                          title="Delete"
                          onClick={() => setDeleteTarget(p)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {modal && (
        <ProductModal
          product={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={fetchProducts}
          push={push}
        />
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <ConfirmDialog
          title="Delete Product"
          text={`Are you sure you want to delete "${deleteTarget.product_name}"? This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </>
  );
}

/* ── App Root ────────────────────────────────────── */
export default function App() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  });
  const { toasts, push } = useToast();

  return (
    <>
      {user
        ? <DashboardPage user={user} onLogout={() => setUser(null)} push={push} />
        : <LoginPage onLogin={setUser} push={push} />
      }
      <Toast toasts={toasts} />
    </>
  );
}
