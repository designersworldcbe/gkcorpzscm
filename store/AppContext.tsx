
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { 
  Part, Customer, Supplier, SalesOrder, PurchaseOrder, 
  GRN, SupplierInvoice, CustomerInvoice, OrderStatus,
  Tooling, JobWorkOrder, Process, StockAdjustment, User, CompanySettings
} from '../types';
import { sql } from '../lib/db';

interface AppContextType {
  user: User | null;
  setUser: (u: User | null) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (b: boolean) => void;
  logout: () => void;
  settings: CompanySettings;
  updateSettings: (updates: Partial<CompanySettings>) => Promise<void>;
  parts: Part[];
  customers: Customer[];
  suppliers: Supplier[];
  salesOrders: SalesOrder[];
  purchaseOrders: PurchaseOrder[];
  toolings: Tooling[];
  jobWorkOrders: JobWorkOrder[];
  processes: Process[];
  grns: GRN[];
  supplierInvoices: SupplierInvoice[];
  customerInvoices: CustomerInvoice[];
  stockAdjustments: StockAdjustment[];
  addSalesOrder: (soData: Omit<SalesOrder, 'id'>) => Promise<void>;
  updateSalesOrder: (id: string, updates: Partial<SalesOrder>) => Promise<void>;
  deleteSalesOrder: (id: string) => Promise<void>;
  createPOFromSO: (soId: string) => Promise<void>;
  approvePO: (poId: string) => Promise<void>;
  processGRN: (poId: string, invoiceNo: string, date: string, receivedItems: { partId: string, quantity: number }[]) => Promise<void>;
  processSupplierInvoice: (poId: string, invoiceNum: string) => Promise<void>;
  processCustomerInvoice: (soId: string, invoiceNum?: string, items?: { partId: string; quantity: number }[]) => Promise<void>;
  addPart: (part: Omit<Part, 'id' | 'sku'>) => Promise<void>;
  updatePart: (id: string, updates: Partial<Part>) => Promise<void>;
  addCustomer: (customer: Customer) => Promise<void>;
  updateCustomer: (id: string, updates: Partial<Customer>) => Promise<void>;
  addSupplier: (supplier: Omit<Supplier, 'id' | 'code'>) => Promise<void>;
  updateSupplier: (id: string, updates: Partial<Supplier>) => Promise<void>;
  addTooling: (tooling: Omit<Tooling, 'id'>) => Promise<void>;
  addJobWorkOrder: (jwo: Omit<JobWorkOrder, 'id' | 'currency' | 'linkedPoId'>) => Promise<void>;
  inwardJobWork: (id: string, invoiceNo: string) => Promise<void>;
  addProcess: (process: Omit<Process, 'id'>) => Promise<void>;
  adjustStock: (partId: string, qty: number, reason: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const INITIAL_SETTINGS: CompanySettings = {
  name: 'GK Global SCM',
  address: 'Industrial District, Block 4, Mumbai, India',
  taxIdentifier: 'GST-IN-9988776655',
  baseCurrency: 'INR',
  country: 'India',
  soPrefix: 'SO-GK-',
  poPrefix: 'PO-GK-',
  invPrefix: 'INV-GK-',
  soNextNumber: 1001,
  poNextNumber: 1001,
  invNextNumber: 1001,
  includeCustomerInPO: false
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [settings, setSettings] = useState<CompanySettings>(INITIAL_SETTINGS);

  const [parts, setParts] = useState<Part[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [toolings, setToolings] = useState<Tooling[]>([]);
  const [processes, setProcesses] = useState<Process[]>([]);
  const [jobWorkOrders, setJobWorkOrders] = useState<JobWorkOrder[]>([]);
  const [grns, setGrns] = useState<GRN[]>([]);
  const [supplierInvoices, setSupplierInvoices] = useState<SupplierInvoice[]>([]);
  const [customerInvoices, setCustomerInvoices] = useState<CustomerInvoice[]>([]);
  const [stockAdjustments, setStockAdjustments] = useState<StockAdjustment[]>([]);

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('gk_scm_auth');
  };

  useEffect(() => {
    const fetchAllData = async () => {
      if (!sql) return;
      try {
        const authData = localStorage.getItem('gk_scm_auth');
        if (authData) {
          const storedUser = JSON.parse(authData);
          setUser(storedUser);
          setIsAuthenticated(true);

          const [pRaw, cRaw, sRaw, soRaw, poRaw, jwoRaw, prcRaw, settingsRaw] = await Promise.all([
            sql`SELECT * FROM parts ORDER BY name ASC`,
            sql`SELECT * FROM customers ORDER BY name ASC`,
            sql`SELECT * FROM suppliers ORDER BY name ASC`,
            sql`SELECT * FROM sales_orders ORDER BY order_date DESC`,
            sql`SELECT * FROM purchase_orders ORDER BY id DESC`,
            sql`SELECT * FROM job_work_orders ORDER BY order_date DESC`,
            sql`SELECT * FROM processes ORDER BY name ASC`,
            sql`SELECT * FROM settings WHERE id = 1`
          ]);

          setParts(pRaw.map(p => ({
            id: p.id, sku: p.sku, drawingNumber: p.drawing_number, name: p.name, revision: p.revision,
            description: p.description, customerId: p.customer_id, primarySupplierId: p.primary_supplier_id,
            costPrice: Number(p.cost_price), sellingPrice: Number(p.selling_price), stock: Number(p.stock),
            requiredProcesses: Array.isArray(p.required_processes) ? p.required_processes : (p.required_processes ? JSON.parse(p.required_processes) : []),
            isActive: p.is_active, isJobWork: p.is_job_work
          })));

          setCustomers(cRaw.map(c => ({
            id: c.id, name: c.name, email: c.email, billingAddress: c.billing_address, shippingAddress: c.shipping_address,
            deliveryAddress: c.delivery_address, country: c.country, currency: c.currency, creditPeriod: c.credit_period,
            advanceBalance: Number(c.advance_balance), isActive: c.is_active, contactPerson: c.contact_person, 
            phoneNumber: c.phone_number, taxIdentifier: c.tax_identifier
          })));

          setSuppliers(sRaw.map(s => ({
            id: s.id, code: s.code, name: s.name, email: s.email, address: s.address, creditPeriod: s.credit_period,
            isActive: s.is_active, contactPerson: s.contact_person, phoneNumber: s.phone_number,
            taxIdentifier: s.tax_identifier, processPricing: Array.isArray(s.process_pricing) ? s.process_pricing : (s.process_pricing ? JSON.parse(s.process_pricing) : [])
          })));

          setSalesOrders(soRaw.map(so => ({
            id: so.id, customerId: so.customer_id, customerPONumber: so.customer_po_number, orderDate: so.order_date,
            status: so.status as OrderStatus, items: Array.isArray(so.items) ? so.items : JSON.parse(so.items), 
            totalAmount: Number(so.total_amount), currency: so.currency
          })));

          setPurchaseOrders(poRaw.map(po => ({
            id: po.id, supplierId: po.supplier_id, salesOrderId: po.sales_order_id, orderDate: po.order_date,
            status: po.status as OrderStatus, items: Array.isArray(po.items) ? po.items : JSON.parse(po.items), 
            totalAmount: Number(po.total_amount), currency: po.currency
          })));

          setProcesses(prcRaw.map(pr => ({ id: pr.id, name: pr.name, description: pr.description })));

          setJobWorkOrders(jwoRaw.map(j => ({
            id: j.id, supplierId: j.supplier_id, partId: j.part_id, processId: j.process_id, salesOrderId: j.sales_order_id,
            processIndex: j.process_index, quantity: Number(j.quantity), unitPrice: Number(j.unit_price), 
            totalPrice: Number(j.total_price), currency: j.currency, orderDate: j.order_date, 
            expectedDate: j.expected_date, status: j.status, challanNumber: j.challan_number, linkedPoId: j.linked_po_id
          })));

          if (settingsRaw.length > 0) {
            const s = settingsRaw[0];
            setSettings({
              name: s.name, address: s.address, taxIdentifier: s.tax_identifier, baseCurrency: s.base_currency,
              country: s.country, soPrefix: s.so_prefix, poPrefix: s.po_prefix, invPrefix: s.inv_prefix,
              soNextNumber: s.so_next_number, poNextNumber: s.po_next_number, invNextNumber: s.inv_next_number,
              includeCustomerInPO: s.include_customer_in_po
            });
          }
        }
      } catch (err) {
        console.error("Neon Data Sync Error:", err);
      }
    };
    fetchAllData();
  }, [isAuthenticated]);

  const addPart = async (p: Omit<Part, 'id' | 'sku'>) => {
    if (!sql) return;
    const sku = `GKP-${Date.now().toString().slice(-6)}`;
    const [result] = await sql`
      INSERT INTO parts (sku, drawing_number, name, revision, description, customer_id, primary_supplier_id, cost_price, selling_price, stock, is_active, is_job_work, required_processes)
      VALUES (${sku}, ${p.drawingNumber}, ${p.name}, ${p.revision}, ${p.description}, ${p.customerId}, ${p.primarySupplierId}, ${p.costPrice}, ${p.sellingPrice}, ${p.stock}, ${p.isActive}, ${p.isJobWork}, ${JSON.stringify(p.requiredProcesses)})
      RETURNING *
    `;
    setParts(prev => [{ ...p, id: result.id, sku, requiredProcesses: p.requiredProcesses } as Part, ...prev]);
  };

  const addCustomer = async (c: Customer) => {
    if (!sql) return;
    const id = `CUST-${Date.now().toString().slice(-4)}`;
    await sql`
      INSERT INTO customers (id, name, email, billing_address, shipping_address, delivery_address, country, currency, credit_period, is_active, contact_person, phone_number, tax_identifier)
      VALUES (${id}, ${c.name}, ${c.email}, ${c.billingAddress}, ${c.shippingAddress}, ${c.deliveryAddress}, ${c.country}, ${c.currency}, ${c.creditPeriod}, true, ${c.contactPerson}, ${c.phoneNumber}, ${c.taxIdentifier})
    `;
    setCustomers(prev => [{ ...c, id, isActive: true }, ...prev]);
  };

  const addSupplier = async (s: Omit<Supplier, 'id' | 'code'>) => {
    if (!sql) return;
    const id = `SUPP-${Date.now().toString().slice(-4)}`;
    const code = `V-${Date.now().toString().slice(-4)}`;
    await sql`
      INSERT INTO suppliers (id, code, name, email, address, credit_period, is_active, contact_person, phone_number, tax_identifier)
      VALUES (${id}, ${code}, ${s.name}, ${s.email}, ${s.address}, ${s.creditPeriod}, true, ${s.contactPerson}, ${s.phoneNumber}, ${s.taxIdentifier})
    `;
    setSuppliers(prev => [{ ...s, id, code, isActive: true } as Supplier, ...prev]);
  };

  const addSalesOrder = async (soData: Omit<SalesOrder, 'id'>) => {
    if (!sql) return;
    const id = `${settings.soPrefix}${settings.soNextNumber}`;
    await sql`
      INSERT INTO sales_orders (id, customer_id, customer_po_number, order_date, status, items, total_amount, currency)
      VALUES (${id}, ${soData.customerId}, ${soData.customerPONumber}, ${soData.orderDate}, ${soData.status}, ${JSON.stringify(soData.items)}, ${soData.totalAmount}, ${soData.currency})
    `;
    setSalesOrders(prev => [{ ...soData, id } as SalesOrder, ...prev]);
    await updateSettings({ soNextNumber: settings.soNextNumber + 1 });
  };

  const createPOFromSO = async (soId: string) => {
    if (!sql) return;
    const so = salesOrders.find(s => s.id === soId);
    if (!so) return;

    const supplierGroups: Record<string, any[]> = {};
    so.items.forEach(item => {
      const part = parts.find(p => p.id === item.partId);
      if (!part) return;
      const supplierId = part.primarySupplierId;
      if (!supplierGroups[supplierId]) supplierGroups[supplierId] = [];
      supplierGroups[supplierId].push({
        partId: part.id,
        quantity: item.quantity,
        unitPrice: part.costPrice
      });
    });

    let currentPONumber = settings.poNextNumber;
    const newPOs: PurchaseOrder[] = [];

    for (const [supplierId, items] of Object.entries(supplierGroups)) {
      const poId = `${settings.poPrefix}${currentPONumber}`;
      const totalAmount = items.reduce((sum, i) => sum + (i.quantity * i.unitPrice), 0);
      
      const [poResult] = await sql`
        INSERT INTO purchase_orders (id, supplier_id, sales_order_id, order_date, status, items, total_amount, currency)
        VALUES (${poId}, ${supplierId}, ${soId}, ${new Date().toISOString().split('T')[0]}, ${OrderStatus.PENDING_APPROVAL}, ${JSON.stringify(items)}, ${totalAmount}, ${settings.baseCurrency})
        RETURNING *
      `;

      newPOs.push({
        id: poResult.id,
        supplierId: poResult.supplier_id,
        salesOrderId: poResult.sales_order_id,
        orderDate: poResult.order_date,
        status: poResult.status as OrderStatus,
        items: poResult.items,
        totalAmount: Number(poResult.total_amount),
        currency: poResult.currency
      });

      currentPONumber++;
    }

    await updateSettings({ poNextNumber: currentPONumber });
    await updateSalesOrder(soId, { status: OrderStatus.PO_RELEASED });
    setPurchaseOrders(prev => [...newPOs, ...prev]);
  };

  const inwardJobWork = async (id: string, invoiceNo: string) => {
    if (!sql) return;
    const jwo = jobWorkOrders.find(j => j.id === id);
    if (!jwo) return;
    
    await sql`UPDATE job_work_orders SET status = 'Inwarded' WHERE id = ${id}`;
    setJobWorkOrders(prev => prev.map(j => j.id === id ? { ...j, status: 'Inwarded' } : j));

    const so = salesOrders.find(s => s.id === jwo.salesOrderId);
    if (so) {
      const newItems = so.items.map(item => {
        if (item.partId === jwo.partId) return { ...item, completedProcessIndex: jwo.processIndex };
        return item;
      });
      await updateSalesOrder(so.id, { items: newItems });
      
      const part = parts.find(p => p.id === jwo.partId);
      if (part && jwo.processIndex === part.requiredProcesses.length - 1) {
        await updatePart(part.id, { stock: part.stock + jwo.quantity });
        await updateSalesOrder(so.id, { status: OrderStatus.RECEIVED });
      }
    }
  };

  const addJobWorkOrder = async (jwo: Omit<JobWorkOrder, 'id' | 'currency' | 'linkedPoId'>) => {
    if (!sql) return;
    const id = `JW-${Date.now().toString().slice(-6)}`;
    const linkedPoId = `JW-PO-${id}`;
    await sql`
      INSERT INTO job_work_orders (id, supplier_id, part_id, process_id, sales_order_id, process_index, quantity, unit_price, total_price, currency, order_date, expected_date, status, challan_number, linked_po_id)
      VALUES (${id}, ${jwo.supplierId}, ${jwo.partId}, ${jwo.processId}, ${jwo.salesOrderId}, ${jwo.processIndex}, ${jwo.quantity}, ${jwo.unitPrice}, ${jwo.totalPrice}, ${settings.baseCurrency}, ${jwo.orderDate}, ${jwo.expectedDate}, 'Issued', ${jwo.challanNumber}, ${linkedPoId})
    `;
    setJobWorkOrders(prev => [{ ...jwo, id, currency: settings.baseCurrency, linkedPoId, status: 'Issued' } as JobWorkOrder, ...prev]);
  };

  const updateSalesOrder = async (id: string, updates: Partial<SalesOrder>) => {
    if (!sql) return;
    if (updates.status) await sql`UPDATE sales_orders SET status = ${updates.status} WHERE id = ${id}`;
    if (updates.items) await sql`UPDATE sales_orders SET items = ${JSON.stringify(updates.items)} WHERE id = ${id}`;
    setSalesOrders(prev => prev.map(so => so.id === id ? { ...so, ...updates } : so));
  };

  const updatePart = async (id: string, updates: Partial<Part>) => {
    if (!sql) return;
    if (updates.stock !== undefined) await sql`UPDATE parts SET stock = ${updates.stock} WHERE id = ${id}`;
    setParts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const updateSettings = async (u: Partial<CompanySettings>) => {
    if (!sql) return;
    const n = { ...settings, ...u };
    await sql`
      UPDATE settings 
      SET name = ${n.name}, address = ${n.address}, tax_identifier = ${n.taxIdentifier}, base_currency = ${n.baseCurrency}, country = ${n.country},
          so_prefix = ${n.soPrefix}, po_prefix = ${n.poPrefix}, inv_prefix = ${n.invPrefix},
          so_next_number = ${n.so_next_number}, po_next_number = ${n.po_next_number}, inv_next_number = ${n.inv_next_number},
          include_customer_in_po = ${n.include_customer_in_po}
      WHERE id = 1
    `;
    setSettings(n);
  };

  const approvePO = async (id: string) => {
    if (!sql) return;
    await sql`UPDATE purchase_orders SET status = ${OrderStatus.PO_RELEASED} WHERE id = ${id}`;
    setPurchaseOrders(prev => prev.map(p => p.id === id ? { ...p, status: OrderStatus.PO_RELEASED } : p));
  };

  const addProcess = async (p: Omit<Process, 'id'>) => {
    if (!sql) return;
    const [result] = await sql`INSERT INTO processes (name, description) VALUES (${p.name}, ${p.description}) RETURNING *`;
    setProcesses(prev => [{ id: result.id, name: p.name, description: p.description }, ...prev]);
  };

  const addTooling = async (t: Omit<Tooling, 'id'>) => {};
  const deleteSalesOrder = async (id: string) => { if (!sql) return; await sql`DELETE FROM sales_orders WHERE id = ${id}`; setSalesOrders(prev => prev.filter(s => s.id !== id)); };
  const processGRN = async (po: string, inv: string, d: string, it: any) => {};
  const processSupplierInvoice = async (po: string, inv: string) => {};
  const processCustomerInvoice = async (so: string, inv?: string, it?: any) => {};
  const updateCustomer = async (id: string, u: any) => {};
  const updateSupplier = async (id: string, u: any) => {};
  const adjustStock = async (id: string, q: number, r: string) => {};

  return (
    <AppContext.Provider value={{
      user, setUser, isAuthenticated, setIsAuthenticated, logout, settings, updateSettings,
      parts, customers, suppliers, salesOrders, purchaseOrders, toolings, processes, jobWorkOrders, grns, supplierInvoices, customerInvoices, stockAdjustments,
      addSalesOrder, updateSalesOrder, deleteSalesOrder, createPOFromSO, approvePO, processGRN, processSupplierInvoice, processCustomerInvoice,
      addPart, updatePart, addCustomer, updateCustomer, addSupplier, updateSupplier, addTooling, addJobWorkOrder, inwardJobWork, addProcess, adjustStock
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
