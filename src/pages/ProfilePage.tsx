import React, { useState } from 'react';
import { useInventory } from '../store/inventoryStore';
import { User, Mail, Shield, Building, Phone, Clock, Key, Bell, Save } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { currentUser, updateUserProfile, warehouses, showToast } = useInventory();

  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [role, setRole] = useState(currentUser.role);
  const [department, setDepartment] = useState(currentUser.department);
  const [assignedWhId, setAssignedWhId] = useState(currentUser.assignedWarehouseId);
  const [phone, setPhone] = useState(currentUser.phone);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const wh = warehouses.find((w) => w.id === assignedWhId);
    updateUserProfile({
      name: name.trim(),
      email: email.trim(),
      role: role.trim(),
      department: department.trim(),
      assignedWarehouseId: assignedWhId,
      assignedWarehouseName: wh ? wh.name : currentUser.assignedWarehouseName,
      phone: phone.trim(),
    });
  };

  return (
    <div className="space-y-5 pb-8 max-w-4xl">
      {/* Header Profile Hero Card */}
      <div className="bg-[#171A20] border border-[#292D35] p-5 sm:p-6 rounded-xl shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 rounded-full bg-[#1E222A] border-2 border-[#F59E0B] flex items-center justify-center font-bold text-xl text-[#F59E0B] overflow-hidden shadow-lg">
            AS
            <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-[#22C55E] border-2 border-[#111318] rounded-full" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#F8FAFC]">{currentUser.name}</h1>
            <p className="text-xs text-[#F59E0B] font-mono">{currentUser.role}</p>
            <span className="text-[11px] text-[#94A3B8] font-mono block mt-0.5">
              Assigned Site: {currentUser.assignedWarehouseName}
            </span>
          </div>
        </div>

        <div className="text-right font-mono text-xs">
          <span className="text-[#64748B] block text-[10px]">Session Status</span>
          <span className="text-[#22C55E] font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
            Active Session
          </span>
          <span className="text-[10px] text-[#94A3B8] mt-1 block">Login: {currentUser.lastLogin}</span>
        </div>
      </div>

      {/* Personal Information Form */}
      <form onSubmit={handleSave} className="bg-[#171A20] border border-[#292D35] rounded-xl p-5 shadow-md space-y-4">
        <h3 className="text-sm font-bold text-[#F8FAFC] flex items-center gap-2">
          <User className="w-4 h-4 text-[#F59E0B]" />
          <span>Personal Information</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[11px] font-mono uppercase text-[#94A3B8]">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#0B0D10] border border-[#292D35] focus:border-[#F59E0B] rounded-lg px-3 py-2 text-xs text-[#F8FAFC] focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-mono uppercase text-[#94A3B8]">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#0B0D10] border border-[#292D35] focus:border-[#F59E0B] rounded-lg px-3 py-2 text-xs text-[#F8FAFC] focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-mono uppercase text-[#94A3B8]">Role / Designation</label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-[#0B0D10] border border-[#292D35] focus:border-[#F59E0B] rounded-lg px-3 py-2 text-xs text-[#F8FAFC] focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-mono uppercase text-[#94A3B8]">Department</label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full bg-[#0B0D10] border border-[#292D35] focus:border-[#F59E0B] rounded-lg px-3 py-2 text-xs text-[#F8FAFC] focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-mono uppercase text-[#94A3B8]">Primary Facility</label>
            <select
              value={assignedWhId}
              onChange={(e) => setAssignedWhId(e.target.value)}
              className="w-full bg-[#0B0D10] border border-[#292D35] focus:border-[#F59E0B] rounded-lg px-3 py-2 text-xs text-[#F8FAFC] focus:outline-none cursor-pointer"
            >
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  [{w.code}] {w.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-mono uppercase text-[#94A3B8]">Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-[#0B0D10] border border-[#292D35] focus:border-[#F59E0B] rounded-lg px-3 py-2 text-xs text-[#F8FAFC] focus:outline-none"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2 bg-[#F59E0B] hover:bg-[#D97706] text-[#0B0D10] text-xs font-bold rounded-lg shadow-sm transition-all"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Profile Preferences</span>
          </button>
        </div>
      </form>

      {/* Security & Access Keys */}
      <div className="bg-[#171A20] border border-[#292D35] rounded-xl p-5 shadow-md space-y-4">
        <h3 className="text-sm font-bold text-[#F8FAFC] flex items-center gap-2">
          <Key className="w-4 h-4 text-[#F59E0B]" />
          <span>Security &amp; Hardware Signatures</span>
        </h3>

        <div className="space-y-3">
          <div className="p-3 bg-[#0B0D10] border border-[#292D35] rounded-lg flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-[#F8FAFC] block">
                Two-Factor Hardware Authentication
              </span>
              <span className="text-[11px] text-[#94A3B8]">
                FIDO2 / YubiKey physical security key enabled for high-value dispatch approvals.
              </span>
            </div>
            <span className="font-mono text-xs text-[#22C55E] font-bold">ACTIVE</span>
          </div>

          <div className="p-3 bg-[#0B0D10] border border-[#292D35] rounded-lg flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-[#F8FAFC] block">
                Cryptographic Operator Key
              </span>
              <span className="text-[11px] font-mono text-[#64748B]">
                Fingerprint: 0x9A48...22F0 (Signed on block #48,209)
              </span>
            </div>
            <button
              type="button"
              onClick={() => showToast('Key Regenerated', 'Operator signature key rotation completed.', 'success')}
              className="text-xs font-mono text-[#F59E0B] hover:underline"
            >
              Rotate Key
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
