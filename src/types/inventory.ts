export type OperationType = 'Receipt' | 'Delivery' | 'Internal Transfer' | 'Adjustment';
export type OperationStatus = 'Draft' | 'Waiting' | 'Ready' | 'Done' | 'Cancelled';
export type ProductCategory = 'Raw Materials' | 'Electrical' | 'Hardware' | 'Finished Goods' | 'Components';
export type AdjustmentReason = 'Damaged' | 'Lost' | 'Found' | 'Counting Error' | 'Other';

export interface LocationStock {
  warehouseId: string;
  warehouseName: string;
  locationName: string;
  quantity: number;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: ProductCategory;
  unit: string;
  availableStock: number;
  reserved: number;
  reorderLevel: number;
  warehouseId: string;
  warehouseName: string;
  primaryLocation: string;
  description: string;
  barcode?: string;
  unitPrice?: number;
  leadTimeDays?: number;
  locationStocks: LocationStock[];
  lastUpdated: string;
}

export interface ReceiptItem {
  productId: string;
  productName: string;
  sku: string;
  expectedQty: number;
  receivedQty: number;
  unit: string;
  destinationLocation: string;
}

export interface Receipt {
  id: string;
  receiptNumber: string;
  vendor: string;
  poReference: string;
  receiptDate: string;
  destinationWarehouseId: string;
  destinationWarehouseName: string;
  destinationLocation: string;
  items: ReceiptItem[];
  status: OperationStatus;
  notes?: string;
  operator: string;
  createdAt: string;
}

export interface DeliveryItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  availableStock: number;
  unit: string;
  sourceLocation: string;
}

export interface DeliveryOrder {
  id: string;
  deliveryNumber: string;
  customer: string;
  deliveryDate: string;
  cutoffTime: string;
  sourceWarehouseId: string;
  sourceWarehouseName: string;
  destinationAddress: string;
  items: DeliveryItem[];
  status: OperationStatus;
  workflowStep: 'order_created' | 'picking_done' | 'staged' | 'dispatched';
  assignedPicker?: string;
  notes?: string;
  createdAt: string;
}

export interface InternalTransfer {
  id: string;
  transferNumber: string;
  sourceWarehouseId: string;
  sourceWarehouseName: string;
  sourceLocation: string;
  destinationWarehouseId: string;
  destinationWarehouseName: string;
  destinationLocation: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unit: string;
  transferDate: string;
  status: OperationStatus;
  notes?: string;
  operator: string;
  createdAt: string;
}

export interface StockAdjustment {
  id: string;
  adjustmentNumber: string;
  productId: string;
  productName: string;
  sku: string;
  warehouseId: string;
  warehouseName: string;
  location: string;
  systemQuantity: number;
  physicalCount: number;
  difference: number;
  unit: string;
  reason: AdjustmentReason;
  notes: string;
  operator: string;
  status: 'Draft' | 'Done';
  createdAt: string;
}

export interface MovementRecord {
  id: string;
  timestamp: string;
  reference: string;
  operation: OperationType;
  productId: string;
  productName: string;
  sku: string;
  quantity: number; // positive or negative
  unit: string;
  fromLocation: string;
  toLocation: string;
  user: string;
  status: 'Done' | 'Verified';
  notes?: string;
}

export interface WarehouseLocation {
  id: string;
  name: string;
  type: 'Receiving' | 'Storage Rack' | 'Production Line' | 'Dispatch Bay' | 'Scrap QA';
  capacityM3: number;
  currentItemsCount: number;
}

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  address: string;
  totalProductsCount: number;
  totalCapacityM3: number;
  occupiedCapacityPercent: number;
  locations: WarehouseLocation[];
  status: 'Active' | 'Maintenance';
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'low_stock' | 'out_of_stock' | 'pending_receipt' | 'pending_delivery' | 'transfer_pending' | 'stock_adjustment' | 'system';
  timestamp: string;
  read: boolean;
  linkTab?: string;
  linkId?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  assignedWarehouseId: string;
  assignedWarehouseName: string;
  avatarUrl?: string;
  phone: string;
  lastLogin: string;
}
