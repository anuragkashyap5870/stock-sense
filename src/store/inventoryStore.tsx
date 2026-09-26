import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  Product,
  Warehouse,
  Receipt,
  DeliveryOrder,
  InternalTransfer,
  StockAdjustment,
  MovementRecord,
  NotificationItem,
  UserProfile,
} from '../types/inventory';
import {
  INITIAL_USER,
  INITIAL_WAREHOUSES,
  INITIAL_PRODUCTS,
  INITIAL_RECEIPTS,
  INITIAL_DELIVERIES,
  INITIAL_TRANSFERS,
  INITIAL_ADJUSTMENTS,
  INITIAL_MOVEMENTS,
  INITIAL_NOTIFICATIONS,
} from '../data/initialData';

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
  timestamp: number;
}

interface InventoryContextType {
  // Navigation & UI State
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedWarehouseId: string;
  setSelectedWarehouseId: (id: string) => void;
  selectedProductId: string | null;
  setSelectedProductId: (id: string | null) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (open: boolean) => void;
  isGlobalSearchOpen: boolean;
  setIsGlobalSearchOpen: (open: boolean) => void;

  // Active Modals
  activeModal: 'newProduct' | 'newReceipt' | 'newDelivery' | 'newTransfer' | 'newAdjustment' | null;
  setActiveModal: (modal: 'newProduct' | 'newReceipt' | 'newDelivery' | 'newTransfer' | 'newAdjustment' | null) => void;

  // Authentication State
  isAuthenticated: boolean;
  login: (email: string, pass: string) => boolean;
  logout: () => void;
  currentUser: UserProfile;
  updateUserProfile: (profile: Partial<UserProfile>) => void;

  // Core Data
  products: Product[];
  warehouses: Warehouse[];
  receipts: Receipt[];
  deliveries: DeliveryOrder[];
  transfers: InternalTransfer[];
  adjustments: StockAdjustment[];
  movements: MovementRecord[];
  notifications: NotificationItem[];
  unreadNotificationCount: number;

  // Calculated Dashboard KPI Metrics
  totalProductsCount: number;
  totalStockUnits: number;
  totalInventoryValuation: number;
  lowStockCount: number;
  outOfStockCount: number;
  pendingReceiptsCount: number;
  pendingDeliveriesCount: number;
  scheduledTransfersCount: number;

  // Operations Handlers
  validateReceipt: (receiptId: string) => boolean;
  createReceipt: (receipt: Omit<Receipt, 'id' | 'createdAt'>) => string;
  
  validateDelivery: (deliveryId: string) => { success: boolean; error?: string };
  createDelivery: (delivery: Omit<DeliveryOrder, 'id' | 'createdAt'>) => string;

  executeInternalTransfer: (transferId: string) => { success: boolean; error?: string };
  createInternalTransfer: (transfer: Omit<InternalTransfer, 'id' | 'createdAt'>) => string;

  applyStockAdjustment: (adjustmentId: string) => { success: boolean; error?: string };
  createStockAdjustment: (adj: Omit<StockAdjustment, 'id' | 'createdAt'>) => string;

  addProduct: (product: Omit<Product, 'id' | 'lastUpdated'>) => string;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  addWarehouse: (warehouse: Omit<Warehouse, 'id'>) => string;

