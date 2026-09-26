import React, { useState, useMemo } from 'react';
import { useInventory } from '../store/inventoryStore';
import { StatusBadge } from '../components/common/Badge';
import {
  Package,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  QrCode,
  LayoutGrid,
  List,
  Edit2,
  Trash2,
  ArrowLeftRight,
  Eye,
  SlidersHorizontal,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { ProductCategory, Product } from '../types/inventory';

export const ProductsPage: React.FC = () => {
  const {
    products,
    warehouses,
    setActiveModal,
    setSelectedProductId,
    setActiveTab,
    deleteProduct,
    showToast,
    lowStockCount,
    outOfStockCount,
  } = useInventory();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedUom, setSelectedUom] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'name' | 'stock' | 'sku'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesQuery =
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.barcode && p.barcode.includes(searchQuery));

        const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
        const matchesWarehouse = selectedWarehouse === 'ALL' || p.warehouseId === selectedWarehouse;
        const matchesUom = selectedUom === 'ALL' || p.unit.toLowerCase() === selectedUom.toLowerCase();

        let matchesStatus = true;
        if (selectedStatus === 'in_stock') matchesStatus = p.availableStock > p.reorderLevel;
        if (selectedStatus === 'low_stock') matchesStatus = p.availableStock > 0 && p.availableStock <= p.reorderLevel;
        if (selectedStatus === 'out_of_stock') matchesStatus = p.availableStock <= 0;

        return matchesQuery && matchesCategory && matchesWarehouse && matchesUom && matchesStatus;
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortBy === 'name') diff = a.name.localeCompare(b.name);
        if (sortBy === 'sku') diff = a.sku.localeCompare(b.sku);
        if (sortBy === 'stock') diff = a.availableStock - b.availableStock;
        return sortOrder === 'asc' ? diff : -diff;
      });
  }, [products, searchQuery, selectedCategory, selectedWarehouse, selectedStatus, selectedUom, sortBy, sortOrder]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedRows(filteredProducts.map((p) => p.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleToggleRow = (id: string) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const handleRowClick = (id: string) => {
    setSelectedProductId(id);
    setActiveTab('product-detail');
  };

  const handleExportCSV = () => {
    const headers = ['Product Name', 'SKU', 'Category', 'Unit', 'Available Stock', 'Reserved', 'Reorder Level', 'Location', 'Valuation ($)'];
    const rows = filteredProducts.map((p) => [
      `"${p.name}"`,
      p.sku,
      p.category,
      p.unit,
      p.availableStock,
      p.reserved,
      p.reorderLevel,
      `"${p.primaryLocation}"`,
      p.availableStock * (p.unitPrice || 0),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `StockSense_Catalog_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Export Complete', 'Catalog exported to CSV successfully.', 'success');
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('ALL');
    setSelectedWarehouse('ALL');
    setSelectedStatus('ALL');
    setSelectedUom('ALL');
  };

  return (
    <div className="space-y-5 pb-8">
      {/* Top Stats Telemetry Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
        <div className="bg-[#171A20] border border-[#292D35] rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase text-[#94A3B8] tracking-wider block">
              Catalog SKUs
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold font-mono text-[#F8FAFC]">
                {products.length.toLocaleString()}
              </span>
              <span className="text-xs font-mono text-[#22C55E]">+18 this month</span>
            </div>
            <span className="text-[11px] text-[#64748B]">Active across 3 facilities</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#1E222A] flex items-center justify-center text-[#F59E0B]">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#171A20] border border-[#292D35] rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase text-[#94A3B8] tracking-wider block">
              Stock Health
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold font-mono text-[#22C55E]">93.4%</span>
              <span className="text-xs font-mono text-[#22C55E]">Optimal</span>
            </div>
            <span className="text-[11px] text-[#64748B]">Items above threshold</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#1E222A] flex items-center justify-center text-[#22C55E]">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#171A20] border border-[#292D35] rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase text-[#94A3B8] tracking-wider block">
              Replenishment Triggers
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold font-mono text-[#F59E0B]">{lowStockCount}</span>
              <span className="text-xs font-mono text-[#F59E0B]">Under buffer</span>
            </div>
            <span className="text-[11px] text-[#64748B]">Requires immediate PO draft</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#1E222A] flex items-center justify-center text-[#F59E0B]">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#171A20] border border-[#292D35] rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase text-[#94A3B8] tracking-wider block">
              Stockouts Detected
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold font-mono text-[#EF4444]">{outOfStockCount}</span>
              <span className="text-xs font-mono text-[#EF4444]">Zero units</span>
            </div>
            <span className="text-[11px] text-[#64748B]">Dispatches blocked</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#1E222A] flex items-center justify-center text-[#EF4444]">
            <XCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Catalog Header & Command Bar */}
      <div className="bg-[#171A20] border border-[#292D35] rounded-xl p-5 shadow-md flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase bg-[#F59E0B]/20 text-[#F59E0B] px-2 py-0.5 rounded font-bold">
              Catalog Management
            </span>
            <span className="font-mono text-xs text-[#94A3B8]">WH-001 Sync Validated</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F8FAFC]">
            Products &amp; Inventory Catalog
          </h1>
          <p className="text-xs text-[#94A3B8]">
            Manage catalog items, real-time stock availability, reorder thresholds, and warehouse rack locations.
          </p>
        </div>

        {/* Action Group */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#1E222A] hover:bg-[#292D35] border border-[#292D35] text-[#F8FAFC] text-xs font-medium rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#94A3B8]" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setActiveModal('newProduct')}
            className="flex items-center gap-2 px-4 py-2 bg-[#F59E0B] hover:bg-[#D97706] text-[#0B0D10] text-xs font-bold rounded-lg shadow-sm transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Product</span>
          </button>
        </div>
      </div>

      {/* Filtration & Search Bar */}
      <div className="bg-[#171A20] border border-[#292D35] rounded-xl p-4 shadow-md space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by product name, SKU, barcode (e.g. STL-001)..."
              className="w-full bg-[#0B0D10] border border-[#292D35] focus:border-[#F59E0B] rounded-lg pl-9 pr-4 py-2 text-xs text-[#F8FAFC] placeholder:text-[#64748B] focus:outline-none"
            />
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-3 justify-between lg:justify-end">
            <span className="text-xs font-mono text-[#94A3B8]">
              Showing {filteredProducts.length} of {products.length} SKUs
            </span>
            <div className="flex bg-[#0B0D10] border border-[#292D35] p-1 rounded-lg">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === 'table' ? 'bg-[#1E222A] text-[#F59E0B]' : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                }`}
                title="Table view"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === 'grid' ? 'bg-[#1E222A] text-[#F59E0B]' : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                }`}
                title="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Structured Filters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 pt-1">
          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase text-[#64748B]">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-[#0B0D10] border border-[#292D35] rounded-lg px-2.5 py-1.5 text-xs text-[#F8FAFC] focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              <option value="Raw Materials">Raw Materials</option>
              <option value="Electrical">Electrical</option>
              <option value="Hardware">Hardware</option>
              <option value="Finished Goods">Finished Goods</option>
              <option value="Components">Components</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase text-[#64748B]">Warehouse</label>
            <select
              value={selectedWarehouse}
              onChange={(e) => setSelectedWarehouse(e.target.value)}
              className="w-full bg-[#0B0D10] border border-[#292D35] rounded-lg px-2.5 py-1.5 text-xs text-[#F8FAFC] focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Warehouses</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  [{w.code}] {w.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase text-[#64748B]">Health Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-[#0B0D10] border border-[#292D35] rounded-lg px-2.5 py-1.5 text-xs text-[#F8FAFC] focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="in_stock">In Stock (&gt; Safe Level)</option>
              <option value="low_stock">Low Stock (&lt; Threshold)</option>
              <option value="out_of_stock">Out of Stock (Zero)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase text-[#64748B]">Sort Order</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full bg-[#0B0D10] border border-[#292D35] rounded-lg px-2.5 py-1.5 text-xs text-[#F8FAFC] focus:outline-none cursor-pointer"
            >
              <option value="name">Product Name</option>
              <option value="sku">SKU Code</option>
              <option value="stock">Stock Available</option>
            </select>
          </div>
        </div>

        {/* Quick Reset tag */}
        {(selectedCategory !== 'ALL' || selectedWarehouse !== 'ALL' || selectedStatus !== 'ALL' || searchQuery) && (
          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-[#94A3B8]">Active filters applied</span>
            <button
              onClick={resetFilters}
              className="text-[11px] font-mono text-[#F59E0B] hover:underline"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>

      {/* Product List / Table Display */}
      {viewMode === 'table' ? (
        <div className="bg-[#171A20] border border-[#292D35] rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#0E1015] text-[#94A3B8] font-mono uppercase text-[10px] tracking-wider border-b border-[#292D35]">
                  <th className="py-3 px-4 w-10">
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={selectedRows.length > 0 && selectedRows.length === filteredProducts.length}
                      className="rounded bg-[#171A20] border-[#292D35] text-[#F59E0B] focus:ring-0 cursor-pointer"
                    />
                  </th>
                  <th className="py-3 px-4 font-semibold">Product &amp; SKU</th>
                  <th className="py-3 px-4 font-semibold">Category</th>
                  <th className="py-3 px-4 font-semibold">UoM</th>
                  <th className="py-3 px-4 font-semibold text-right">Available</th>
                  <th className="py-3 px-4 font-semibold text-right">Reserved</th>
                  <th className="py-3 px-4 font-semibold text-right">Reorder Level</th>
                  <th className="py-3 px-4 font-semibold">Primary Location</th>
                  <th className="py-3 px-4 font-semibold text-center">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#292D35]/50">
                {filteredProducts.map((p) => {
                  let status = 'In Stock';
                  if (p.availableStock <= 0) status = 'Out of Stock';
                  else if (p.availableStock <= p.reorderLevel) status = 'Low Stock';

                  const isChecked = selectedRows.includes(p.id);

                  return (
                    <tr
                      key={p.id}
                      onClick={() => handleRowClick(p.id)}
                      className={`hover:bg-[#1E222A]/70 transition-colors cursor-pointer group ${
                        isChecked ? 'bg-[#1E222A]/50' : ''
                      }`}
                    >
                      <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleRow(p.id)}
                          className="rounded bg-[#171A20] border-[#292D35] text-[#F59E0B] focus:ring-0 cursor-pointer"
                        />
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-[#F8FAFC] group-hover:text-[#F59E0B] transition-colors truncate max-w-[220px]">
                          {p.name}
                        </div>
                        <div className="font-mono text-[10px] text-[#94A3B8]">
                          SKU: <span className="text-[#F8FAFC]">{p.sku}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[#0B0D10] text-[#94A3B8]">
                          {p.category}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono text-[#94A3B8]">{p.unit}</td>

                      <td
                        className={`py-3 px-4 text-right font-mono font-bold text-xs ${
                          p.availableStock <= 0
                            ? 'text-[#EF4444]'
                            : p.availableStock <= p.reorderLevel
                            ? 'text-[#F59E0B]'
                            : 'text-[#22C55E]'
                        }`}
                      >
                        {p.availableStock.toLocaleString()}
                      </td>

                      <td className="py-3 px-4 text-right font-mono text-[#94A3B8]">{p.reserved}</td>

                      <td className="py-3 px-4 text-right font-mono text-[#94A3B8]">{p.reorderLevel}</td>

                      <td className="py-3 px-4 font-mono text-xs text-[#F8FAFC]">
                        <div>{p.warehouseName.split(' ')[0]}</div>
                        <span className="text-[10px] text-[#94A3B8]">{p.primaryLocation}</span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <StatusBadge status={status} size="sm" pulse={status !== 'In Stock'} />
                      </td>

                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleRowClick(p.id)}
                            className="p-1 rounded text-[#94A3B8] hover:text-[#F59E0B] hover:bg-[#0B0D10] transition-colors"
                            title="View Product Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setActiveModal('newTransfer')}
                            className="p-1 rounded text-[#94A3B8] hover:text-[#3B82F6] hover:bg-[#0B0D10] transition-colors"
                            title="Internal Transfer"
                          >
                            <ArrowLeftRight className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteProduct(p.id)}
                            className="p-1 rounded text-[#94A3B8] hover:text-[#EF4444] hover:bg-[#0B0D10] transition-colors"
                            title="Delete SKU"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid Cards View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((p) => {
            let status = 'In Stock';
            if (p.availableStock <= 0) status = 'Out of Stock';
            else if (p.availableStock <= p.reorderLevel) status = 'Low Stock';

            return (
              <div
                key={p.id}
                onClick={() => handleRowClick(p.id)}
                className="bg-[#171A20] border border-[#292D35] hover:border-[#F59E0B]/50 p-4 rounded-xl shadow-sm cursor-pointer transition-all space-y-3 group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-bold text-[#F8FAFC] group-hover:text-[#F59E0B] transition-colors line-clamp-1">
                      {p.name}
                    </h3>
                    <span className="font-mono text-[10px] text-[#94A3B8]">{p.sku}</span>
                  </div>
                  <StatusBadge status={status} size="sm" />
                </div>

                <div className="p-2.5 rounded-lg bg-[#0B0D10] border border-[#292D35]/50 grid grid-cols-2 gap-2 text-center font-mono">
                  <div>
                    <span className="text-[10px] uppercase text-[#64748B] block">Available</span>
                    <span
                      className={`text-sm font-bold ${
                        p.availableStock <= 0
                          ? 'text-[#EF4444]'
                          : p.availableStock <= p.reorderLevel
                          ? 'text-[#F59E0B]'
                          : 'text-[#22C55E]'
                      }`}
                    >
                      {p.availableStock} {p.unit}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-[#64748B] block">Reorder Buffer</span>
                    <span className="text-sm font-medium text-[#94A3B8]">
                      {p.reorderLevel} {p.unit}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#94A3B8]">
                  <span>{p.category}</span>
                  <span className="font-mono">{p.primaryLocation}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
