import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Upload, 
  FileText, 
  ChevronRight, 
  Search, 
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  Download,
  Filter,
  X,
  TrendingUp,
  Plus,
  Bus,
  Car,
  Star,
  Trash2,
  Users,
  LogOut,
  Shield,
  Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, addDays, isWithinInterval, parseISO, differenceInDays, isValid } from 'date-fns';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { cn } from './lib/utils';
import { Customer, FollowUp, BucketType, INSURANCE_COMPANIES, User, Log } from './types';

const MONTHS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

const YEARS = [2026, 2027, 2028, 2029, 2030];

// --- Components ---

const Login = ({ onLogin }: { onLogin: (user: User) => void }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // Simulate a network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Hardcoded credentials for AnuvartiTrack
    if (username === 'admin' && password === 'password') {
      const user: User = { 
        id: 1, 
        username: 'admin', 
        role: 'admin' 
      };
      onLogin(user);
    } else {
      setError('Invalid username or password');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl w-full max-w-md shadow-2xl"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white">AnuvartiTrack Login</h1>
          <p className="text-zinc-500 mt-2">Enter your credentials to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5 uppercase font-bold">Username</label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <input 
                type="text" 
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all"
                placeholder="Enter username"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-zinc-500 mb-1.5 uppercase font-bold">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all"
                placeholder="Enter password"
                required
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm flex items-center gap-2">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-900/20 disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleResetPassword = async (userId: number) => {
    const newPassword = prompt('Enter new password:');
    if (!newPassword) return;

    try {
      const res = await fetch('/api/users/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, newPassword })
      });
      if (res.ok) {
        alert('Password reset successfully');
      }
    } catch (err) {
      alert('Failed to reset password');
    }
  };

  if (loading) return <div className="p-8 text-zinc-500">Loading users...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="text-zinc-500 text-xs uppercase tracking-wider border-b border-zinc-800">
              <th className="px-6 py-4 font-semibold">Username</th>
              <th className="px-6 py-4 font-semibold">Role</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-zinc-800/50 transition-colors">
                <td className="px-6 py-4 font-medium text-white">{u.username}</td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                    u.role === 'admin' ? "bg-purple-500/10 text-purple-500" : "bg-zinc-800 text-zinc-400"
                  )}>
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => handleResetPassword(u.id)}
                    className="text-xs font-bold text-emerald-500 hover:text-emerald-400 transition-colors"
                  >
                    Reset Password
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const LogsView = () => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/logs');
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  if (loading) return <div className="p-8 text-zinc-500">Loading logs...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="text-zinc-500 text-xs uppercase tracking-wider border-b border-zinc-800">
              <th className="px-6 py-4 font-semibold">User</th>
              <th className="px-6 py-4 font-semibold">Action</th>
              <th className="px-6 py-4 font-semibold">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {logs.map(l => (
              <tr key={l.id} className="hover:bg-zinc-800/50 transition-colors">
                <td className="px-6 py-4 font-medium text-white">{l.username}</td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                    l.action === 'login' ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                  )}>
                    {l.action}
                  </span>
                </td>
                <td className="px-6 py-4 text-zinc-400 text-sm">
                  {format(parseISO(l.timestamp), 'dd MMM yyyy, HH:mm:ss')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const safeParseDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return null;
  const s = String(dateStr).trim();
  let date: Date | null = null;

  // 1. Try parseISO
  const isoDate = parseISO(s);
  if (isValid(isoDate)) {
    date = isoDate;
  }
  
  // 2. Try DD/MM/YYYY or DD-MM-YYYY (Common in Indian Excel sheets)
  if (!date) {
    const ddmmyyyy = /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/;
    const match = s.match(ddmmyyyy);
    if (match) {
      const d = parseInt(match[1], 10);
      const m = parseInt(match[2], 10) - 1;
      const y = parseInt(match[3], 10);
      const ddmmyyDate = new Date(y, m, d);
      if (isValid(ddmmyyDate)) date = ddmmyyDate;
    }
  }

  // 3. Try standard Date constructor
  if (!date) {
    const fallbackDate = new Date(s);
    if (isValid(fallbackDate)) date = fallbackDate;
  }
  
  if (!date || !isValid(date)) return null;

  // Smart Year Adjustment: 
  // User said "Upload old data of customers of last year... For current year, we need to create buckets"
  // If the date is from a previous year, we adjust it to the current year to calculate the upcoming renewal.
  const today = new Date();
  if (date.getFullYear() < today.getFullYear()) {
    const adjustedDate = new Date(date);
    adjustedDate.setFullYear(today.getFullYear());
    return adjustedDate;
  }

  return date;
};

const Sidebar = ({ activeTab, setActiveTab, onNewCustomer, user, onLogout }: { activeTab: string, setActiveTab: (t: string) => void, onNewCustomer: () => void, user: User, onLogout: () => void }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Monthly Overview', icon: LayoutDashboard, roles: ['admin'] },
    { id: 'buckets', label: 'Bucket View', icon: Clock, roles: ['admin', 'user'] },
    { id: 'bus-working', label: 'Bus Working', icon: Bus, roles: ['admin', 'user'] },
    { id: 'bus', label: 'Bus Policies', icon: Bus, roles: ['admin', 'user'] },
    { id: 'others', label: 'Other Policies', icon: Car, roles: ['admin', 'user'] },
    { id: 'new-business', label: 'New Business', icon: Star, roles: ['admin', 'user'] },
    { id: 'upload', label: 'Upload Data', icon: Upload, roles: ['admin'] },
    { id: 'reports', label: 'Reports', icon: FileText, roles: ['admin'] },
    { id: 'users', label: 'User Management', icon: Users, roles: ['admin'] },
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(user.role));

  return (
    <div className="w-64 bg-zinc-950 text-zinc-400 h-screen fixed left-0 top-0 border-r border-zinc-800 flex flex-col">
      <div className="p-6 border-bottom border-zinc-800">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <CheckCircle2 className="text-emerald-500" />
          AnuvartiTrack
        </h1>
        <div className="mt-2 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">{user.username} ({user.role})</span>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        <button
          onClick={onNewCustomer}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 bg-emerald-600/10 text-emerald-500 hover:bg-emerald-600/20 mb-4 border border-emerald-500/20"
        >
          <Plus size={20} />
          <span className="font-bold">New Customer</span>
        </button>

        {filteredItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
              activeTab === item.id 
                ? "bg-zinc-900 text-white shadow-lg" 
                : "hover:bg-zinc-900 hover:text-zinc-200"
            )}
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-zinc-800">
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-all font-bold"
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </div>
    </div>
  );
};

const BucketCard = ({ type, count, onClick, active }: { type: BucketType, count: number, onClick: () => void, active: boolean }) => {
  const configs = {
    '7days': { label: 'Due in 0-7 Days', color: 'bg-red-500', border: 'border-red-500/20', text: 'text-red-500', icon: AlertCircle },
    '15days': { label: 'Due in 8-15 Days', color: 'bg-blue-500', border: 'border-blue-500/20', text: 'text-blue-500', icon: Clock },
    '30days': { label: 'Due in 16-31 Days', color: 'bg-emerald-500', border: 'border-emerald-500/20', text: 'text-emerald-500', icon: Calendar },
  };

  const config = configs[type];

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-1 p-6 rounded-2xl border transition-all duration-300 text-left relative overflow-hidden group",
        active ? `${config.border} bg-zinc-900 ring-2 ring-offset-2 ring-offset-zinc-950 ring-${type === '7days' ? 'red' : type === '15days' ? 'blue' : 'emerald'}-500/50` : "border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900"
      )}
    >
      <div className={cn("absolute top-0 right-0 w-32 h-32 opacity-5 transition-transform duration-500 group-hover:scale-110", config.color)} style={{ clipPath: 'circle(50% at 100% 0%)' }} />
      <div className="flex items-start justify-between mb-4">
        <div className={cn("p-3 rounded-xl bg-opacity-10", config.color.replace('bg-', 'bg-opacity-10 bg-'))}>
          <config.icon className={config.text} size={24} />
        </div>
        <span className={cn("text-3xl font-bold", config.text)}>{count}</span>
      </div>
      <h3 className="text-zinc-400 font-medium mb-1">{config.label}</h3>
      <p className="text-xs text-zinc-500">Policies requiring attention</p>
    </button>
  );
};

