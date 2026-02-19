
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { 
  Part, Customer, Supplier, SalesOrder, PurchaseOrder, 
  OrderStatus, User, CompanySettings, Process, JobWorkOrder,
  GRN, SupplierInvoice, CustomerInvoice, StockAdjustment
} from '../types';
import { sql } from '../lib/db';

interface AppContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (name: string, email: string, pass: string) => Promise<void>;
  logout: () => void;
  settings: CompanySettings;
  updateSettings: (updates: Partial<CompanySettings>) => Promise<void>;
  parts: Part[];
  customers: Customer[];
  suppliers: Supplier[];
  salesOrders: SalesOrder[];
  purchaseOrders: PurchaseOrder[];
  jobWorkOrders: JobWorkOrder[];
  processes: Process[];
  grns: GRN[];
  supplierInvoices: SupplierInvoice[];
  customerInvoices: CustomerInvoice[];
  stockAdjustments: StockAdjustment[];
  addSalesOrder: (soData: Omit<SalesOrder, 'id'>) => Promise<void>;
  createPOFromSO: (soId: string) => Promise<void>;
  addPart: (part: Omit<Part, 'id' | 'sku'>) => Promise<void>;
  addCustomer: (customer: Customer) => Promise<void>;
  addSupplier: (supplier: Omit<Supplier, 'id' | 'code'>) => Promise<void>;
  approvePO: (poId: string) => Promise<void>;
  updatePart: (id: string, updates: Partial<Part>) => Promise<void>;
  addProcess: (process: Omit<Process, 'id'>) => Promise<void>;
  inwardJobWork: (id: string, invoiceNo: string) => Promise<void>;
  addJobWorkOrder: (jwo: Omit<JobWorkOrder, 'id' | 'currency' | 'linkedPoId'>) => Promise<void>;
  adjustStock: (partId: string, qty: number, reason: string) => Promise<void>;
  updateSalesOrder: (id: string, updates: Partial<SalesOrder>) => Promise<void>;
  deleteSalesOrder: (id: string) => Promise<void>;
  processGRN: (poId: string, invoiceNo: string, date: string, receivedItems: { partId: string, quantity: number }[]) => Promise<void>;
  processSupplierInvoice: (poId: string, invoiceNum: string) => Promise<void>;
  processCustomerInvoice: (soId: string, invoiceNum?: string, items?: { partId: string; quantity: number }[]) => Promise<void>;
  updateCustomer: (id: string, updates: Partial<Customer>) => Promise<void>;
  updateSupplier: (id: string, updates: Partial<Supplier>) => Promise<void>;
  addTooling: (tooling: any) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [settings, setSettings] = useState<any>(null);
  const [parts, setParts] = useState<Part[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [jobWorkOrders, setJobWorkOrders] = useState<JobWorkOrder[]>([]);
  const [processes, setProcesses] = useState<Process[]>([]);
  const [grns, setGrns] = useState<GRN[]>([]);
  const [supplierInvoices, setSupplierInvoices] = useState<SupplierInvoice[]>([]);
  const [customerInvoices, setCustomerInvoices] = useState<CustomerInvoice[]>([]);
  const [stockAdjustments, setStockAdjustments] = useState<StockAdjustment[]>([]);

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('gk_scm_auth');
  };

  const login = async (email: string, pass: string) => {
    try {
      const results = await sql`SELECT * FROM users WHERE email = ${email} AND password = ${pass} LIMIT 1`;
      if (results.length > 0) {
        const u = { id: results[0].id.toString(), name: results[0].name, email: results[0].email, role: results[0].role };
        setUser(u);
        setIsAuthenticated(true);
        localStorage.setItem('gk_scm_auth', JSON.stringify(u));
      } else {
        throw new Error("Invalid email or password.");
      }
    } catch (err: any) {
      if (err.message.includes('does not exist')) {
        throw new Error("Database tables not found. Please run the SQL migration script in your Neon Console.");
      }
      throw err;
    }
  };

  const signup = async (name: string, email: string, pass: string) => {
    try {
      await sql`INSERT INTO users (name, email, password, role) VALUES (${name}, ${email}, ${pass}, 'admin')`;
      await login(email, pass);
    } catch (err: any) {
      if (err.message.includes('does not exist')) {
        throw new Error("Database tables not found. Please run the SQL migration script in your Neon Console.");
      }
      throw err;
    }
  };

  const refreshData = async () => {
    if (!isAuthenticated) return;
    try {
      const [p, c, s, so, po, st, pr] = await Promise.all([
        sql`SELECT * FROM parts`,
        sql`SELECT * FROM customers`,
        sql`SELECT * FROM suppliers`,
        sql`SELECT * FROM sales_orders ORDER BY order_date DESC`,
        sql`SELECT * FROM purchase_orders ORDER BY order_date DESC`,
        sql`SELECT * FROM settings WHERE id = 1 LIMIT 1`,
        sql`SELECT * FROM processes`
      ]);

      setParts(p.map(x => ({ ...x, costPrice: Number(x.cost_price), sellingPrice: Number(x.selling_price), stock: Number(x.stock), requiredProcesses: JSON.parse(x.required_processes || '[]') })));
      setCustomers(c as any);
      setSuppliers(s as any);
      setSalesOrders(so.map(x => ({ ...x, totalAmount: Number(x.total_amount), items: JSON.parse(x.items || '[]') })));
      setPurchaseOrders(po.map(x => ({ ...x, totalAmount: Number(x.total_amount), items: JSON.parse(x.items || '[]') })));
      setSettings(st[0]);
      setProcesses(pr as any);
    } catch (e) {
      console.error("Data refresh failed:", e);
    }
  };

  useEffect(() => {
    const auth = localStorage.getItem('gk_scm_auth');
    if (auth) {
      setUser(JSON.parse(auth));
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) refreshData();
  }, [isAuthenticated]);

  const addSalesOrder = async (soData: Omit<SalesOrder, 'id'>) => {
    const id = `${settings.so_prefix}${settings.so_next_number}`;
    await sql`INSERT INTO sales_orders (id, customer_id, customer_po_number, order_date, status, items, total_amount, currency) 
              VALUES (${id}, ${soData.customerId}, ${soData.customerPONumber}, ${soData.orderDate}, ${soData.status}, ${JSON.stringify(soData.items)}, ${soData.totalAmount}, ${soData.currency})`;
    await sql`UPDATE settings SET so_next_number = so_next_number + 1 WHERE id = 1`;
    await refreshData();
  };

  const createPOFromSO = async (soId: string) => {
    const so = salesOrders.find(o => o.id === soId);
    if (!so) return;

    const supplierGroups: Record<string, any[]> = {};
    so.items.forEach(item => {
      const part = parts.find(p => p.id === (item.partId as any));
      if (!part) return;
      const sid = part.primarySupplierId;
      if (!supplierGroups[sid]) supplierGroups[sid] = [];
      supplierGroups[sid].push({ partId: part.id, quantity: item.quantity, unitPrice: part.costPrice });
    });

    let currentPO = settings.po_next_number;
    for (const [supplierId, items] of Object.entries(supplierGroups)) {
      const poId = `${settings.po_prefix}${currentPO}`;
      const total = items.reduce((a, b) => a + (b.quantity * b.unitPrice), 0);
      
      await sql`INSERT INTO purchase_orders (id, supplier_id, sales_order_id, order_date, status, items, total_amount, currency)
                VALUES (${poId}, ${supplierId}, ${soId}, ${new Date().toISOString().split('T')[0]}, ${OrderStatus.PO_RELEASED}, ${JSON.stringify(items)}, ${total}, ${settings.base_currency})`;
      currentPO++;
    }

    await sql`UPDATE settings SET po_next_number = ${currentPO} WHERE id = 1`;
    await sql`UPDATE sales_orders SET status = ${OrderStatus.PO_RELEASED} WHERE id = ${soId}`;
    await refreshData();
  };

  const addPart = async (p: any) => {
    const sku = `GKP-${Math.floor(Math.random() * 10000)}`;
    await sql`INSERT INTO parts (sku, drawing_number, name, revision, description, customer_id, primary_supplier_id, cost_price, selling_price, stock, is_active, is_job_work, required_processes)
              VALUES (${sku}, ${p.drawingNumber}, ${p.name}, ${p.revision}, ${p.description}, ${p.customerId}, ${p.primarySupplierId}, ${p.costPrice}, ${p.sellingPrice}, ${p.stock}, true, ${p.isJobWork}, ${JSON.stringify(p.requiredProcesses)})`;
    await refreshData();
  };

  const addCustomer = async (c: any) => {
    const id = `C-${Math.floor(Math.random() * 1000)}`;
    await sql`INSERT INTO customers (id, name, email, billing_address, shipping_address, delivery_address, country, currency, credit_period, is_active)
              VALUES (${id}, ${c.name}, ${c.email}, ${c.billingAddress}, ${c.shippingAddress}, ${c.deliveryAddress}, ${c.country}, ${c.currency}, ${c.creditPeriod}, true)`;
    await refreshData();
  };

  const addSupplier = async (s: any) => {
    const id = `S-${Math.floor(Math.random() * 1000)}`;
    await sql`INSERT INTO suppliers (id, code, name, email, address, credit_period, is_active)
              VALUES (${id}, ${id}, ${s.name}, ${s.email}, ${s.address}, ${s.creditPeriod}, true)`;
    await refreshData();
  };

  const approvePO = async (id: string) => {
    await sql`UPDATE purchase_orders SET status = ${OrderStatus.PO_RELEASED} WHERE id = ${id}`;
    await refreshData();
  };

  const updateSettings = async (u: any) => { await sql`UPDATE settings SET name=${u.name}, address=${u.address} WHERE id=1`; setSettings({...settings, ...u}); };
  const updateSalesOrder = async () => {};
  const deleteSalesOrder = async (id: string) => { await sql`DELETE FROM sales_orders WHERE id=${id}`; await refreshData(); };
  const updatePart = async (id: string, u: any) => { await sql`UPDATE parts SET stock=${u.stock} WHERE id=${id}`; await refreshData(); };
  const addProcess = async (p: any) => { await sql`INSERT INTO processes (name, description) VALUES (${p.name}, ${p.description})`; await refreshData(); };
  const inwardJobWork = async () => {};
  const addJobWorkOrder = async () => {};
  const adjustStock = async () => {};
  const processGRN = async () => {};
  const processSupplierInvoice = async () => {};
  const processCustomerInvoice = async () => {};
  const updateCustomer = async () => {};
  const updateSupplier = async () => {};
  const addTooling = async () => {};

  return (
    <AppContext.Provider value={{
      user, isAuthenticated, login, signup, logout, settings, updateSettings,
      parts, customers, suppliers, salesOrders, purchaseOrders, jobWorkOrders, processes, grns,
      supplierInvoices, customerInvoices, stockAdjustments,
      addSalesOrder, createPOFromSO, addPart, addCustomer, addSupplier, updateSalesOrder, 
      deleteSalesOrder, approvePO, updatePart, addProcess, inwardJobWork, addJobWorkOrder, 
      adjustStock, processGRN, processSupplierInvoice, processCustomerInvoice, updateCustomer, 
      updateSupplier, addTooling
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
