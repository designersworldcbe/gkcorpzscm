
export enum OrderStatus {
  DRAFT = 'Draft',
  CONFIRMED = 'Confirmed',
  PENDING_APPROVAL = 'Pending Approval',
  PO_RELEASED = 'Po Released',
  PURCHASED = 'Purchased',
  PARTIALLY_RECEIVED = 'Partially Received',
  RECEIVED = 'Received',
  INVOICED = 'Invoiced',
  COMPLETED = 'Completed'
}

export enum ToolingStatus {
  ACTIVE = 'Active',
  MAINTENANCE = 'Maintenance',
  RETIRED = 'Retired',
  DEVELOPMENT = 'Development',
  INACTIVE = 'Inactive',
  OBSOLETE = 'Obsolete'
}

export interface CompanySettings {
  name: string;
  address: string;
  taxIdentifier: string;
  baseCurrency: string;
  country: string;
  soPrefix: string;
  poPrefix: string;
  invPrefix: string;
  soNextNumber: number;
  poNextNumber: number;
  invNextNumber: number;
  includeCustomerInPO: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

export interface Process {
  id: string;
  name: string;
  description: string;
}

export interface PriceHistoryItem {
  date: string;
  costPrice: number;
  sellingPrice: number;
}

export interface Part {
  id: string;
  sku: string;
  drawingNumber: string;
  name: string;
  revision: string;
  description: string;
  customerId: string;
  primarySupplierId: string;
  secondarySupplierId?: string;
  costPrice: number;
  sellingPrice: number;
  stock: number;
  isActive: boolean;
  isJobWork?: boolean;
  requiredProcesses: string[];
  manufacturingConditions?: string[];
  leadTimeDays?: number;
  moq?: number;
  uom?: string;
  priceHistory?: PriceHistoryItem[];
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  billingAddress: string;
  shippingAddress: string;
  deliveryAddress: string;
  country: string; 
  currency: string; 
  creditPeriod: number;
  advanceTerms: string;
  advanceBalance: number;
  isActive: boolean;
  contactPerson?: string;
  phoneNumber?: string;
  taxIdentifier?: string;
}

export interface ProcessPrice {
  processId: string;
  price: number;
}

export interface Supplier {
  id: string;
  code: string;
  name: string;
  email: string;
  address: string;
  creditPeriod: number;
  isActive: boolean;
  contactPerson?: string;
  phoneNumber?: string;
  taxIdentifier?: string;
  processPricing?: ProcessPrice[];
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  salesOrderId?: string;
  orderDate: string;
  status: OrderStatus;
  items: { partId: string; quantity: number; unitPrice: number }[];
  totalAmount: number;
  currency: string;
}

export interface Tooling {
  id: string;
  assetNumber: string;
  name: string;
  partId: string;
  customerId: string;
  supplierId: string;
  status: ToolingStatus;
  customerValue: number;
  supplierValue: number;
  expectedLifeCycles: number;
  currentCycles: number;
  lastMaintenanceDate: string;
}

export interface JobWorkOrder {
  id: string;
  supplierId: string;
  partId: string;
  processId: string;
  salesOrderId: string;
  processIndex: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  currency: string;
  orderDate: string;
  expectedDate: string;
  status: 'Issued' | 'In Process' | 'Completed' | 'Returned' | 'Received' | 'Inwarded';
  challanNumber: string;
  linkedPoId?: string;
}

export interface SalesOrderItem {
  partId: string;
  quantity: number;
  unitPrice: number;
  invoicedQuantity: number;
  completedProcessIndex: number;
}

export interface SalesOrder {
  id: string;
  customerId: string;
  customerPONumber: string;
  orderDate: string;
  status: OrderStatus;
  items: SalesOrderItem[];
  totalAmount: number;
  currency: string;
}

export interface GRN {
  id: string;
  poId: string;
  supplierInvoiceNo: string;
  receivedDate: string;
  items: { partId: string; quantity: number }[];
}

export interface SupplierInvoice {
  id: string;
  poId: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  date: string;
  dueDate: string;
}

export interface CustomerInvoice {
  id: string;
  soId: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  date: string;
  dueDate: string;
  items: { partId: string; quantity: number; unitPrice: number }[];
}

export interface StockAdjustment {
  id: string;
  partId: string;
  adjustmentQty: number;
  reason: string;
  date: string;
}