const NewCustomerModal = ({ onClose, onSave }: { onClose: () => void, onSave: (data: any) => void }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    refContact: '',
    isExistingOrNew: 'New Customer',
    customerType: 'A',
    referredBy: '',
    segment: 'Bus',
    // Bus specific
    busType: 'New',
    previousInsuranceCompany: '',
    insuranceExpiryDate: '',
    usage: 'School Owned Bus',
    permit: 'CC Permit',
    registrationNumber: '',
    seatingCapacity: '',
    idvValue: 0,
    manufacturingYear: '',
    grossPremium: 0,
    netPremium: 0,
    cbPercentage: 0,
    cbValue: 0,
    finalPaymentAmount: 0,
    followUpDate: format(new Date(), 'yyyy-MM-dd'),
    status: 'Policy Made',
    feedback: '',
    proposalNumber: '',
    newPolicyNumber: '',
    chosenCompany: '',
    otherCompanyName: '',
    coCommissionPercentage: 0,
    commissionAmount: 0,
    profitAmount: 0,
    rcCollected: 'No',
    panCollected: 'No',
    gstRecorded: 'No'
  });

  useEffect(() => {
    const isHealthOrTypeC = formData.segment === 'Health' || formData.customerType === 'C';
    const net = isHealthOrTypeC ? formData.grossPremium : Number((formData.grossPremium / 1.18).toFixed(2));
    const cbVal = Number((net * (formData.cbPercentage / 100)).toFixed(2));
    const final = Number((formData.grossPremium - cbVal).toFixed(2));
    
    const commAmt = Number((net * (formData.coCommissionPercentage / 100)).toFixed(2));
    const profit = Number((commAmt - cbVal).toFixed(2));
    
    setFormData(prev => ({
      ...prev,
      netPremium: net,
      cbValue: cbVal,
      finalPaymentAmount: final,
      commissionAmount: commAmt,
      profitAmount: profit
    }));
  }, [formData.grossPremium, formData.cbPercentage, formData.coCommissionPercentage, formData.segment, formData.customerType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
      >
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
          <div>
            <h2 className="text-xl font-bold text-white">Add New Customer</h2>
            <p className="text-zinc-500 text-sm">Enter detailed policy information for 2026</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full transition-colors">
            <X size={20} className="text-zinc-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Details */}
            <section>
              <h3 className="text-sm font-semibold text-emerald-500 uppercase tracking-wider mb-6 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Basic Customer Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs text-zinc-500 mb-1.5 uppercase font-semibold">Customer Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1.5 uppercase font-semibold">Customer Email</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1.5 uppercase font-semibold">Ref Name / Phone No.</label>
                  <input 
                    type="text" 
                    value={formData.refContact}
                    onChange={e => setFormData({...formData, refContact: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1.5 uppercase font-semibold">Customer Status</label>
                  <select 
                    value={formData.isExistingOrNew}
                    onChange={e => setFormData({...formData, isExistingOrNew: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all"
                  >
                    <option value="New Customer">New Customer</option>
                    <option value="Existing Customer">Existing Customer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1.5 uppercase font-semibold">Customer Type</label>
                  <select 
                    value={formData.customerType}
                    onChange={e => setFormData({...formData, customerType: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all"
                  >
                    <option value="A">Type A</option>
                    <option value="B">Type B</option>
                    <option value="C">Type C</option>
                    <option value="D">Type D</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1.5 uppercase font-semibold">Referred By</label>
                  <input 
                    type="text" 
                    value={formData.referredBy}
                    onChange={e => setFormData({...formData, referredBy: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1.5 uppercase font-semibold">Segment</label>
                  <select 
                    value={formData.segment}
                    onChange={e => setFormData({...formData, segment: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all"
                  >
                    <option value="Bus">Bus</option>
                    <option value="Car">Car</option>
                    <option value="Health">Health</option>
                    <option value="SME">SME</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Segment Specific Details */}
            {formData.segment === 'Bus' && (
              <section>
                <h3 className="text-sm font-semibold text-blue-500 uppercase tracking-wider mb-6 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  Bus Specific Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1.5 uppercase font-semibold">Bus Type</label>
                    <select 
                      value={formData.busType}
                      onChange={e => setFormData({...formData, busType: e.target.value})}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                    >
                      <option value="New">New</option>
                      <option value="Used Bus">Used Bus</option>
                      <option value="Roll Over">Roll Over</option>
                    </select>
                  </div>
                  
                  {(formData.busType === 'Used Bus' || formData.busType === 'Roll Over') && (
                    <>
                      <div>
                        <label className="block text-xs text-zinc-500 mb-1.5 uppercase font-semibold">Previous Insurance Company</label>
                        <input 
                          type="text" 
                          value={formData.previousInsuranceCompany}
                          onChange={e => setFormData({...formData, previousInsuranceCompany: e.target.value})}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-zinc-500 mb-1.5 uppercase font-semibold">Insurance Expiry Date</label>
                        <input 
                          type="date" 
                          value={formData.insuranceExpiryDate}
                          onChange={e => setFormData({...formData, insuranceExpiryDate: e.target.value})}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-xs text-zinc-500 mb-1.5 uppercase font-semibold">Usage</label>
                    <select 
                      value={formData.usage}
                      onChange={e => setFormData({...formData, usage: e.target.value})}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                    >
                      <option value="School Owned Bus">School Owned Bus</option>
                      <option value="School Contract">School Contract</option>
                      <option value="Staff Contract">Staff Contract</option>
                      <option value="Route Bus">Route Bus</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1.5 uppercase font-semibold">Permit</label>
                    <select 
                      value={formData.permit}
                      onChange={e => setFormData({...formData, permit: e.target.value})}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                    >
                      <option value="CC Permit">CC Permit</option>
                      <option value="All India Permit">All India Permit</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1.5 uppercase font-semibold">Registration Number</label>
                    <input 
                      type="text" 
                      value={formData.registrationNumber}
                      onChange={e => setFormData({...formData, registrationNumber: e.target.value})}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1.5 uppercase font-semibold">Seating Capacity</label>
                    <input 
                      type="text" 
                      value={formData.seatingCapacity}
                      onChange={e => setFormData({...formData, seatingCapacity: e.target.value})}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1.5 uppercase font-semibold">IDV / Invoice Value</label>
                    <input 
                      type="number" 
                      value={formData.idvValue}
                      onChange={e => setFormData({...formData, idvValue: Number(e.target.value)})}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1.5 uppercase font-semibold">Manufacturing Year</label>
                    <input 
                      type="text" 
                      value={formData.manufacturingYear}
                      onChange={e => setFormData({...formData, manufacturingYear: e.target.value})}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                    />
                  </div>
                </div>
              </section>
            )}

            {/* Premium Calculations */}
            <section>
              <h3 className="text-sm font-semibold text-amber-500 uppercase tracking-wider mb-6 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Premium & Calculations
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs text-zinc-500 mb-1.5 uppercase font-semibold">Gross Premium</label>
                  <input 
                    type="number" 
                    value={formData.grossPremium}
                    onChange={e => setFormData({...formData, grossPremium: Number(e.target.value)})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-amber-500/50 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1.5 uppercase font-semibold">Net Premium (Auto)</label>
                  <div className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-400 font-medium">
                    ₹{formData.netPremium.toLocaleString()}
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1.5 uppercase font-semibold">CB %</label>
                  <input 
                    type="number" 
                    value={formData.cbPercentage}
                    onChange={e => setFormData({...formData, cbPercentage: Number(e.target.value)})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-amber-500/50 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1.5 uppercase font-semibold">CB Value (Auto)</label>
                  <div className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-400 font-medium">
                    ₹{formData.cbValue.toLocaleString()}
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1.5 uppercase font-semibold">Final Payment (Auto)</label>
                  <div className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-emerald-500 font-bold">
                    ₹{formData.finalPaymentAmount.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <div>
                  <label className="block text-xs text-zinc-500 mb-1.5 uppercase font-semibold">Co. Commission %</label>
                  <input 
                    type="number" 
                    value={formData.coCommissionPercentage}
                    onChange={e => setFormData({...formData, coCommissionPercentage: Number(e.target.value)})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-amber-500/50 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1.5 uppercase font-semibold">Commission Amt (Auto)</label>
                  <div className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-400 font-medium">
                    ₹{formData.commissionAmount.toLocaleString()}
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1.5 uppercase font-semibold">Profit Amt (Auto)</label>
                  <div className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-emerald-500 font-bold">
                    ₹{formData.profitAmount.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                {[
                  { label: 'RC Collected', key: 'rcCollected' },
                  { label: 'PAN Collected', key: 'panCollected' },
                  { label: 'GST Recorded', key: 'gstRecorded' },
                ].map(check => (
                  <div key={check.key}>
                    <label className="block text-xs text-zinc-500 mb-1.5 uppercase font-semibold">{check.label}</label>
                    <select 
                      value={(formData as any)[check.key]}
                      onChange={e => setFormData({...formData, [check.key]: e.target.value})}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-amber-500/50 outline-none transition-all"
                    >
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block text-xs text-zinc-500 mb-1.5 uppercase font-semibold">Insurance Company</label>
                  <select 
                    value={formData.chosenCompany}
                    onChange={e => setFormData({...formData, chosenCompany: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-amber-500/50 outline-none transition-all"
                  >
                    <option value="">Select Company</option>
                    {INSURANCE_COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                {formData.chosenCompany === 'Others' && (
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1.5 uppercase font-semibold">Specify Company</label>
                    <input 
                      type="text" 
                      value={formData.otherCompanyName}
                      onChange={e => setFormData({...formData, otherCompanyName: e.target.value})}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-amber-500/50 outline-none transition-all"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block text-xs text-zinc-500 mb-1.5 uppercase font-semibold">Proposal Number</label>
                  <input 
                    type="text" 
                    value={formData.proposalNumber}
                    onChange={e => setFormData({...formData, proposalNumber: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-amber-500/50 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1.5 uppercase font-semibold">New Policy Number</label>
                  <input 
                    type="text" 
                    value={formData.newPolicyNumber}
                    onChange={e => setFormData({...formData, newPolicyNumber: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-amber-500/50 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-xs text-zinc-500 mb-1.5 uppercase font-semibold">Customer Feedback</label>
                <textarea 
                  value={formData.feedback}
                  onChange={e => setFormData({...formData, feedback: e.target.value})}
                  placeholder="Enter feedback..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-amber-500/50 outline-none transition-all h-24 resize-none"
                />
              </div>
            </section>

            <div className="pt-8 border-t border-zinc-800">
              <button 
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-emerald-900/20 flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={20} />
                Save New Customer & Policy
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

const PolicyModal = ({ customer, onClose, onSave }: { customer: any, onClose: () => void, onSave: (data: any) => void }) => {
  const [formData, setFormData] = useState({
    followUpDate: customer.followUpDate || format(new Date(), 'yyyy-MM-dd'),
    feedback: customer.feedback || '',
    proposalNumber: customer.proposalNumber || '',
    newPolicyNumber: customer.newPolicyNumber || '',
    chosenCompany: customer.chosenCompany || '',
    otherCompanyName: customer.otherCompanyName || '',
    grossPremium: customer.currentGrossPremium || 0,
    netPremium: customer.currentNetPremium || 0,
    cbPercentage: customer.cbPercentage || 0,
    cbValue: customer.cbValue || 0,
    finalPaymentAmount: customer.finalPaymentAmount || 0,
    coCommissionPercentage: customer.coCommissionPercentage || 0,
    commissionAmount: customer.commissionAmount || 0,
    profitAmount: customer.profitAmount || 0,
    rcCollected: customer.rcCollected || 'No',
    panCollected: customer.panCollected || 'No',
    gstRecorded: customer.gstRecorded || 'No',
    cbStatus: customer.cbStatus || 'Unpaid',
    paymentMode: customer.paymentMode || '',
    paymentDate: customer.paymentDate || '',
    status: customer.status || 'Follow-up Only'
  });

  useEffect(() => {
    const isHealthOrTypeC = customer.segment === 'Health' || customer.type === 'Type C';
    const net = isHealthOrTypeC ? formData.grossPremium : Number((formData.grossPremium / 1.18).toFixed(2));
    const cbVal = Number((net * (formData.cbPercentage / 100)).toFixed(2));
    const final = Number((formData.grossPremium - cbVal).toFixed(2));
    
    const commAmt = Number((net * (formData.coCommissionPercentage / 100)).toFixed(2));
    const profit = Number((commAmt - cbVal).toFixed(2));
    
    setFormData(prev => ({
      ...prev,
      netPremium: net,
      cbValue: cbVal,
      finalPaymentAmount: final,
      commissionAmount: commAmt,
      profitAmount: profit
    }));
  }, [formData.grossPremium, formData.cbPercentage, formData.coCommissionPercentage, customer.segment, customer.type]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, customerId: customer.id });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
      >
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
          <div>
            <h2 className="text-xl font-bold text-white">{customer.name}</h2>
            <p className="text-zinc-500 text-sm">{customer.registrationNumber} • {customer.refContact}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full transition-colors">
            <X size={20} className="text-zinc-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Last Year Details */}
            <section>
              <h3 className="text-sm font-semibold text-emerald-500 uppercase tracking-wider mb-6 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Last Year Details
              </h3>
              <div className="space-y-4">
                {[
                  { label: 'S. No.', value: customer.sNo || 'New' },
                  { label: 'Policy No.', value: customer.policyNumber || 'N/A' },
                  { label: 'Company', value: customer.company || 'N/A' },
                  { label: 'Issue Date', value: customer.lastYearIssueDate || 'N/A' },
                  { label: 'Renewal Date', value: safeParseDate(customer.expiryDate) ? format(safeParseDate(customer.expiryDate)!, 'dd MMM yyyy') : 'N/A' },
                  { label: 'Type', value: customer.type },
                  { label: 'Segment', value: customer.segment },
                  { label: 'Gross Premium', value: `₹${(customer.grossPremium || 0).toLocaleString()}` },
                  { label: 'Net Premium', value: `₹${(customer.netPremium || 0).toLocaleString()}` },
                  { label: 'LY CB %', value: `${customer.lyCbPercentage || 0}%` },
                ].map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center py-2 border-b border-zinc-800/50">
                    <span className="text-zinc-500 text-sm">{item.label}</span>
                    <span className="text-zinc-200 font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Follow-up Form */}
            <section>
              <h3 className="text-sm font-semibold text-blue-500 uppercase tracking-wider mb-6 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                Current Follow-up
              </h3>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1.5 uppercase font-semibold">Follow-up Date</label>
                    <input 
                      type="date" 
                      value={formData.followUpDate}
                      onChange={e => setFormData({...formData, followUpDate: e.target.value})}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1.5 uppercase font-semibold">Status</label>
                    <select 
                      value={formData.status}
                      onChange={e => setFormData({...formData, status: e.target.value as any})}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                    >
                      <option value="Follow-up Only">Follow-up Only</option>
                      <option value="Proposal Pending">Proposal Pending</option>
                      <option value="Proposal Made">Proposal Made</option>
                      <option value="Policy Made">Policy Made</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-zinc-500 mb-1.5 uppercase font-semibold">Customer Feedback</label>
                  <textarea 
                    value={formData.feedback}
                    onChange={e => setFormData({...formData, feedback: e.target.value})}
                    placeholder="Enter feedback from the call..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all h-24 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1.5 uppercase font-semibold">Proposal Number</label>
                    <input 
                      type="text" 
                      value={formData.proposalNumber}
                      onChange={e => setFormData({...formData, proposalNumber: e.target.value})}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1.5 uppercase font-semibold">New Policy Number</label>
                    <input 
                      type="text" 
                      value={formData.newPolicyNumber}
                      onChange={e => setFormData({...formData, newPolicyNumber: e.target.value})}
                      disabled={formData.status !== 'Policy Made'}
                      placeholder={formData.status !== 'Policy Made' ? 'Only for Policy Made' : 'Enter policy number'}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1.5 uppercase font-semibold">Gross Premium</label>
                    <input 
                      type="number" 
                      value={formData.grossPremium}
                      onChange={e => setFormData({...formData, grossPremium: Number(e.target.value)})}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1.5 uppercase font-semibold">Net Premium (Auto)</label>
                    <div className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-400 font-medium">
                      ₹{formData.netPremium.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1.5 uppercase font-semibold">CB %</label>
                    <input 
                      type="number" 
                      value={formData.cbPercentage}
                      onChange={e => setFormData({...formData, cbPercentage: Number(e.target.value)})}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1.5 uppercase font-semibold">CB Value (Auto)</label>
                    <div className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-400 font-medium">
                      ₹{formData.cbValue.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1.5 uppercase font-semibold">Final Payment (Auto)</label>
                    <div className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-emerald-500 font-bold">
                      ₹{formData.finalPaymentAmount.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1.5 uppercase font-semibold">Insurance Company</label>
                    <select 
                      value={formData.chosenCompany}
                      onChange={e => setFormData({...formData, chosenCompany: e.target.value})}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                    >
                      <option value="">Select Company</option>
                      {INSURANCE_COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  {formData.chosenCompany === 'Others' && (
                    <div>
                      <label className="block text-xs text-zinc-500 mb-1.5 uppercase font-semibold">Specify Company</label>
                      <input 
                        type="text" 
                        value={formData.otherCompanyName}
                        onChange={e => setFormData({...formData, otherCompanyName: e.target.value})}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1.5 uppercase font-semibold">Co. Commission %</label>
                    <input 
                      type="number" 
                      value={formData.coCommissionPercentage}
                      onChange={e => setFormData({...formData, coCommissionPercentage: Number(e.target.value)})}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1.5 uppercase font-semibold">Commission Amt (Auto)</label>
                    <div className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-400 font-medium">
                      ₹{formData.commissionAmount.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1.5 uppercase font-semibold">Profit Amt (Auto)</label>
                    <div className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-emerald-500 font-bold">
                      ₹{formData.profitAmount.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'RC Collected', key: 'rcCollected' },
                    { label: 'PAN Collected', key: 'panCollected' },
                    { label: 'GST Recorded', key: 'gstRecorded' },
                  ].map(check => (
                    <div key={check.key}>
                      <label className="block text-[10px] text-zinc-500 mb-1.5 uppercase font-bold">{check.label}</label>
                      <select 
                        value={(formData as any)[check.key]}
                        onChange={e => setFormData({...formData, [check.key]: e.target.value})}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                      >
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                      </select>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1.5 uppercase font-semibold">CB Status</label>
                    <select 
                      value={formData.cbStatus}
                      onChange={e => setFormData({...formData, cbStatus: e.target.value})}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                    >
                      <option value="Unpaid">Unpaid</option>
                      <option value="Paid">Paid</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1.5 uppercase font-semibold">Payment Mode</label>
                    <input 
                      type="text" 
                      value={formData.paymentMode}
                      onChange={e => setFormData({...formData, paymentMode: e.target.value})}
                      placeholder="e.g. Cash, UPI, Bank"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1.5 uppercase font-semibold">Payment Date</label>
                    <input 
                      type="date" 
                      value={formData.paymentDate}
                      onChange={e => setFormData({...formData, paymentDate: e.target.value})}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-900/20"
                  >
                    Save Follow-up Details
                  </button>
                </div>
              </form>
            </section>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const BusWorkingFollowUpModal = ({ row, onClose, onSave }: { row: any, onClose: () => void, onSave: (data: any) => void }) => {
  const [formData, setFormData] = useState({
    followUpDate: row.followUpDate || format(new Date(), 'yyyy-MM-dd'),
    feedback: row.feedback || '',
    proposalNumber: row.proposalNumber || '',
    newPolicyNumber: row.newPolicyNumber || '',
    chosenCompany: row.chosenCompany || '',
    otherCompanyName: row.otherCompanyName || '',
    grossPremium: row.currentGrossPremium || 0,
    netPremium: row.currentNetPremium || 0,
    cbPercentage: row.cbPercentage || 0,
    cbValue: row.cbValue || 0,
    coCommissionPercentage: row.coCommissionPercentage || 0,
    commissionAmount: row.commissionAmount || 0,
    profitAmount: row.profitAmount || 0,
    rcCollected: row.rcCollected || 'No',
    panCollected: row.panCollected || 'No',
    gstRecorded: row.gstRecorded || 'No',
    cbStatus: row.cbStatus || 'Unpaid',
    paymentMode: row.paymentMode || '',
    paymentDate: row.paymentDate || '',
    status: row.status || 'Follow-up Only'
  });

  useEffect(() => {
    const segment = row['Segment'] || row['segment'] || '';
    const type = row['Type'] || row['type'] || row['New or Renewal'] || '';
    const isHealthOrTypeC = segment.toLowerCase() === 'health' || type.toLowerCase() === 'type c';
    const net = isHealthOrTypeC ? formData.grossPremium : Number((formData.grossPremium / 1.18).toFixed(2));
    const cbVal = Number((net * (formData.cbPercentage / 100)).toFixed(2));
    
    const commAmt = Number((net * (formData.coCommissionPercentage / 100)).toFixed(2));
    const profit = Number((commAmt - cbVal).toFixed(2));
    
    setFormData(prev => ({
      ...prev,
      netPremium: net,
      cbValue: cbVal,
      commissionAmount: commAmt,
      profitAmount: profit
    }));
  }, [formData.grossPremium, formData.cbPercentage, formData.coCommissionPercentage, row]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
      >
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
          <div>
            <h2 className="text-xl font-bold text-white">{row['Customer Name'] || row['customer name'] || 'Bus Working Row'}</h2>
            <p className="text-zinc-500 text-sm">{row['Regn. No.']} • {row['Ref Name']}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full transition-colors">
            <X size={20} className="text-zinc-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Last Year Details */}
            <section>
              <h3 className="text-sm font-semibold text-emerald-500 uppercase tracking-wider mb-6 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Last Year Details
              </h3>
              <div className="space-y-4">
                {[
                  { label: 'S. No.', value: row['S. No.'] || 'N/A' },
                  { label: 'Remarks', value: row['Remarks'] || 'N/A' },
                  { label: 'Pan Card', value: row['Pan Card'] || 'N/A' },
                  { label: 'HP', value: row['HP'] || 'N/A' },
                  { label: 'Proposal No.', value: row['Proposal No.'] || 'N/A' },
                  { label: 'Address', value: row['Address'] || 'N/A' },
                  { label: 'Customer Name', value: row['Customer Name'] || 'N/A' },
                  { label: 'Ref Name', value: row['Ref Name'] || 'N/A' },
                  { label: 'Previous Ins. Co.', value: row['Previous Ins. Co.'] || 'N/A' },
                  { label: 'Usage', value: row['Usage'] || 'N/A' },
                  { label: 'Expiry Date', value: row['Expiry Date'] || 'N/A' },
                  { label: 'Regn. No.', value: row['Regn. No.'] || 'N/A' },
                  { label: 'IDV 25-26', value: row['IDV 25-26'] || 'N/A' },
                  { label: 'IDV 26-27', value: row['IDV 26-27'] || 'N/A' },
                  { label: 'Year of Manu.', value: row['Year of Manu.'] || 'N/A' },
                  { label: 'Seating', value: row['Seating'] || 'N/A' },
                  { label: 'Fuel', value: row['Fuel'] || 'N/A' },
                  { label: 'NCB 26-27%', value: row['NCB 26-27%'] || 'N/A' },
                  { label: 'Last Year Gross Premium', value: row['Last Year Gross Premium'] || 'N/A' },
                  { label: 'Net Premium 2026-27', value: row['Net Premium 2026-27'] || 'N/A' },
                  { label: 'CB%', value: row['CB%'] || 'N/A' },
                  { label: 'Cash back', value: row['Cash back'] || 'N/A' },
                  { label: 'Final cost', value: row['Final cost'] || 'N/A' },
                  { label: 'Difference', value: row['Difference'] || 'N/A' },
                  { label: 'Cash back Status', value: row['Cash back Status'] || 'N/A' },
                  { label: 'Closing remarks', value: row['Closing remarks'] || 'N/A' },
                ].map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center py-2 border-b border-zinc-800/50">
                    <span className="text-zinc-500 text-sm">{item.label}</span>
                    <span className="text-zinc-200 font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Follow-up Form */}
            <section>
              <h3 className="text-sm font-semibold text-blue-500 uppercase tracking-wider mb-6 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                Current Follow-up
              </h3>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1.5 uppercase font-semibold">Follow-up Date</label>
                    <input 
                      type="date" 
                      value={formData.followUpDate}
                      onChange={e => setFormData({...formData, followUpDate: e.target.value})}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1.5 uppercase font-semibold">Status</label>
                    <select 
                      value={formData.status}
                      onChange={e => setFormData({...formData, status: e.target.value as any})}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                    >
                      <option value="Follow-up Only">Only for Follow-up</option>
                      <option value="Proposal Pending">Proposal Pending</option>
                      <option value="Proposal Made">Proposal Made</option>
                      <option value="Policy Made">Policy Made</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-zinc-500 mb-1.5 uppercase font-semibold">Customer Feedback</label>
                  <textarea 
                    value={formData.feedback}
                    onChange={e => setFormData({...formData, feedback: e.target.value})}
                    placeholder="Enter feedback..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all h-24 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1.5 uppercase font-semibold">Proposal No.</label>
                    <input 
                      type="text" 
                      value={formData.proposalNumber}
                      onChange={e => setFormData({...formData, proposalNumber: e.target.value})}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1.5 uppercase font-semibold">New Policy No.</label>
                    <input 
                      type="text" 
                      value={formData.newPolicyNumber}
                      onChange={e => setFormData({...formData, newPolicyNumber: e.target.value})}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1.5 uppercase font-semibold">Gross Premium</label>
                    <input 
                      type="number" 
                      value={formData.grossPremium}
                      onChange={e => setFormData({...formData, grossPremium: Number(e.target.value)})}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1.5 uppercase font-semibold">Net Premium (Auto)</label>
                    <div className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-400 font-medium">
                      ₹{formData.netPremium.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1.5 uppercase font-semibold">CB %</label>
                    <input 
                      type="number" 
                      value={formData.cbPercentage}
                      onChange={e => setFormData({...formData, cbPercentage: Number(e.target.value)})}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1.5 uppercase font-semibold">CB Value (Auto)</label>
                    <div className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-400 font-medium">
                      ₹{formData.cbValue.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1.5 uppercase font-semibold">Insurance Company</label>
                    <select 
                      value={formData.chosenCompany}
                      onChange={e => setFormData({...formData, chosenCompany: e.target.value})}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                    >
                      <option value="">Select Company</option>
                      {INSURANCE_COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  {formData.chosenCompany === 'Others' && (
                    <div>
                      <label className="block text-xs text-zinc-500 mb-1.5 uppercase font-semibold">Specify Company</label>
                      <input 
                        type="text" 
                        value={formData.otherCompanyName}
                        onChange={e => setFormData({...formData, otherCompanyName: e.target.value})}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1.5 uppercase font-semibold">Co. Commission %</label>
                    <input 
                      type="number" 
                      value={formData.coCommissionPercentage}
                      onChange={e => setFormData({...formData, coCommissionPercentage: Number(e.target.value)})}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1.5 uppercase font-semibold">Commission Amt (Auto)</label>
                    <div className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-400 font-medium">
                      ₹{formData.commissionAmount.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1.5 uppercase font-semibold">Profit Amt (Auto)</label>
                    <div className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-emerald-500 font-bold">
                      ₹{formData.profitAmount.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'RC Collected', key: 'rcCollected' },
                    { label: 'PAN Collected', key: 'panCollected' },
                    { label: 'GST Recorded', key: 'gstRecorded' },
                  ].map(check => (
                    <div key={check.key}>
                      <label className="block text-[10px] text-zinc-500 mb-1.5 uppercase font-bold">{check.label}</label>
                      <select 
                        value={(formData as any)[check.key]}
                        onChange={e => setFormData({...formData, [check.key]: e.target.value})}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                      >
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                      </select>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1.5 uppercase font-semibold">CB Status</label>
                    <select 
                      value={formData.cbStatus}
                      onChange={e => setFormData({...formData, cbStatus: e.target.value})}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                    >
                      <option value="Unpaid">Unpaid</option>
                      <option value="Paid">Paid</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1.5 uppercase font-semibold">Payment Mode</label>
                    <input 
                      type="text" 
                      value={formData.paymentMode}
                      onChange={e => setFormData({...formData, paymentMode: e.target.value})}
                      placeholder="e.g. Cash, UPI, Bank"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1.5 uppercase font-semibold">Payment Date</label>
                    <input 
                      type="date" 
                      value={formData.paymentDate}
                      onChange={e => setFormData({...formData, paymentDate: e.target.value})}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-900/20"
                  >
                    Save Working Details
                  </button>
                </div>
              </form>
            </section>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('iAnuvartiTrack_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [customers, setCustomers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [busWorkingData, setBusWorkingData] = useState<any[]>([]);
  const [isUploadingBusWorking, setIsUploadingBusWorking] = useState(false);
  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);
  const [activeBucket, setActiveBucket] = useState<BucketType | null>(null);
  const [selectedPolicy, setSelectedPolicy] = useState<any | null>(null);
  const [selectedBusWorkingRow, setSelectedBusWorkingRow] = useState<any | null>(null);
  const [reports, setReports] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedMonth, setSelectedMonth] = useState(3); // March
  const [reportsSubTab, setReportsSubTab] = useState('overview');

  const fetchData = async (year?: number, month?: number) => {
    setIsLoading(true);
    const y = year || selectedYear;
    const m = month || selectedMonth;
    try {
      const res = await fetch(`/api/customers?year=${y}&month=${m}`);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${res.status}`);
      }
      const data = await res.json();
      console.log('Fetched customers:', data.length);
      setCustomers(data);
    } catch (error: any) {
      console.error('fetchData error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBusWorkingData = async () => {
    try {
      const res = await fetch('/api/bus-working');
      if (res.ok) {
        const data = await res.json();
        setBusWorkingData(data);
      }
    } catch (error) {
      console.error('fetchBusWorkingData error:', error);
    }
  };

  const fetchReports = async () => {
    try {
      const res = await fetch('/api/reports');
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${res.status}`);
      }
      const data = await res.json();
      setReports(data);
    } catch (error: any) {
      console.error('fetchReports error:', error);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchData(selectedYear, selectedMonth);
      fetchBusWorkingData();
      if (activeTab === 'reports') fetchReports();
    }
  }, [activeTab, currentUser, selectedYear, selectedMonth]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('AnuvartiTrack_user', JSON.stringify(user));
    // Default tab for non-admins should be something they can see
    if (user.role === 'user') {
      setActiveTab('buckets');
    } else {
      setActiveTab('dashboard');
    }
  };

  const handleLogout = async () => {
    if (currentUser) {
      try {
        await fetch('/api/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: currentUser.id, username: currentUser.username })
        });
      } catch (err) {
        console.error('Logout log error:', err);
      }
    }
    setCurrentUser(null);
    localStorage.removeItem('AnuvartiTrack_user');
  };

  const handleReset = async () => {
    if (!confirm('Are you sure you want to clear all customer and policy data? This cannot be undone.')) return;
    
    try {
      const res = await fetch('/api/reset', { method: 'POST' });
      if (res.ok) {
        setCustomers([]);
        setBusWorkingData([]);
        alert('Database cleared successfully.');
      }
    } catch (error) {
      console.error('Reset error:', error);
      alert('Failed to reset database.');
    }
  };
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to JSON with formatted dates
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
          raw: false, 
          dateNF: 'yyyy-mm-dd' 
        });

        if (jsonData.length === 0) {
          alert('The Excel file appears to be empty.');
          setIsUploading(false);
          return;
        }

        // Helper to find value by case-insensitive header name
        const getVal = (row: any, ...keys: string[]) => {
          const rowKeys = Object.keys(row);
          for (const key of keys) {
            const foundKey = rowKeys.find(rk => rk.trim().toLowerCase() === key.trim().toLowerCase());
            if (foundKey) return row[foundKey];
          }
          return undefined;
        };

        const mapped = jsonData.map((row: any) => ({
          sNo: Number(getVal(row, 'S. No.', 'SNo', 'Serial No', 'S.No', 'Sr No', 'Sr. No.', 'No.')) || 0,
          lastYearIssueDate: String(getVal(row, 'Last Year Date of Issue', 'Issue Date', 'Date of Issue', 'Policy Date') || ''),
          name: String(getVal(row, 'Customer Name', 'Name', 'Name of Customer', 'Insured Name', 'Customer') || ''),
          refContact: String(getVal(row, 'Ref Name / Phone No.', 'Contact', 'Ref Name', 'Phone No', 'Phone', 'Mobile', 'Mobile No') || ''),
          email: String(getVal(row, 'Customer Email', 'Email', 'E-mail', 'Mail') || ''),
          type: String(getVal(row, 'new or renewal', 'Type', 'Policy Type') || ''),
          segment: String(getVal(row, 'Segment', 'Category') || ''),
          registrationNumber: String(getVal(row, 'Registration No.', 'Reg No', 'Registration Number', 'Vehicle No', 'Vehicle Number', 'Reg. No.') || ''),
          grossPremium: Number(getVal(row, 'Gross Premium', 'Gross', 'Premium')) || 0,
          netPremium: Number(getVal(row, 'Net Premium', 'Net')) || 0,
          company: String(getVal(row, 'Insurance Company', 'Company', 'Insurer') || ''),
          policyNumber: String(getVal(row, 'Policy no.', 'Policy Number', 'Policy No') || ''),
          lyCbPercentage: Number(getVal(row, 'LY CB %', 'CB %', 'CB Percentage')) || 0,
          expiryDate: String(getVal(row, 'Renewal date', 'Expiry Date', 'Renewal', 'Expiry') || '')
        })).filter(c => c.name.trim() !== '');

        if (mapped.length === 0) {
          alert('No valid customer data found in the Excel file. Please check the column headers.');
          setIsUploading(false);
          return;
        }

        console.log('Mapped data sample:', mapped[0]);
        console.log('Total mapped records:', mapped.length);

        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            data: mapped,
            year: selectedYear,
            month: selectedMonth
          })
        });

        const result = await res.json();

        if (res.ok) {
          alert(`Success! ${result.count} records uploaded.`);
          fetchData();
          setActiveTab('dashboard');
        } else {
          alert(`Upload failed: ${result.error || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('Excel processing error:', error);
        alert('Error processing Excel file. Please ensure it follows the required format.');
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleBusWorkingUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingBusWorking(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
          raw: false, 
          dateNF: 'yyyy-mm-dd' 
        });

        if (jsonData.length === 0) {
          alert('The Excel file appears to be empty.');
          setIsUploadingBusWorking(false);
          return;
        }

        const allowedKeys = [
          'S. No.', 'Remarks', 'Pan Card', 'HP', 'Proposal No.', 'Address', 
          'Customer Name', 'Ref Name', 'Previous Ins. Co.', 'Usage', 'Expiry Date', 
          'Regn. No.', 'IDV 25-26', 'IDV 26-27', 'Year of Manu.', 'Seating', 'Fuel', 
          'NCB 26-27%', 'Last Year Gross Premium', 'Net Premium 2026-27', 'CB%', 
          'Cash back', 'Final cost', 'Difference', 'Cash back Status', 'Closing remarks'
        ];

        const filteredData = jsonData.map((row: any) => {
          const filteredRow: any = {};
          allowedKeys.forEach(key => {
            const actualKey = Object.keys(row).find(k => k.toLowerCase() === key.toLowerCase());
            if (actualKey) {
              filteredRow[key] = row[actualKey];
            }
          });
          return filteredRow;
        });

        const res = await fetch('/api/bus-working/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            data: filteredData,
            uploadedBy: currentUser?.username
          })
        });

        if (res.ok) {
          alert(`Success! ${jsonData.length} records loaded into Bus Working sheet.`);
          fetchBusWorkingData();
        } else {
          const err = await res.json();
          alert(`Upload failed: ${err.error}`);
        }
      } catch (error) {
        console.error('Bus Working Excel processing error:', error);
        alert('Error processing Excel file.');
      } finally {
        setIsUploadingBusWorking(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleSaveFollowUp = async (data: any) => {
    try {
      const res = await fetch('/api/followup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          userId: currentUser?.id,
          username: currentUser?.username
        })
      });
      if (res.ok) {
        setSelectedPolicy(null);
        fetchData();
        if (activeTab === 'reports') fetchReports();
      }
    } catch (error) {
      console.error('Save follow-up error:', error);
    }
  };

  const handleSaveBusFollowUp = async (data: any) => {
    try {
      const res = await fetch('/api/bus-working/followup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          busWorkingId: selectedBusWorkingRow._id,
          userId: currentUser?.id,
          username: currentUser?.username
        })
      });
      if (res.ok) {
        setSelectedBusWorkingRow(null);
        fetchBusWorkingData();
      }
    } catch (error) {
      console.error('Save bus follow-up error:', error);
    }
  };

  const handleSaveNewCustomer = async (data: any) => {
    try {
      const payload = {
        customer: {
          name: data.name,
          refContact: data.refContact,
          email: data.email,
          segment: data.segment,
          registrationNumber: data.registrationNumber,
          type: data.busType || 'New',
          targetYear: selectedYear,
          targetMonth: selectedMonth
        },
        followup: {
          ...data,
          status: 'Policy Made'
        }
      };

      const res = await fetch('/api/customers/new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setIsNewCustomerModalOpen(false);
        fetchData();
        alert('New customer and policy saved successfully!');
      } else {
        const err = await res.json();
        alert(`Error: ${err.error}`);
      }
    } catch (error) {
      console.error('Save new customer error:', error);
      alert('Failed to save new customer.');
    }
  };

  const getBucketCount = (type: BucketType, customList?: any[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const list = customList || customers;
    return list.filter(c => {
      const expiry = safeParseDate(c.expiryDate);
      if (!expiry) return false;
      const diff = differenceInDays(expiry, today);
      
      if (type === '7days') return diff >= 0 && diff <= 7;
      if (type === '15days') return diff > 7 && diff <= 15;
      if (type === '30days') return diff > 15 && diff <= 31; // User requested 16-31
      return false;
    }).length;
  };

  const getFilteredList = () => {
    let list = customers;
    
    // For dashboard, show all customers
    if (activeTab === 'dashboard') {
      return customers;
    }

    // Renewal business has sNo, New business doesn't
    if (activeTab === 'new-business') {
      return customers.filter(c => !c.sNo);
    }
    
    // For other tabs, only show renewal business
    list = customers.filter(c => !!c.sNo);

    if (activeTab === 'bus') {
      list = list.filter(c => c.segment?.toLowerCase().includes('bus'));
    } else if (activeTab === 'others') {
      list = list.filter(c => !c.segment?.toLowerCase().includes('bus'));
    }
    return list;
  };

  const filteredCustomers = getFilteredList().filter(c => {
    const name = String(c.name || '').toLowerCase();
    const reg = String(c.registrationNumber || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch = name.includes(query) || reg.includes(query);
    
    if (activeTab === 'dashboard') return matchesSearch; // Monthly Overview shows all
    
    // For buckets, bus, and others, we might want to filter by activeBucket if selected
    if (!activeBucket) return matchesSearch;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = safeParseDate(c.expiryDate);
    if (!expiry) return false;
    
    const diff = differenceInDays(expiry, today);

    if (activeBucket === '7days') return matchesSearch && diff >= 0 && diff <= 7;
    if (activeBucket === '15days') return matchesSearch && diff > 7 && diff <= 15;
    if (activeBucket === '30days') return matchesSearch && diff > 15 && diff <= 31;
    
    return matchesSearch;
  });

  const downloadReport = (data: any[], filename: string) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  };

  const downloadYearlyReport = () => {
    if (!reports?.policyMade) return;
    
    const reportData = reports.policyMade
      .filter((c: any) => c.targetYear === selectedYear)
      .map((c: any, idx: number) => {
        return {
          'S. No.': idx + 1,
          [`${selectedYear} Date of Issue`]: c.followUpDate || 'N/A',
          'Customer Name': c.name,
          'Phone No.': c.refContact,
          'Existing/New': c.isExistingOrNew || 'N/A',
          'Customer Type': c.customerType || 'N/A',
          'Referred By': c.referredBy || 'N/A',
          'Segment': c.segment,
          'Registration No.': c.registrationNumber,
          'Gross Premium Value': c.grossPremium || 0,
          'Net Premium Value': c.netPremium || 0,
          'CB %': c.cbPercentage || 0,
          'CB Value': c.cbValue || 0,
          'Insurance Company': c.chosenCompany === 'Others' ? c.otherCompanyName : (c.chosenCompany || c.company),
          'Policy No.': c.newPolicyNumber || c.policyNumber || 'N/A',
          'Renewal Date for next Year': c.expiryDate || 'N/A',
          'Co. Commission %': c.coCommissionPercentage || 0,
          'Commission Amount': c.commissionAmount || 0,
          'Profit Amount': c.profitAmount || 0,
          'CB Status': c.cbStatus || 'Unpaid',
          'Payment Mode': c.paymentMode || 'N/A',
          'Payment Date': c.paymentDate || 'N/A'
        };
      });
    
    downloadReport(reportData, `Policy_Report_${selectedYear}`);
  };

  const downloadYearlyNextYearUploadSheet = () => {
    if (!reports?.policyMade) return;
    
    const policiesMade = reports.policyMade.filter((c: any) => c.targetYear === selectedYear);
    if (policiesMade.length === 0) {
      alert(`No policies made for ${selectedYear}.`);
      return;
    }

    const uploadSheetData = policiesMade.map((c: any, idx: number) => ({
      'S. No.': idx + 1,
      'Last Year Date of Issue': c.followUpDate || '',
      'Customer Name': c.name,
      'Ref Name / Phone No.': c.refContact,
      'Customer Email': c.email || '',
      'new or renewal': 'Renewal',
      'Segment': c.segment,
      'Registration No.': c.registrationNumber,
      'Gross Premium': c.grossPremium || 0,
      'Net Premium': c.netPremium || 0,
      'Insurance Company': c.chosenCompany === 'Others' ? c.otherCompanyName : (c.chosenCompany || c.company),
      'Policy no.': c.newPolicyNumber || c.policyNumber || '',
      'LY CB %': c.cbPercentage || 0,
      'Renewal date': c.expiryDate || ''
    }));

    downloadReport(uploadSheetData, `Next_Year_Upload_Sheet_Full_${selectedYear + 1}`);
  };

  const downloadMasterSheet = () => {
    const masterData = customers.map(c => ({
      'S. No.': c.sNo,
      'Last Year Date of Issue': c.lastYearIssueDate,
      'Customer Name': c.name,
      'Ref Name / Phone No.': c.refContact,
      'new or renewal': c.type,
      'Segment': c.segment,
      'Registration No.': c.registrationNumber,
      'Gross Premium': c.grossPremium,
      'Net Premium': c.netPremium,
      'Insurance Company': c.company,
      'Policy no.': c.policyNumber,
      'LY CB %': c.lyCbPercentage,
      'Renewal date': c.expiryDate,
      'Current Status': c.status || 'Pending',
      'Chosen Company': c.chosenCompany || '',
      'New Gross Premium': c.currentGrossPremium || '',
      'New Net Premium': c.currentNetPremium || ''
    }));
    downloadReport(masterData, 'Master_Sheet_Current_Year');
  };

  const downloadMonthlyReport = async (year: number, month: number) => {
    try {
      const res = await fetch(`/api/customers?year=${year}&month=${month}`);
      if (res.ok) {
        const data = await res.json();
        const policiesMade = data.filter((c: any) => c.status === 'Policy Made');
        if (policiesMade.length === 0) {
          alert('No policies made for this month.');
          return;
        }
        downloadReport(policiesMade, `Policies_${MONTHS.find(m => m.value === month)?.label}_${year}`);
      }
    } catch (error) {
      console.error('downloadMonthlyReport error:', error);
    }
  };

  const downloadNextYearUploadSheet = async (year: number, month: number) => {
    try {
      const res = await fetch(`/api/customers?year=${year}&month=${month}`);
      if (res.ok) {
        const data = await res.json();
        const policiesMade = data.filter((c: any) => c.status === 'Policy Made');
        if (policiesMade.length === 0) {
          alert('No policies made for this month.');
          return;
        }

        const uploadSheetData = policiesMade.map((c: any, idx: number) => ({
          'S. No.': idx + 1,
          'Last Year Date of Issue': c.followUpDate || '',
          'Customer Name': c.name,
          'Ref Name / Phone No.': c.refContact,
          'Customer Email': c.email || '',
          'new or renewal': 'Renewal',
          'Segment': c.segment,
          'Registration No.': c.registrationNumber,
          'Gross Premium': c.grossPremium || 0,
          'Net Premium': c.netPremium || 0,
          'Insurance Company': c.chosenCompany === 'Others' ? c.otherCompanyName : (c.chosenCompany || c.company),
          'Policy no.': c.newPolicyNumber || c.policyNumber || '',
          'LY CB %': c.cbPercentage || 0,
          'Renewal date': c.expiryDate || ''
        }));

        downloadReport(uploadSheetData, `Next_Year_Upload_Sheet_${MONTHS.find(m => m.value === month)?.label}_${year + 1}`);
      }
    } catch (error) {
      console.error('downloadNextYearUploadSheet error:', error);
    }
  };

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-emerald-500/30">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onNewCustomer={() => setIsNewCustomerModalOpen(true)}
        user={currentUser}
        onLogout={handleLogout}
      />
      
      <main className="pl-64 min-h-screen">
        <div className="max-w-7xl mx-auto p-8">
          
          {/* Monthly Overview Dashboard */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              <header className="flex justify-between items-end">
                <div>
                  <p className="text-zinc-500 text-sm font-medium mb-1">Welcome back, Agent</p>
                  <h2 className="text-3xl font-bold">Monthly Overview</h2>
                  <div className="flex gap-4 mt-4">
                    <select 
                      value={selectedYear}
                      onChange={e => {
                        const y = Number(e.target.value);
                        setSelectedYear(y);
                        fetchData(y, selectedMonth);
                      }}
                      className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-emerald-500/50 outline-none"
                    >
                      {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                    <select 
                      value={selectedMonth}
                      onChange={e => {
                        const m = Number(e.target.value);
                        setSelectedMonth(m);
                        fetchData(selectedYear, m);
                      }}
                      className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-emerald-500/50 outline-none"
                    >
                      {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </select>
                  </div>
                  <p className="text-zinc-500 text-sm mt-4">
                    {customers.length > 0 
                      ? `Showing ${customers.length} active policies for the current period.`
                      : "No data uploaded yet. Please go to the Upload tab to import your Excel sheet."}
                  </p>
                </div>
                <div className="flex gap-3">
                  {isLoading && (
                    <div className="flex items-center gap-2 text-zinc-500 text-sm animate-pulse">
                      <Clock size={16} className="animate-spin" />
                      Loading...
                    </div>
                  )}
                  <button 
                    onClick={fetchData}
                    className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 transition-all text-sm font-medium"
                  >
                    <Clock size={18} />
                    Refresh
                  </button>
                  <button 
                    onClick={downloadMasterSheet}
                    className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 transition-all text-sm font-medium"
                  >
                    <Download size={18} />
                    Master Sheet
                  </button>
                </div>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-zinc-800 rounded-lg text-zinc-400">
                      <FileText size={20} />
                    </div>
                    <span className="text-zinc-400 font-medium">Total Renewal</span>
                  </div>
                  <div className="text-3xl font-bold">{customers.filter(c => !!c.sNo).length}</div>
                  <div className="mt-4 pt-4 border-t border-zinc-800">
                    <div className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Renewal Target</div>
                    <div className="flex justify-between text-xs">
                      <span>Gross: ₹{customers.filter(c => !!c.sNo).reduce((sum, c) => sum + (c.grossPremium || 0), 0).toLocaleString()}</span>
                      <span>Net: ₹{customers.filter(c => !!c.sNo).reduce((sum, c) => sum + (c.netPremium || 0), 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                      <CheckCircle2 size={20} />
                    </div>
                    <span className="text-zinc-400 font-medium">Policy Made</span>
                  </div>
                  <div className="text-3xl font-bold text-emerald-500">
                    {customers.filter(c => c.status === 'Policy Made').length}
                  </div>
                  <div className="mt-4 pt-4 border-t border-zinc-800">
                    <div className="text-[10px] text-emerald-500 uppercase font-bold mb-1">Total Premium Achieved</div>
                    <div className="flex justify-between text-xs text-emerald-400/80">
                      <span>Gross: ₹{customers.filter(c => c.status === 'Policy Made').reduce((sum, c) => sum + (c.currentGrossPremium || 0), 0).toLocaleString()}</span>
                      <span>Net: ₹{customers.filter(c => c.status === 'Policy Made').reduce((sum, c) => sum + (c.currentNetPremium || 0), 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
                      <Star size={20} />
                    </div>
                    <span className="text-zinc-400 font-medium">New Business</span>
                  </div>
                  <div className="text-3xl font-bold text-amber-400">
                    {customers.filter(c => !c.sNo).length}
                  </div>
                  <div className="mt-4 pt-4 border-t border-zinc-800">
                    <div className="text-[10px] text-amber-500 uppercase font-bold mb-1">New Premium Achieved</div>
                    <div className="flex justify-between text-xs text-amber-400/80">
                      <span>Gross: ₹{customers.filter(c => !c.sNo).reduce((sum, c) => sum + (c.currentGrossPremium || 0), 0).toLocaleString()}</span>
                      <span>Net: ₹{customers.filter(c => !c.sNo).reduce((sum, c) => sum + (c.currentNetPremium || 0), 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
                      <AlertCircle size={20} />
                    </div>
                    <span className="text-zinc-400 font-medium">Pending Renewal</span>
                  </div>
                  <div className="text-3xl font-bold text-red-500">
                    {customers.filter(c => !!c.sNo && c.status !== 'Policy Made').length}
                  </div>
                  <div className="mt-4 pt-4 border-t border-zinc-800">
                    <div className="text-[10px] text-red-500 uppercase font-bold mb-1">Remaining Renewal Target</div>
                    <div className="flex justify-between text-xs text-red-400/80">
                      <span>Gross: ₹{customers.filter(c => !!c.sNo && c.status !== 'Policy Made').reduce((sum, c) => sum + (c.grossPremium || 0), 0).toLocaleString()}</span>
                      <span>Net: ₹{customers.filter(c => !!c.sNo && c.status !== 'Policy Made').reduce((sum, c) => sum + (c.netPremium || 0), 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* New Cards */}
                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                      <CheckCircle2 size={20} />
                    </div>
                    <span className="text-zinc-400 font-medium">CB Paid</span>
                  </div>
                  <div className="text-3xl font-bold text-blue-500">
                    {customers.filter(c => c.cbStatus === 'Paid').length}
                  </div>
                  <div className="mt-4 pt-4 border-t border-zinc-800">
                    <div className="text-[10px] text-blue-500 uppercase font-bold mb-1">Total CB Paid Value</div>
                    <div className="text-lg font-bold text-blue-400">
                      ₹{customers.filter(c => c.cbStatus === 'Paid').reduce((sum, c) => sum + (c.cbValue || 0), 0).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-zinc-800 rounded-lg text-zinc-400">
                      <Clock size={20} />
                    </div>
                    <span className="text-zinc-400 font-medium">CB Unpaid</span>
                  </div>
                  <div className="text-3xl font-bold text-zinc-400">
                    {customers.filter(c => c.status === 'Policy Made' && c.cbStatus !== 'Paid').length}
                  </div>
                  <div className="mt-4 pt-4 border-t border-zinc-800">
                    <div className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Total CB Unpaid Value</div>
                    <div className="text-lg font-bold text-zinc-400">
                      ₹{customers.filter(c => c.status === 'Policy Made' && c.cbStatus !== 'Paid').reduce((sum, c) => sum + (c.cbValue || 0), 0).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl lg:col-span-2">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                      <TrendingUp size={20} />
                    </div>
                    <span className="text-zinc-400 font-medium">Profit Amount</span>
                  </div>
                  <div className="text-3xl font-bold text-emerald-500">
                    ₹{customers.reduce((sum, c) => sum + (c.profitAmount || 0), 0).toLocaleString()}
                  </div>
                  <div className="mt-4 pt-4 border-t border-zinc-800">
                    <div className="text-[10px] text-emerald-500 uppercase font-bold mb-1">Total Commission vs CB</div>
                    <div className="flex justify-between text-xs text-emerald-400/80">
                      <span>Total Comm: ₹{customers.reduce((sum, c) => sum + (c.commissionAmount || 0), 0).toLocaleString()}</span>
                      <span>Total CB: ₹{customers.reduce((sum, c) => sum + (c.cbValue || 0), 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl overflow-hidden">
                <div className="p-6 border-b border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg">
                      {activeTab === 'dashboard' ? 'All Policies' : 'Renewal Policies This Month'}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-400 text-xs font-bold">
                      {filteredCustomers.length}
                    </span>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                    <input 
                      type="text" 
                      placeholder="Search name or vehicle..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-sm w-full md:w-64 focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-zinc-500 text-xs uppercase tracking-wider border-b border-zinc-800">
                        <th className="px-6 py-4 font-semibold">Customer</th>
                        <th className="px-6 py-4 font-semibold">Reg No.</th>
                        <th className="px-6 py-4 font-semibold">Renewal Date</th>
                        <th className="px-6 py-4 font-semibold">LY Premium</th>
                        <th className="px-6 py-4 font-semibold">CY Premium</th>
                        <th className="px-6 py-4 font-semibold">Insurance Co.</th>
                        <th className="px-6 py-4 font-semibold">Status</th>
                        <th className="px-6 py-4 font-semibold"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/50">
                      {filteredCustomers.map((c) => {
                        const expiryDate = safeParseDate(c.expiryDate);
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const diff = expiryDate ? differenceInDays(expiryDate, today) : 999;
                        let colorClass = "text-zinc-400";
                        if (expiryDate) {
                          if (diff <= 7 && diff >= 0) colorClass = "text-red-500 font-bold";
                          else if (diff <= 15 && diff >= 0) colorClass = "text-blue-500 font-bold";
                          else if (diff <= 31 && diff >= 0) colorClass = "text-emerald-500 font-bold";
                        }

                        return (
                          <tr 
                            key={c.id} 
                            onClick={() => setSelectedPolicy(c)}
                            className="hover:bg-zinc-800/50 transition-colors cursor-pointer group"
                          >
                            <td className="px-6 py-4">
                              <div className="font-medium text-white">{c.name}</div>
                              <div className="text-xs text-zinc-500">{c.refContact}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-mono">{c.registrationNumber}</div>
                              <div className="text-xs text-zinc-500">{c.company}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className={cn("text-sm", colorClass)}>
                                {expiryDate ? format(expiryDate, 'dd MMM yyyy') : 'N/A'}
                              </div>
                              <div className="text-[10px] text-zinc-500 uppercase tracking-tighter">
                                {expiryDate ? `${diff} days left` : 'Invalid Date'}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium">₹{(c.grossPremium || 0).toLocaleString()}</div>
                              <div className="text-[10px] text-zinc-500">Net: ₹{(c.netPremium || 0).toLocaleString()}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-zinc-300">{c.chosenCompany || c.company || 'N/A'}</div>
                            </td>
                            <td className="px-6 py-4">
                              {c.status === 'Policy Made' ? (
                                <>
                                  <div className="text-sm font-medium text-emerald-500">₹{(c.currentGrossPremium || 0).toLocaleString()}</div>
                                  <div className="text-[10px] text-emerald-500/70">Net: ₹{(c.currentNetPremium || 0).toLocaleString()}</div>
                                </>
                              ) : (
                                <div className="text-xs text-zinc-600 italic">Pending</div>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <span className={cn(
                                "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                                c.status === 'Policy Made' ? "bg-emerald-500/10 text-emerald-500" :
                                c.status === 'Proposal Made' ? "bg-blue-500/10 text-blue-500" :
                                c.status === 'Proposal Pending' ? "bg-amber-500/10 text-amber-500" :
                                "bg-zinc-800 text-zinc-400"
                              )}>
                                {c.status || 'No Follow-up'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <ChevronRight className="text-zinc-600 group-hover:text-white transition-colors" size={20} />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {filteredCustomers.length === 0 && (
                    <div className="p-12 text-center text-zinc-500">
                      <Search size={48} className="mx-auto mb-4 opacity-20" />
                      <p>No policies found matching your criteria.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Bucket View, Bus Policies, Other Policies, New Business */}
          {(activeTab === 'buckets' || activeTab === 'bus' || activeTab === 'others' || activeTab === 'new-business') && (
            <div className="space-y-8">
              <header className="flex justify-between items-end">
                <div>
                  <p className="text-zinc-500 text-sm font-medium mb-1">
                    {activeTab === 'new-business' ? 'New Business Tracking' : 'Renewal Tracking'}
                  </p>
                  <h2 className="text-3xl font-bold">
                    {activeTab === 'buckets' ? 'Bucket View' : 
                     activeTab === 'bus' ? 'Bus Policies' : 
                     activeTab === 'new-business' ? 'New Business This Month' :
                     'Other Policies'}
                  </h2>
                </div>
              </header>

              {activeTab !== 'new-business' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <BucketCard 
                    type="7days" 
                    count={getBucketCount('7days', getFilteredList())} 
                    onClick={() => setActiveBucket(activeBucket === '7days' ? null : '7days')}
                    active={activeBucket === '7days'}
                  />
                  <BucketCard 
                    type="15days" 
                    count={getBucketCount('15days', getFilteredList())} 
                    onClick={() => setActiveBucket(activeBucket === '15days' ? null : '15days')}
                    active={activeBucket === '15days'}
                  />
                  <BucketCard 
                    type="30days" 
                    count={getBucketCount('30days', getFilteredList())} 
                    onClick={() => setActiveBucket(activeBucket === '30days' ? null : '30days')}
                    active={activeBucket === '30days'}
                  />
                </div>
              )}

              <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl overflow-hidden">
                <div className="p-6 border-b border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg">
                      {activeBucket ? `Policies Due in ${activeBucket.replace('days', ' Days')}` : 'All Filtered Policies'}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-400 text-xs font-bold">
                      {filteredCustomers.length}
                    </span>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                    <input 
                      type="text" 
                      placeholder="Search name or vehicle..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-sm w-full md:w-64 focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-zinc-500 text-xs uppercase tracking-wider border-b border-zinc-800">
                        <th className="px-6 py-4 font-semibold">Customer</th>
                        <th className="px-6 py-4 font-semibold">Reg No.</th>
                        <th className="px-6 py-4 font-semibold">Renewal Date</th>
                        <th className="px-6 py-4 font-semibold">LY Premium</th>
                        <th className="px-6 py-4 font-semibold">CY Premium</th>
                        <th className="px-6 py-4 font-semibold">Insurance Co.</th>
                        <th className="px-6 py-4 font-semibold">Status</th>
                        <th className="px-6 py-4 font-semibold"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/50">
                      {filteredCustomers.map((c) => {
                        const expiryDate = safeParseDate(c.expiryDate);
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const diff = expiryDate ? differenceInDays(expiryDate, today) : 999;
                        let colorClass = "text-zinc-400";
                        if (expiryDate) {
                          if (diff <= 7 && diff >= 0) colorClass = "text-red-500 font-bold";
                          else if (diff <= 15 && diff >= 0) colorClass = "text-blue-500 font-bold";
                          else if (diff <= 31 && diff >= 0) colorClass = "text-emerald-500 font-bold";
                        }

                        return (
                          <tr 
                            key={c.id} 
                            onClick={() => setSelectedPolicy(c)}
                            className="hover:bg-zinc-800/50 transition-colors cursor-pointer group"
                          >
                            <td className="px-6 py-4">
                              <div className="font-medium text-white">{c.name}</div>
                              <div className="text-xs text-zinc-500">{c.refContact}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-mono">{c.registrationNumber}</div>
                              <div className="text-xs text-zinc-500">{c.company}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className={cn("text-sm", colorClass)}>
                                {expiryDate ? format(expiryDate, 'dd MMM yyyy') : 'N/A'}
                              </div>
                              <div className="text-[10px] text-zinc-500 uppercase tracking-tighter">
                                {expiryDate ? `${diff} days left` : 'Invalid Date'}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium">₹{(c.grossPremium || 0).toLocaleString()}</div>
                              <div className="text-[10px] text-zinc-500">Net: ₹{(c.netPremium || 0).toLocaleString()}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-zinc-300">{c.chosenCompany || c.company || 'N/A'}</div>
                            </td>
                            <td className="px-6 py-4">
                              {c.status === 'Policy Made' ? (
                                <>
                                  <div className="text-sm font-medium text-emerald-500">₹{(c.currentGrossPremium || 0).toLocaleString()}</div>
                                  <div className="text-[10px] text-emerald-500/70">Net: ₹{(c.currentNetPremium || 0).toLocaleString()}</div>
                                </>
                              ) : (
                                <div className="text-xs text-zinc-600 italic">Pending</div>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <span className={cn(
                                "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                                c.status === 'Policy Made' ? "bg-emerald-500/10 text-emerald-500" :
                                c.status === 'Proposal Made' ? "bg-blue-500/10 text-blue-500" :
                                c.status === 'Proposal Pending' ? "bg-amber-500/10 text-amber-500" :
                                "bg-zinc-800 text-zinc-400"
                              )}>
                                {c.status || 'No Follow-up'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <ChevronRight className="text-zinc-600 group-hover:text-white transition-colors" size={20} />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {filteredCustomers.length === 0 && (
                    <div className="p-12 text-center text-zinc-500">
                      <Search size={48} className="mx-auto mb-4 opacity-20" />
                      <p>No policies found matching your criteria.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Upload */}
          {activeTab === 'upload' && (
            <div className="max-w-2xl mx-auto space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-2">Upload Customer Data</h2>
                <p className="text-zinc-500">Import your last year's customer database in Excel (.xlsx) format.</p>
                
                <div className="flex justify-center gap-4 mt-6">
                  <div className="text-left">
                    <label className="block text-[10px] text-zinc-500 uppercase font-bold mb-1 ml-1">Target Year</label>
                    <select 
                      value={selectedYear}
                      onChange={e => setSelectedYear(Number(e.target.value))}
                      className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-emerald-500/50 outline-none"
                    >
                      {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                  <div className="text-left">
                    <label className="block text-[10px] text-zinc-500 uppercase font-bold mb-1 ml-1">Target Month</label>
                    <select 
                      value={selectedMonth}
                      onChange={e => setSelectedMonth(Number(e.target.value))}
                      className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-emerald-500/50 outline-none"
                    >
                      {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-900 border-2 border-dashed border-zinc-800 rounded-3xl p-12 text-center space-y-6">
                <div className="w-20 h-20 bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto">
                  <Upload className="text-emerald-500" size={32} />
                </div>
                <div>
                  <p className="text-lg font-medium">Drag and drop your file here</p>
                  <p className="text-sm text-zinc-500 mt-1">or click to browse from your computer</p>
                </div>
                <input 
                  type="file" 
                  accept=".xlsx, .xls" 
                  onChange={handleUpload}
                  className="hidden" 
                  id="file-upload" 
                />
                <label 
                  htmlFor="file-upload"
                  className={cn(
                    "inline-block bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-8 py-3 rounded-xl transition-all cursor-pointer shadow-lg shadow-emerald-900/20",
                    isUploading && "opacity-50 cursor-not-allowed pointer-events-none"
                  )}
                >
                  {isUploading ? 'Uploading...' : 'Select Excel File'}
                </label>
                {isUploading && (
                  <div className="flex items-center justify-center gap-2 text-zinc-500 text-sm animate-pulse mt-4">
                    <Clock size={16} className="animate-spin" />
                    Processing Excel data...
                  </div>
                )}
              </div>

              <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                <h4 className="font-bold mb-4 flex items-center gap-2">
                  <AlertCircle size={18} className="text-zinc-400" />
                  Excel Format Guide
                </h4>
                <p className="text-sm text-zinc-400 mb-4">Your Excel sheet should include the following headers in the first row:</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    'S. No.', 'Last Year Date of Issue', 'Customer Name', 'Ref Name / Phone No.', 
                    'new or renewal', 'Segment', 'Registration No.', 'Gross Premium', 
                    'Net Premium', 'Insurance Company', 'Policy no.', 'LY CB %', 'Renewal date'
                  ].map(h => (
                    <span key={h} className="px-2 py-1 bg-zinc-800 rounded text-[10px] font-mono text-zinc-300">{h}</span>
                  ))}
                </div>
              </div>

              <div className="bg-zinc-900/50 border border-red-900/20 rounded-2xl p-6 mt-8">
                <h4 className="font-bold mb-2 text-red-500 flex items-center gap-2">
                  <Trash2 size={18} />
                  Reset Database
                </h4>
                <p className="text-sm text-zinc-500 mb-4">This will permanently delete all customer data and follow-up records. Use this if you want to start fresh with a new Excel upload.</p>
                <button 
                  onClick={handleReset}
                  className="px-6 py-2.5 bg-red-600/10 text-red-500 border border-red-500/20 rounded-xl hover:bg-red-600/20 transition-all font-bold text-sm"
                >
                  Clear All Data
                </button>
              </div>
            </div>
          )}

          {/* Bus Working */}
          {activeTab === 'bus-working' && (
            <div className="space-y-8">
              <header className="flex justify-between items-end">
                <div>
                  <p className="text-zinc-500 text-sm font-medium mb-1">Bus Working Sheet</p>
                  <h2 className="text-3xl font-bold">Bus Working Data</h2>
                </div>
                <div className="flex gap-4">
                  <input 
                    type="file" 
                    accept=".xlsx, .xls" 
                    onChange={handleBusWorkingUpload}
                    className="hidden" 
                    id="bus-working-upload" 
                  />
                  <label 
                    htmlFor="bus-working-upload"
                    className={cn(
                      "flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-all font-bold shadow-lg shadow-emerald-900/20 cursor-pointer",
                      isUploadingBusWorking && "opacity-50 cursor-not-allowed pointer-events-none"
                    )}
                  >
                    <Upload size={20} />
                    {isUploadingBusWorking ? 'Uploading...' : 'Upload Bus Sheet'}
                  </label>
                </div>
              </header>

              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
                <div className="overflow-x-auto">
                  {busWorkingData.length > 0 ? (
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-zinc-500 text-xs uppercase tracking-wider border-b border-zinc-800">
                          <th className="px-6 py-4 font-semibold whitespace-nowrap">S. No.</th>
                          <th className="px-6 py-4 font-semibold whitespace-nowrap">Remarks</th>
                          <th className="px-6 py-4 font-semibold whitespace-nowrap">Pan Card</th>
                          <th className="px-6 py-4 font-semibold whitespace-nowrap">HP</th>
                          <th className="px-6 py-4 font-semibold whitespace-nowrap">Proposal No.</th>
                          <th className="px-6 py-4 font-semibold whitespace-nowrap">Address</th>
                          <th className="px-6 py-4 font-semibold whitespace-nowrap">Customer Name</th>
                          <th className="px-6 py-4 font-semibold whitespace-nowrap">Ref Name</th>
                          <th className="px-6 py-4 font-semibold whitespace-nowrap">Previous Ins. Co.</th>
                          <th className="px-6 py-4 font-semibold whitespace-nowrap">Usage</th>
                          <th className="px-6 py-4 font-semibold whitespace-nowrap">Expiry Date</th>
                          <th className="px-6 py-4 font-semibold whitespace-nowrap">Regn. No.</th>
                          <th className="px-6 py-4 font-semibold whitespace-nowrap">IDV 25-26</th>
                          <th className="px-6 py-4 font-semibold whitespace-nowrap">IDV 26-27</th>
                          <th className="px-6 py-4 font-semibold whitespace-nowrap">Year of Manu.</th>
                          <th className="px-6 py-4 font-semibold whitespace-nowrap">Seating</th>
                          <th className="px-6 py-4 font-semibold whitespace-nowrap">Fuel</th>
                          <th className="px-6 py-4 font-semibold whitespace-nowrap">NCB 26-27%</th>
                          <th className="px-6 py-4 font-semibold whitespace-nowrap">Last Year Gross Premium</th>
                          <th className="px-6 py-4 font-semibold whitespace-nowrap">Net Premium 2026-27</th>
                          <th className="px-6 py-4 font-semibold whitespace-nowrap">CB%</th>
                          <th className="px-6 py-4 font-semibold whitespace-nowrap">Cash back</th>
                          <th className="px-6 py-4 font-semibold whitespace-nowrap">Final cost</th>
                          <th className="px-6 py-4 font-semibold whitespace-nowrap">Difference</th>
                          <th className="px-6 py-4 font-semibold whitespace-nowrap">Cash back Status</th>
                          <th className="px-6 py-4 font-semibold whitespace-nowrap">Closing remarks</th>
                          <th className="px-6 py-4 font-semibold whitespace-nowrap">Status</th>
                          <th className="px-6 py-4 font-semibold whitespace-nowrap text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/50">
                        {busWorkingData.map((row, idx) => (
                          <tr key={idx} className="hover:bg-zinc-800/50 transition-colors">
                            <td className="px-6 py-4 text-sm text-zinc-300 whitespace-nowrap">{row['S. No.'] || idx + 1}</td>
                            <td className="px-6 py-4 text-sm text-zinc-300 whitespace-nowrap">{row['Remarks']}</td>
                            <td className="px-6 py-4 text-sm text-zinc-300 whitespace-nowrap">{row['Pan Card']}</td>
                            <td className="px-6 py-4 text-sm text-zinc-300 whitespace-nowrap">{row['HP']}</td>
                            <td className="px-6 py-4 text-sm text-zinc-300 whitespace-nowrap">{row['Proposal No.']}</td>
                            <td className="px-6 py-4 text-sm text-zinc-300 whitespace-nowrap">{row['Address']}</td>
                            <td className="px-6 py-4 text-sm text-white font-medium whitespace-nowrap">{row['Customer Name']}</td>
                            <td className="px-6 py-4 text-sm text-zinc-300 whitespace-nowrap">{row['Ref Name']}</td>
                            <td className="px-6 py-4 text-sm text-zinc-300 whitespace-nowrap">{row['Previous Ins. Co.']}</td>
                            <td className="px-6 py-4 text-sm text-zinc-300 whitespace-nowrap">{row['Usage']}</td>
                            <td className="px-6 py-4 text-sm text-zinc-300 whitespace-nowrap">{row['Expiry Date']}</td>
                            <td className="px-6 py-4 text-sm text-zinc-300 whitespace-nowrap font-mono">{row['Regn. No.']}</td>
                            <td className="px-6 py-4 text-sm text-zinc-300 whitespace-nowrap">{row['IDV 25-26']}</td>
                            <td className="px-6 py-4 text-sm text-zinc-300 whitespace-nowrap">{row['IDV 26-27']}</td>
                            <td className="px-6 py-4 text-sm text-zinc-300 whitespace-nowrap">{row['Year of Manu.']}</td>
                            <td className="px-6 py-4 text-sm text-zinc-300 whitespace-nowrap">{row['Seating']}</td>
                            <td className="px-6 py-4 text-sm text-zinc-300 whitespace-nowrap">{row['Fuel']}</td>
                            <td className="px-6 py-4 text-sm text-zinc-300 whitespace-nowrap">{row['NCB 26-27%']}</td>
                            <td className="px-6 py-4 text-sm text-zinc-300 whitespace-nowrap">{row['Last Year Gross Premium']}</td>
                            <td className="px-6 py-4 text-sm text-zinc-300 whitespace-nowrap">{row['Net Premium 2026-27']}</td>
                            <td className="px-6 py-4 text-sm text-zinc-300 whitespace-nowrap">{row['CB%']}</td>
                            <td className="px-6 py-4 text-sm text-zinc-300 whitespace-nowrap">{row['Cash back']}</td>
                            <td className="px-6 py-4 text-sm text-zinc-300 whitespace-nowrap font-bold text-emerald-500">{row['Final cost']}</td>
                            <td className="px-6 py-4 text-sm text-zinc-300 whitespace-nowrap">{row['Difference']}</td>
                            <td className="px-6 py-4 text-sm text-zinc-300 whitespace-nowrap">{row['Cash back Status']}</td>
                            <td className="px-6 py-4 text-sm text-zinc-300 whitespace-nowrap">{row['Closing remarks']}</td>
                            <td className="px-6 py-4 text-sm whitespace-nowrap">
                              <span className={cn(
                                "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                                row.status === 'Policy Made' ? "bg-emerald-500/10 text-emerald-500" :
                                row.status === 'Proposal Made' ? "bg-blue-500/10 text-blue-500" :
                                row.status === 'Proposal Pending' ? "bg-amber-500/10 text-amber-500" :
                                "bg-zinc-800 text-zinc-400"
                              )}>
                                {row.status || 'Pending'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right whitespace-nowrap">
                              <button 
                                onClick={() => setSelectedBusWorkingRow(row)}
                                className="text-emerald-500 hover:text-emerald-400 font-bold text-xs"
                              >
                                Follow Up
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="p-20 text-center text-zinc-500">
                      <Bus size={64} className="mx-auto mb-4 opacity-20" />
                      <p className="text-lg font-medium">No Bus Working data uploaded yet.</p>
                      <p className="text-sm mt-1">Upload an Excel sheet to start working on bus calculations.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Reports */}
          {activeTab === 'reports' && reports && (
            <div className="space-y-8">
              <header className="flex justify-between items-end">
                <div>
                  <h2 className="text-3xl font-bold">Performance Reports</h2>
                  <p className="text-zinc-500">Detailed breakdown of policy conversion and follow-ups.</p>
                </div>
                {reportsSubTab === 'overview' && (
                  <div className="flex gap-4">
                    <button 
                      onClick={downloadYearlyReport}
                      className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-all font-bold shadow-lg shadow-emerald-900/20"
                    >
                      <Download size={20} />
                      Download {selectedYear} Policy Report
                    </button>
                    <button 
                      onClick={downloadYearlyNextYearUploadSheet}
                      className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all font-bold shadow-lg shadow-blue-900/20"
                    >
                      <Upload size={20} />
                      Next Year Upload Sheet ({selectedYear + 1})
                    </button>
                  </div>
                )}
              </header>

              <div className="flex gap-4 border-b border-zinc-800">
                <button 
                  onClick={() => setReportsSubTab('overview')}
                  className={cn(
                    "px-6 py-3 font-bold text-sm transition-all border-b-2",
                    reportsSubTab === 'overview' ? "border-emerald-500 text-emerald-500" : "border-transparent text-zinc-500 hover:text-zinc-300"
                  )}
                >
                  Overview
                </button>
                <button 
                  onClick={() => setReportsSubTab('monthly')}
                  className={cn(
                    "px-6 py-3 font-bold text-sm transition-all border-b-2",
                    reportsSubTab === 'monthly' ? "border-emerald-500 text-emerald-500" : "border-transparent text-zinc-500 hover:text-zinc-300"
                  )}
                >
                  Monthly Data
                </button>
              </div>

              {reportsSubTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                    { title: 'Policy Made', data: reports.policyMade, color: 'emerald', icon: CheckCircle2 },
                    { title: 'Proposal Pending', data: reports.proposalPending, color: 'blue', icon: Clock },
                    { title: 'Follow-up Only', data: reports.followUpOnly, color: 'zinc', icon: FileText },
                  ].map(section => (
                    <div key={section.title} className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden flex flex-col">
                      <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className={cn("p-2 rounded-lg bg-opacity-10", `bg-${section.color}-500 text-${section.color}-500`)}>
                            <section.icon size={20} />
                          </div>
                          <h3 className="font-bold">{section.title}</h3>
                        </div>
                        <span className="text-2xl font-bold">{section.data.length}</span>
                      </div>
                      <div className="flex-1 p-6 space-y-4">
                        <p className="text-sm text-zinc-500">
                          Total {section.title} cases recorded in the system.
                        </p>
                        <button 
                          onClick={() => downloadReport(section.data, section.title.replace(/ /g, '_'))}
                          className={cn(
                            "w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all",
                            `bg-${section.color}-600 hover:bg-${section.color}-500 text-white`
                          )}
                        >
                          <Download size={18} />
                          Download Report
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {reportsSubTab === 'monthly' && (
                <section className="space-y-6">
                  <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="text-zinc-500 text-xs uppercase tracking-wider border-b border-zinc-800">
                            <th className="px-6 py-4 font-semibold">Month</th>
                            <th className="px-6 py-4 font-semibold">Year</th>
                            <th className="px-6 py-4 font-semibold text-center">Policies Made</th>
                            <th className="px-6 py-4 font-semibold text-right">Total Gross Premium</th>
                            <th className="px-6 py-4 font-semibold text-right">Total Net Premium</th>
                            <th className="px-6 py-4 font-semibold text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/50">
                          {reports.monthlyBreakdown && reports.monthlyBreakdown.length > 0 ? (
                            reports.monthlyBreakdown.map((item: any, idx: number) => (
                              <tr key={idx} className="hover:bg-zinc-800/50 transition-colors">
                                <td className="px-6 py-4 text-sm text-white font-medium">
                                  {MONTHS.find(m => m.value === item.targetMonth)?.label}
                                </td>
                                <td className="px-6 py-4 text-sm text-zinc-300">{item.targetYear}</td>
                                <td className="px-6 py-4 text-sm text-center">
                                  <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 rounded-lg font-bold">
                                    {item.count}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-right text-zinc-300">
                                  ₹{item.totalGross.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 text-sm text-right text-zinc-300">
                                  ₹{item.totalNet.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <div className="flex flex-col gap-2 items-end">
                                    <button 
                                      onClick={() => downloadMonthlyReport(item.targetYear, item.targetMonth)}
                                      className="text-emerald-500 hover:text-emerald-400 font-bold text-xs flex items-center gap-1"
                                    >
                                      <Download size={14} />
                                      Policy Report
                                    </button>
                                    <button 
                                      onClick={() => downloadNextYearUploadSheet(item.targetYear, item.targetMonth)}
                                      className="text-blue-500 hover:text-blue-400 font-bold text-xs flex items-center gap-1"
                                    >
                                      <Upload size={14} />
                                      Next Year Upload Sheet
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={6} className="px-6 py-12 text-center text-zinc-500 italic">
                                No monthly policy data available yet.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </section>
              )}

              {currentUser.role === 'admin' && reportsSubTab === 'overview' && (
                <section className="space-y-6">
                  <div className="flex items-center gap-3">
                    <Clock className="text-zinc-500" />
                    <h3 className="text-xl font-bold">User Login/Logout Logs</h3>
                  </div>
                  <LogsView />
                </section>
              )}
            </div>
          )}

          {/* User Management */}
          {activeTab === 'users' && currentUser.role === 'admin' && (
            <div className="space-y-8">
              <header>
                <h2 className="text-3xl font-bold">User Management</h2>
                <p className="text-zinc-500">Manage system users and reset passwords.</p>
              </header>
              <UserManagement />
            </div>
          )}

        </div>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {selectedPolicy && (
          <PolicyModal 
            customer={selectedPolicy} 
            onClose={() => setSelectedPolicy(null)}
            onSave={handleSaveFollowUp}
          />
        )}
        {isNewCustomerModalOpen && (
          <NewCustomerModal 
            onClose={() => setIsNewCustomerModalOpen(false)}
            onSave={handleSaveNewCustomer}
          />
        )}
        {selectedBusWorkingRow && (
          <BusWorkingFollowUpModal 
            row={selectedBusWorkingRow}
            onClose={() => setSelectedBusWorkingRow(null)}
            onSave={handleSaveBusFollowUp}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
