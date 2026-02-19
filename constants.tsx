
import { Part, Customer, Supplier, SalesOrder, OrderStatus } from './types';

export const INITIAL_CUSTOMERS: Customer[] = [
  { 
    id: 'c1', 
    name: 'Eaton', 
    email: 'procurement@eaton.com', 
    billingAddress: '1000 Eaton Boulevard, Cleveland, Ohio, USA',
    shippingAddress: 'Logistics Dock 42, Port of Cleveland, Ohio, USA',
    deliveryAddress: 'Eaton Global Innovation Center, Cleveland, Ohio, USA',
    country: 'USA',
    currency: 'USD',
    creditPeriod: 30,
    advanceTerms: 'No Advance',
    advanceBalance: 0,
    isActive: true,
    contactPerson: 'James Miller',
    phoneNumber: '+1-216-523-4400',
    taxIdentifier: 'US-TAX-882299'
  }
];

export const INITIAL_SUPPLIERS: Supplier[] = [
  { 
    id: 's1', 
    code: 'GKS-10001-SM',
    name: 'SMW', 
    email: 'contact@smw-autoblok.com', 
    address: 'Wiesentalstraße 28, Meckenbeuren, Germany',
    creditPeriod: 45,
    isActive: true,
    contactPerson: 'Hans Schmidt',
    phoneNumber: '+49 7542 405-0',
    taxIdentifier: 'DE-811-234-567'
  },
  {
    id: 's2',
    code: 'GKS-10002-GM',
    name: 'Global Machining Co',
    email: 'sales@globalmachining.com',
    address: '45 Industry Way, Sheffield, UK',
    creditPeriod: 30,
    isActive: true,
    contactPerson: 'Robert Brown',
    phoneNumber: '+44 114 234 5678',
    taxIdentifier: 'GB-998-776-554'
  }
];

const today = new Date();
const formatDate = (date: Date) => date.toISOString().split('T')[0];

export const INITIAL_PARTS: Part[] = [
  { 
    id: 'p1', 
    sku: 'GKP-10001-AS', 
    drawingNumber: 'GK-DWG-10001',
    name: 'Air Shank', 
    revision: '00',
    description: 'Precision industrial air shank for high-performance pneumatic assemblies.', 
    customerId: 'c1',
    primarySupplierId: 's1', 
    secondarySupplierId: 's2',
    costPrice: 145.50, 
    sellingPrice: 280.00, 
    stock: 0, // Reset stock for clean start
    isActive: true,
    leadTimeDays: 14,
    moq: 50,
    uom: 'PCS',
    manufacturingConditions: ['Casting', 'Machined'],
    requiredProcesses: ['proc-1', 'proc-2'],
    priceHistory: [
      { date: formatDate(today), costPrice: 145.50, sellingPrice: 280.00 }
    ]
  }
];

// Cleared for zero-base start
export const INITIAL_SALES_ORDERS: SalesOrder[] = [];
export const INITIAL_PURCHASE_ORDERS: any[] = [];