  // Notifications & Toasts
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearAllNotifications: () => void;
  toasts: ToastMessage[];
  showToast: (title: string, message: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
  dismissToast: (id: string) => void;

  // Demo Workflow Scenario Runner
  demoStep: number;
  setDemoStep: (step: number) => void;
  resetDemoData: () => void;
  executeDemoWorkflowStep: (step: number) => void;
}

const STORAGE_KEY = 'stocksense_inventory_v1';

const InventoryContext = createContext<InventoryContextType | null>(null);

export const InventoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Try loading initial state from localStorage
  const getInitialState = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse localStorage data', e);
    }
    return {
      products: INITIAL_PRODUCTS,
      warehouses: INITIAL_WAREHOUSES,
      receipts: INITIAL_RECEIPTS,
      deliveries: INITIAL_DELIVERIES,
      transfers: INITIAL_TRANSFERS,
      adjustments: INITIAL_ADJUSTMENTS,
      movements: INITIAL_MOVEMENTS,
      notifications: INITIAL_NOTIFICATIONS,
      currentUser: INITIAL_USER,
      demoStep: 1,
    };
  };

  const initialState = getInitialState();

  const [products, setProducts] = useState<Product[]>(initialState.products);
  const [warehouses, setWarehouses] = useState<Warehouse[]>(initialState.warehouses);
  const [receipts, setReceipts] = useState<Receipt[]>(initialState.receipts);
  const [deliveries, setDeliveries] = useState<DeliveryOrder[]>(initialState.deliveries);
  const [transfers, setTransfers] = useState<InternalTransfer[]>(initialState.transfers);
  const [adjustments, setAdjustments] = useState<StockAdjustment[]>(initialState.adjustments);
  const [movements, setMovements] = useState<MovementRecord[]>(initialState.movements);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialState.notifications);
  const [currentUser, setCurrentUser] = useState<UserProfile>(initialState.currentUser);
  const [demoStep, setDemoStep] = useState<number>(initialState.demoStep || 1);

  // UI state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>('ALL');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState<boolean>(false);
  const [activeModal, setActiveModal] = useState<'newProduct' | 'newReceipt' | 'newDelivery' | 'newTransfer' | 'newAdjustment' | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Sync state to localStorage
  useEffect(() => {
    try {
      const dataToSave = {
        products,
        warehouses,
        receipts,
        deliveries,
        transfers,
        adjustments,
        movements,
        notifications,
        currentUser,
        demoStep,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }, [products, warehouses, receipts, deliveries, transfers, adjustments, movements, notifications, currentUser, demoStep]);

  // Toast Helpers
  const showToast = (title: string, message: string, type: 'success' | 'warning' | 'error' | 'info' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const newToast: ToastMessage = { id, title, message, type, timestamp: Date.now() };
    setToasts((prev) => [newToast, ...prev].slice(0, 5));

    setTimeout(() => {
      dismissToast(id);
    }, 5000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Auth Functions
  const login = (email: string, pass: string): boolean => {
    if (email === 'admin@stocksense.com' && pass === 'admin123') {
      setIsAuthenticated(true);
      showToast('Welcome back', `Logged in as ${currentUser.name} (${currentUser.role})`, 'success');
      return true;
    }
    if (email.trim() && pass.length >= 4) {
      setIsAuthenticated(true);
      showToast('Session Started', `Welcome to StockSense, ${email}`, 'success');
      return true;
    }
    showToast('Invalid Credentials', 'Please check your email and password.', 'error');
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    showToast('Signed Out', 'You have been safely signed out.', 'info');
  };

  const updateUserProfile = (profile: Partial<UserProfile>) => {
    setCurrentUser((prev) => ({ ...prev, ...profile }));
    showToast('Profile Updated', 'User preferences and assigned site saved.', 'success');
  };

  // Reset Demo Data
  const resetDemoData = () => {
    setProducts(INITIAL_PRODUCTS);
    setWarehouses(INITIAL_WAREHOUSES);
    setReceipts(INITIAL_RECEIPTS);
    setDeliveries(INITIAL_DELIVERIES);
    setTransfers(INITIAL_TRANSFERS);
    setAdjustments(INITIAL_ADJUSTMENTS);
    setMovements(INITIAL_MOVEMENTS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setCurrentUser(INITIAL_USER);
    setDemoStep(1);
    localStorage.removeItem(STORAGE_KEY);
    showToast('Demo Environment Reset', 'All inventory records, locations, and movements restored to initial baseline.', 'info');
  };

  // Derived KPI Metrics
  const totalProductsCount = products.length;

  const totalStockUnits = useMemo(() => {
    return products.reduce((acc, p) => acc + (p.availableStock || 0), 0);
  }, [products]);

  const totalInventoryValuation = useMemo(() => {
    return products.reduce((acc, p) => acc + (p.availableStock || 0) * (p.unitPrice || 50), 0);
  }, [products]);

  const lowStockCount = useMemo(() => {
    return products.filter((p) => p.availableStock > 0 && p.availableStock <= p.reorderLevel).length;
  }, [products]);

  const outOfStockCount = useMemo(() => {
    return products.filter((p) => p.availableStock <= 0).length;
  }, [products]);

  const pendingReceiptsCount = useMemo(() => {
    return receipts.filter((r) => r.status === 'Waiting' || r.status === 'Ready' || r.status === 'Draft').length;
  }, [receipts]);

  const pendingDeliveriesCount = useMemo(() => {
    return deliveries.filter((d) => d.status === 'Waiting' || d.status === 'Ready' || d.status === 'Draft').length;
  }, [deliveries]);

  const scheduledTransfersCount = useMemo(() => {
    return transfers.filter((t) => t.status === 'Draft' || t.status === 'Ready').length;
  }, [transfers]);

  const unreadNotificationCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  // ==========================================
  // OPERATIONAL ACTION: RECEIPT VALIDATION
  // ==========================================
  const validateReceipt = (receiptId: string): boolean => {
    const receipt = receipts.find((r) => r.id === receiptId);
    if (!receipt) {
      showToast('Error', 'Receipt record not found.', 'error');
      return false;
    }
    if (receipt.status === 'Done') {
      showToast('Already Validated', `Receipt ${receipt.receiptNumber} is already marked Done.`, 'warning');
      return false;
    }

    // Process each product in the receipt
    const updatedProducts = [...products];
    const newMovements: MovementRecord[] = [];
    let totalCreditedUnits = 0;
    let primaryUnit = '';
    let primaryProductName = '';

    receipt.items.forEach((item) => {
      const prodIndex = updatedProducts.findIndex((p) => p.id === item.productId);
      if (prodIndex !== -1) {
        const prod = { ...updatedProducts[prodIndex] };
        prod.availableStock += item.receivedQty;
        totalCreditedUnits += item.receivedQty;
        primaryUnit = item.unit;
        primaryProductName = prod.name;

        // Update location stock for this product
        const locStockIndex = prod.locationStocks.findIndex(
          (ls) => ls.warehouseId === receipt.destinationWarehouseId && ls.locationName === item.destinationLocation
        );

        if (locStockIndex !== -1) {
          prod.locationStocks[locStockIndex].quantity += item.receivedQty;
        } else {
          prod.locationStocks.push({
            warehouseId: receipt.destinationWarehouseId,
            warehouseName: receipt.destinationWarehouseName,
            locationName: item.destinationLocation,
            quantity: item.receivedQty,
          });
        }
        prod.lastUpdated = 'Just now';
        updatedProducts[prodIndex] = prod;

        // Create movement record
        newMovements.push({
          id: `mov-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          timestamp: 'Just now',
          reference: receipt.receiptNumber,
          operation: 'Receipt',
          productId: prod.id,
          productName: prod.name,
          sku: prod.sku,
          quantity: item.receivedQty,
          unit: item.unit,
          fromLocation: receipt.vendor,
          toLocation: `${receipt.destinationWarehouseName} (${item.destinationLocation})`,
          user: currentUser.name,
          status: 'Done',
          notes: `Goods verified from PO ${receipt.poReference}`,
        });
      }
    });

    // Update receipt status
    setReceipts((prev) =>
      prev.map((r) => (r.id === receiptId ? { ...r, status: 'Done', notes: `${r.notes || ''} [Validated at ${new Date().toLocaleTimeString()}]` } : r))
    );

    setProducts(updatedProducts);
    setMovements((prev) => [...newMovements, ...prev]);

    // Create system notification
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: `Receipt Validated: ${receipt.receiptNumber}`,
      message: `Stock increased by +${totalCreditedUnits} ${primaryUnit} for ${primaryProductName}. Inventory ledger updated.`,
      type: 'pending_receipt',
      timestamp: 'Just now',
      read: false,
      linkTab: 'receipts',
      linkId: receipt.id,
    };
    setNotifications((prev) => [newNotif, ...prev]);

    showToast(
      'Receipt Validated & Stock Updated',
      `Receipt ${receipt.receiptNumber} validated. Stock increased by +${totalCreditedUnits} ${primaryUnit}.`,
      'success'
    );
    return true;
  };

  const createReceipt = (receiptData: Omit<Receipt, 'id' | 'createdAt'>): string => {
    const id = `rec-${Date.now()}`;
    const newReceipt: Receipt = {
      ...receiptData,
      id,
      createdAt: new Date().toISOString(),
    };
    setReceipts((prev) => [newReceipt, ...prev]);
    showToast('Receipt Created', `Receipt ${newReceipt.receiptNumber} draft registered.`, 'success');
    return id;
  };

  // ==========================================
  // OPERATIONAL ACTION: DELIVERY VALIDATION
  // ==========================================
  const validateDelivery = (deliveryId: string): { success: boolean; error?: string } => {
    const delivery = deliveries.find((d) => d.id === deliveryId);
    if (!delivery) {
      return { success: false, error: 'Delivery order record not found.' };
    }
    if (delivery.status === 'Done') {
      return { success: false, error: 'Delivery order has already been validated and dispatched.' };
    }

    // ZERO NEGATIVE INVENTORY GUARD CHECK
    for (const item of delivery.items) {
      const prod = products.find((p) => p.id === item.productId);
      if (!prod) {
        return { success: false, error: `Product ${item.productName} not found in catalog.` };
      }
      if (prod.availableStock < item.quantity) {
        showToast(
          'Insufficient Stock Available',
          `Cannot deliver ${item.quantity} ${item.unit} of ${prod.name}. Current stock is only ${prod.availableStock} ${item.unit}.`,
          'error'
        );
        return {
          success: false,
          error: `Insufficient stock for ${prod.name}. Required: ${item.quantity} ${item.unit}, Available: ${prod.availableStock} ${item.unit}`,
        };
      }
    }

    // Deduct stock and record movements
    const updatedProducts = [...products];
    const newMovements: MovementRecord[] = [];
    let totalDeliveredUnits = 0;
    let primaryUnit = '';
    let primaryProductName = '';

    delivery.items.forEach((item) => {
      const prodIndex = updatedProducts.findIndex((p) => p.id === item.productId);
      if (prodIndex !== -1) {
        const prod = { ...updatedProducts[prodIndex] };
        prod.availableStock -= item.quantity;
        totalDeliveredUnits += item.quantity;
        primaryUnit = item.unit;
        primaryProductName = prod.name;

        // Deduct from location stock
        const locIndex = prod.locationStocks.findIndex(
          (ls) => ls.warehouseId === delivery.sourceWarehouseId && ls.locationName === item.sourceLocation
        );
        if (locIndex !== -1) {
          prod.locationStocks[locIndex].quantity = Math.max(0, prod.locationStocks[locIndex].quantity - item.quantity);
        }
        prod.lastUpdated = 'Just now';
        updatedProducts[prodIndex] = prod;

        newMovements.push({
          id: `mov-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          timestamp: 'Just now',
          reference: delivery.deliveryNumber,
          operation: 'Delivery',
          productId: prod.id,
          productName: prod.name,
          sku: prod.sku,
          quantity: -item.quantity,
          unit: item.unit,
          fromLocation: `${delivery.sourceWarehouseName} (${item.sourceLocation})`,
          toLocation: delivery.customer,
          user: currentUser.name,
          status: 'Done',
          notes: `Dispatched to ${delivery.customer}`,
        });
      }
    });

    setDeliveries((prev) =>
      prev.map((d) => (d.id === deliveryId ? { ...d, status: 'Done', workflowStep: 'dispatched' } : d))
    );
    setProducts(updatedProducts);
    setMovements((prev) => [...newMovements, ...prev]);

    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: `Delivery Dispatched: ${delivery.deliveryNumber}`,
      message: `Stock reduced by -${totalDeliveredUnits} ${primaryUnit} for ${primaryProductName}. Outbound order closed.`,
      type: 'pending_delivery',
      timestamp: 'Just now',
      read: false,
      linkTab: 'delivery-orders',
      linkId: delivery.id,
    };
    setNotifications((prev) => [newNotif, ...prev]);

    showToast(
      'Delivery Validated & Dispatched',
      `Order ${delivery.deliveryNumber} confirmed. Stock reduced by -${totalDeliveredUnits} ${primaryUnit}.`,
      'success'
    );
    return { success: true };
  };

  const createDelivery = (deliveryData: Omit<DeliveryOrder, 'id' | 'createdAt'>): string => {
    const id = `del-${Date.now()}`;
    const newDelivery: DeliveryOrder = {
      ...deliveryData,
      id,
      createdAt: new Date().toISOString(),
    };
    setDeliveries((prev) => [newDelivery, ...prev]);
    showToast('Delivery Order Created', `Order ${newDelivery.deliveryNumber} registered for client.`, 'success');
    return id;
  };

  // ==========================================
  // OPERATIONAL ACTION: INTERNAL TRANSFER
  // ==========================================
  const executeInternalTransfer = (transferId: string): { success: boolean; error?: string } => {
    const transfer = transfers.find((t) => t.id === transferId);
    if (!transfer) {
      return { success: false, error: 'Transfer record not found.' };
    }
    if (transfer.status === 'Done') {
      return { success: false, error: 'Transfer has already been executed.' };
    }

    const prodIndex = products.findIndex((p) => p.id === transfer.productId);
    if (prodIndex === -1) {
      return { success: false, error: 'Product not found.' };
    }

    const prod = { ...products[prodIndex] };
    const sourceLoc = prod.locationStocks.find(
      (ls) => ls.warehouseId === transfer.sourceWarehouseId && ls.locationName === transfer.sourceLocation
    );

    if (!sourceLoc || sourceLoc.quantity < transfer.quantity) {
      const avail = sourceLoc ? sourceLoc.quantity : 0;
      showToast(
        'Insufficient Source Stock',
        `Source location only has ${avail} ${transfer.unit}. Cannot transfer ${transfer.quantity} ${transfer.unit}.`,
        'error'
      );
      return {
        success: false,
        error: `Insufficient stock in source: ${avail} ${transfer.unit} available.`,
      };
    }

    // Transfer logic:
    // Source -= quantity
    // Destination += quantity
    // TOTAL COMPANY STOCK REMAINS EXACTLY UNCHANGED!
    sourceLoc.quantity -= transfer.quantity;

    const destLoc = prod.locationStocks.find(
      (ls) => ls.warehouseId === transfer.destinationWarehouseId && ls.locationName === transfer.destinationLocation
    );
    if (destLoc) {
      destLoc.quantity += transfer.quantity;
    } else {
      prod.locationStocks.push({
        warehouseId: transfer.destinationWarehouseId,
        warehouseName: transfer.destinationWarehouseName,
        locationName: transfer.destinationLocation,
        quantity: transfer.quantity,
      });
    }

    prod.lastUpdated = 'Just now';
    const updatedProducts = [...products];
    updatedProducts[prodIndex] = prod;

    setTransfers((prev) => prev.map((t) => (t.id === transferId ? { ...t, status: 'Done' } : t)));
    setProducts(updatedProducts);

    // Record movement in ledger
    const newMovement: MovementRecord = {
      id: `mov-${Date.now()}`,
      timestamp: 'Just now',
      reference: transfer.transferNumber,
      operation: 'Internal Transfer',
      productId: prod.id,
      productName: prod.name,
      sku: prod.sku,
      quantity: transfer.quantity,
      unit: transfer.unit,
      fromLocation: `${transfer.sourceWarehouseName} (${transfer.sourceLocation})`,
      toLocation: `${transfer.destinationWarehouseName} (${transfer.destinationLocation})`,
      user: currentUser.name,
      status: 'Done',
      notes: `Company total stock constant at ${prod.availableStock} ${prod.unit}. Internal relocation verified.`,
    };
    setMovements((prev) => [newMovement, ...prev]);

    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: `Transfer Executed: ${transfer.transferNumber}`,
      message: `Moved ${transfer.quantity} ${transfer.unit} of ${prod.name} from ${transfer.sourceWarehouseName} to ${transfer.destinationWarehouseName}.`,
      type: 'transfer_pending',
      timestamp: 'Just now',
      read: false,
      linkTab: 'internal-transfers',
      linkId: transfer.id,
    };
    setNotifications((prev) => [newNotif, ...prev]);

    showToast(
      'Internal Transfer Completed',
      `Transferred ${transfer.quantity} ${transfer.unit} from ${transfer.sourceWarehouseName} → ${transfer.destinationWarehouseName}. Total stock conserved.`,
      'success'
    );
    return { success: true };
  };

  const createInternalTransfer = (transferData: Omit<InternalTransfer, 'id' | 'createdAt'>): string => {
    const id = `trf-${Date.now()}`;
    const newTransfer: InternalTransfer = {
      ...transferData,
      id,
      createdAt: new Date().toISOString(),
    };
    setTransfers((prev) => [newTransfer, ...prev]);
    showToast('Transfer Order Created', `Transfer ${newTransfer.transferNumber} scheduled.`, 'success');
    return id;
  };

  // ==========================================
  // OPERATIONAL ACTION: STOCK ADJUSTMENT
  // ==========================================
  const applyStockAdjustment = (adjustmentId: string): { success: boolean; error?: string } => {
    const adj = adjustments.find((a) => a.id === adjustmentId);
    if (!adj) {
      return { success: false, error: 'Adjustment record not found.' };
    }
    if (adj.status === 'Done') {
      return { success: false, error: 'Adjustment has already been applied.' };
    }

    const prodIndex = products.findIndex((p) => p.id === adj.productId);
    if (prodIndex === -1) {
      return { success: false, error: 'Product not found.' };
    }

    const prod = { ...products[prodIndex] };
    const oldStock = prod.availableStock;
    // Set stock = physicalCount
    prod.availableStock = adj.physicalCount;

    // Adjust specific location
    const locIndex = prod.locationStocks.findIndex(
      (ls) => ls.warehouseId === adj.warehouseId && ls.locationName === adj.location
    );
    if (locIndex !== -1) {
      prod.locationStocks[locIndex].quantity = Math.max(0, prod.locationStocks[locIndex].quantity + adj.difference);
    }
    prod.lastUpdated = 'Just now';

    const updatedProducts = [...products];
    updatedProducts[prodIndex] = prod;

    setAdjustments((prev) => prev.map((a) => (a.id === adjustmentId ? { ...a, status: 'Done' } : a)));
    setProducts(updatedProducts);

    // Create movement entry
    const newMovement: MovementRecord = {
      id: `mov-${Date.now()}`,
      timestamp: 'Just now',
      reference: adj.adjustmentNumber,
      operation: 'Adjustment',
      productId: prod.id,
      productName: prod.name,
      sku: prod.sku,
      quantity: adj.difference,
      unit: adj.unit,
      fromLocation: `${adj.warehouseName} (${adj.location})`,
      toLocation: `Adjustment Audit (${adj.reason})`,
      user: currentUser.name,
      status: 'Done',
      notes: `Discrepancy reconciled: ${adj.difference > 0 ? '+' : ''}${adj.difference} ${adj.unit}. Reason: ${adj.reason}. ${adj.notes}`,
    };
    setMovements((prev) => [newMovement, ...prev]);

    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: `Stock Adjustment Reconciled: ${adj.adjustmentNumber}`,
      message: `${prod.name} count adjusted from ${oldStock} to ${adj.physicalCount} ${adj.unit} (${adj.reason}).`,
      type: 'stock_adjustment',
      timestamp: 'Just now',
      read: false,
      linkTab: 'stock-adjustments',
      linkId: adj.id,
    };
    setNotifications((prev) => [newNotif, ...prev]);

    showToast(
      'Stock Adjustment Applied',
      `Stock for ${prod.name} updated: ${oldStock} → ${adj.physicalCount} ${adj.unit} (${adj.difference > 0 ? '+' : ''}${adj.difference}).`,
      'warning'
    );
    return { success: true };
  };

  const createStockAdjustment = (adjData: Omit<StockAdjustment, 'id' | 'createdAt'>): string => {
    const id = `adj-${Date.now()}`;
    const newAdjustment: StockAdjustment = {
      ...adjData,
      id,
      createdAt: new Date().toISOString(),
    };
    setAdjustments((prev) => [newAdjustment, ...prev]);
    showToast('Adjustment Draft Created', `Adjustment ${newAdjustment.adjustmentNumber} queued for review.`, 'info');
    return id;
  };

  // ==========================================
  // PRODUCT MANAGEMENT
  // ==========================================
  const addProduct = (productData: Omit<Product, 'id' | 'lastUpdated'>): string => {
    // Check for duplicate SKU
    if (products.some((p) => p.sku.toLowerCase() === productData.sku.toLowerCase())) {
      showToast('Duplicate SKU', `A product with SKU "${productData.sku}" already exists.`, 'error');
      return '';
    }

    const id = `prod-${Date.now()}`;
    const newProduct: Product = {
      ...productData,
      id,
      lastUpdated: 'Just now',
    };

    setProducts((prev) => [newProduct, ...prev]);

    // Initial movement record if stock > 0
    if (newProduct.availableStock > 0) {
      const initMovement: MovementRecord = {
        id: `mov-${Date.now()}`,
        timestamp: 'Just now',
        reference: `INIT-${newProduct.sku}`,
        operation: 'Receipt',
        productId: newProduct.id,
        productName: newProduct.name,
        sku: newProduct.sku,
        quantity: newProduct.availableStock,
        unit: newProduct.unit,
        fromLocation: 'Initial Inward Registration',
        toLocation: `${newProduct.warehouseName} (${newProduct.primaryLocation})`,
        user: currentUser.name,
        status: 'Done',
        notes: 'Initial stock intake on SKU catalog provisioning',
      };
      setMovements((prev) => [initMovement, ...prev]);
    }

    showToast('Product Catalogued', `Product "${newProduct.name}" (${newProduct.sku}) activated.`, 'success');
    return id;
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates, lastUpdated: 'Just now' } : p))
    );
    showToast('Product Updated', 'Product specifications updated successfully.', 'success');
  };

  const deleteProduct = (id: string) => {
    const prod = products.find((p) => p.id === id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    showToast('Product Removed', `Product ${prod?.name || id} removed from catalog.`, 'info');
  };

  const addWarehouse = (whData: Omit<Warehouse, 'id'>): string => {
    const id = `WH-00${warehouses.length + 1}`;
    const newWarehouse: Warehouse = {
      ...whData,
      id,
    };
    setWarehouses((prev) => [...prev, newWarehouse]);
    showToast('Warehouse Added', `Facility ${newWarehouse.name} (${newWarehouse.code}) online.`, 'success');
    return id;
  };

  // Notification methods
  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('Notifications Cleared', 'All notifications marked as read.', 'info');
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // ==========================================
  // HACKATHON DEMO PIPELINE RUNNER
  // ==========================================
  const executeDemoWorkflowStep = (stepNumber: number) => {
    setDemoStep(stepNumber);

    switch (stepNumber) {
      case 1:
        // Step 1: Open Dashboard
        setActiveTab('dashboard');
        showToast('Demo Step 1: Dashboard Telemetry', 'Active telemetry command center synchronized across 3 facilities.', 'info');
        break;

      case 2: {
        // Step 2: Receive 100 kg Steel Rod (Receipt REC-2026-0892)
        // Find receipt REC-2026-0892 or validate it
        setActiveTab('receipts');
        const targetReceipt = receipts.find((r) => r.receiptNumber === 'REC-2026-0892');
        if (targetReceipt && targetReceipt.status !== 'Done') {
          validateReceipt(targetReceipt.id);
        } else {
          showToast('Step 2: Steel Rod Received', 'Receipt REC-2026-0892 already validated: Steel Rod stock increased to 600 kg.', 'success');
        }
        break;
      }

      case 3: {
        // Step 3: Transfer 30 kg Steel Rod from Main WH to Production Floor
        setActiveTab('internal-transfers');
        const targetTransfer = transfers.find((t) => t.transferNumber === 'TRF-2026-0159');
        if (targetTransfer && targetTransfer.status !== 'Done') {
          executeInternalTransfer(targetTransfer.id);
        } else {
          // If not existing, execute transfer on Steel Rod
          const steelRod = products.find((p) => p.sku === 'STL-001');
          if (steelRod) {
            const trfId = createInternalTransfer({
              transferNumber: 'TRF-2026-0159',
              sourceWarehouseId: 'WH-001',
              sourceWarehouseName: 'Main Warehouse Ludhiana',
              sourceLocation: 'Rack A-12',
              destinationWarehouseId: 'WH-002',
              destinationWarehouseName: 'Production Warehouse Phagwara',
              destinationLocation: 'Production Floor Line #4',
              productId: steelRod.id,
              productName: steelRod.name,
              sku: steelRod.sku,
              quantity: 30,
              unit: 'kg',
              transferDate: '2026-09-25',
              status: 'Draft',
              operator: currentUser.name,
              notes: '30 kg Steel Rod relocated to Production Floor Line #4.',
            });
            executeInternalTransfer(trfId);
          }
        }
        break;
      }

      case 4: {
        // Step 4: Deliver 20 kg Steel Rod to Metro Infra Builders (DEL-2026-0423)
        setActiveTab('delivery-orders');
        const targetDelivery = deliveries.find((d) => d.deliveryNumber === 'DEL-2026-0423');
        if (targetDelivery && targetDelivery.status !== 'Done') {
          validateDelivery(targetDelivery.id);
        } else {
          showToast('Step 4: Delivery Validated', 'Delivery DEL-2026-0423 validated: 20 kg deducted. Stock is now 580 kg.', 'success');
        }
        break;
      }

      case 5: {
        // Step 5: Stock Adjustment (-3 kg Damaged Steel Rod, 580 -> 577 kg)
        setActiveTab('stock-adjustments');
        const steelRod = products.find((p) => p.sku === 'STL-001');
        if (steelRod) {
          const adjId = createStockAdjustment({
            adjustmentNumber: `ADJ-2026-0${Math.floor(100 + Math.random() * 899)}`,
            productId: steelRod.id,
            productName: steelRod.name,
            sku: steelRod.sku,
            warehouseId: 'WH-001',
            warehouseName: 'Main Warehouse Ludhiana',
            location: 'Rack A-12',
            systemQuantity: steelRod.availableStock,
            physicalCount: Math.max(0, steelRod.availableStock - 3),
            difference: -3,
            unit: 'kg',
            reason: 'Damaged',
            notes: 'Bent rod discovered during crane unloading. Written off to scrap QA.',
            operator: currentUser.name,
            status: 'Draft',
          });
          applyStockAdjustment(adjId);
        }
        break;
      }

      case 6:
        // Step 6: Move Ledger (Verified Audit)
        setActiveTab('move-history-ledger');
        showToast('Demo Step 6: Move Ledger Audit', 'Immutable ledger updated: +100 Receipt, -30/+30 Transfer, -20 Delivery, -3 Adjustment verified.', 'success');
        break;

      default:
        break;
    }
  };

  return (
    <InventoryContext.Provider
      value={{
        activeTab,
        setActiveTab,
        selectedWarehouseId,
        setSelectedWarehouseId,
        selectedProductId,
        setSelectedProductId,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        isMobileSidebarOpen,
        setIsMobileSidebarOpen,
        isGlobalSearchOpen,
        setIsGlobalSearchOpen,
        activeModal,
        setActiveModal,
        isAuthenticated,
        login,
        logout,
        currentUser,
        updateUserProfile,
        products,
        warehouses,
        receipts,
        deliveries,
        transfers,
        adjustments,
        movements,
        notifications,
        unreadNotificationCount,
        totalProductsCount,
        totalStockUnits,
        totalInventoryValuation,
        lowStockCount,
        outOfStockCount,
        pendingReceiptsCount,
        pendingDeliveriesCount,
        scheduledTransfersCount,
        validateReceipt,
        createReceipt,
        validateDelivery,
        createDelivery,
        executeInternalTransfer,
        createInternalTransfer,
        applyStockAdjustment,
        createStockAdjustment,
        addProduct,
        updateProduct,
        deleteProduct,
        addWarehouse,
        markNotificationRead,
        markAllNotificationsRead,
        clearAllNotifications,
        toasts,
        showToast,
        dismissToast,
        demoStep,
        setDemoStep,
        resetDemoData,
        executeDemoWorkflowStep,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};
