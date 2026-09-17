import initialProducts from '@/data/products.json';
import initialSuppliers from '@/data/suppliers.json';
import initialNewsEvents from '@/data/newsEvents.json';

const STORAGE_KEY_ORDERS = 'pegasus_orders';
const STORAGE_KEY_PRODUCTS = 'pegasus_products';

function getStoredOrders() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ORDERS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredOrders(orders) {
  try {
    localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(orders));
  } catch (err) {
    console.warn('Failed to persist orders to localStorage:', err);
  }
}

export const api = {
  products: {
    list: async (sort = '-created_date', limit = 50) => {
      let items = [...initialProducts];
      if (limit) items = items.slice(0, limit);
      return items;
    },
    filter: async (filters = {}, sort = '-created_date', limit = 50) => {
      let items = [...initialProducts];
      if (filters.available_for_preorder !== undefined) {
        items = items.filter((p) => p.available_for_preorder === filters.available_for_preorder);
      }
      if (filters.category) {
        items = items.filter((p) => p.category === filters.category);
      }
      if (limit) items = items.slice(0, limit);
      return items;
    },
  },

  suppliers: {
    list: async (sort = '-created_date', limit = 50) => {
      let items = [...initialSuppliers];
      if (limit) items = items.slice(0, limit);
      return items;
    },
  },

  newsEvents: {
    list: async (sort = '-date', limit = 20) => {
      let items = [...initialNewsEvents];
      if (limit) items = items.slice(0, limit);
      return items;
    },
  },

  orders: {
    submitClickCollectOrder: async (data) => {
      const { customer_name, phone, email, items, collection_date, notes, total } = data || {};
      if (!customer_name || !phone || !collection_date) {
        throw new Error('Missing required fields (name, phone, collection date).');
      }

      const orderNumber = `PGS-${Date.now().toString().slice(-6)}`;
      const order = {
        id: orderNumber,
        customer_name,
        phone,
        email: email || null,
        items: items || '',
        collection_date,
        notes: notes || null,
        total: Number(total) || 0,
        status: 'pending',
        created_at: new Date().toISOString(),
      };

      const existingOrders = getStoredOrders();
      existingOrders.unshift(order);
      saveStoredOrders(existingOrders);

      console.log('Order submitted successfully:', order);
      return { success: true, order };
    },
    list: async () => {
      return getStoredOrders();
    },
  },

  auth: {
    me: async () => {
      return {
        id: 'local_user',
        email: 'shopper@pegasusgeneralstore.co.nz',
        name: 'Local Shopper',
        role: 'user',
      };
    },
    loginViaEmailPassword: async () => {
      return { success: true };
    },
    logout: async () => {
      return { success: true };
    },
  },

  // Backward compatibility object for entity-style calls
  entities: {
    Product: {
      list: async (sort, limit) => api.products.list(sort, limit),
      filter: async (filters, sort, limit) => api.products.filter(filters, sort, limit),
    },
    Supplier: {
      list: async (sort, limit) => api.suppliers.list(sort, limit),
    },
    NewsEvent: {
      list: async (sort, limit) => api.newsEvents.list(sort, limit),
    },
    PreOrder: {
      create: async (data) => api.orders.submitClickCollectOrder(data),
      list: async () => api.orders.list(),
    },
  },

  // Backward compatibility object for function invocation
  functions: {
    invoke: async (functionName, payload) => {
      if (functionName === 'submitClickCollectOrder') {
        return api.orders.submitClickCollectOrder(payload);
      }
      throw new Error(`Function ${functionName} not found locally.`);
    },
  },
};

export default api;
