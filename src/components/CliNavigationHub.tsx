import React, { useState } from 'react';
import { 
  Users, 
  TrendingUp, 
  FileText, 
  Settings, 
  CreditCard, 
  Search, 
  ArrowUpRight, 
  CheckCircle2, 
  Layers, 
  Calendar, 
  Landmark, 
  ShieldCheck, 
  Car, 
  Building2, 
  HeartPulse, 
  Bus, 
  QrCode, 
  Wallet, 
  Plus, 
  ChevronRight,
  Filter,
  DollarSign,
  Send,
  AlertCircle,
  Phone,
  PhoneCall,
  Mail,
  PieChart,
  Coins,
  Stamp,
  ExternalLink,
  Languages,
  Check,
  Flame,
  BadgeCheck,
  Copy,
  MessageSquare,
  Clock,
  Download,
  Printer,
  ChevronDown
} from 'lucide-react';
import { ClaimRecord } from '../types/insurance';

interface CliNavigationHubProps {
  activeTab: 'dashboard' | 'clients' | 'tasks' | 'reports' | 'settings' | 'payments';
  onTabChange: (tab: 'dashboard' | 'clients' | 'tasks' | 'reports' | 'settings' | 'payments') => void;
  claims: ClaimRecord[];
  onSelectClaim: (claim: ClaimRecord) => void;
  onOpenGovernance: () => void;
  onOpenReportsModal: () => void;
}

export const CliNavigationHub: React.FC<CliNavigationHubProps> = ({
  activeTab,
  onTabChange,
  claims,
  onSelectClaim,
  onOpenGovernance,
  onOpenReportsModal,
}) => {
  // Clients state & search
  const [clientSearch, setClientSearch] = useState('');
  const [selectedSchemeFilter, setSelectedSchemeFilter] = useState<string>('ALL');
  
  // Settings: English & Hindi Language Switcher state
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [twoFactorAuth, setTwoFactorAuth] = useState(true);
  const [directDisbursement, setDirectDisbursement] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);

  // Active call modal demo & copied notification
  const [callingClient, setCallingClient] = useState<{ name: string; phone: string; city: string } | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);

  // Call timer simulation
  React.useEffect(() => {
    let interval: any;
    if (callingClient) {
      setCallDuration(0);
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callingClient]);

  const handleCopyPhone = (phone: string) => {
    navigator.clipboard?.writeText(phone);
    setCopiedPhone(phone);
    setTimeout(() => setCopiedPhone(null), 2000);
  };

  // Tasks state
  const [tasks, setTasks] = useState([
    { id: 't1', title: 'LIC Policy Claim Premium Assessment', category: 'LIC Policy', dueDate: 'Today, 4:00 PM', priority: 'High', status: 'Pending', client: 'Rahul Sharma', amount: '$3,400' },
    { id: 't2', title: 'Smart Pass Transit Concession Verification', category: 'Smart Transit Pass', dueDate: 'Tomorrow, 11:30 AM', priority: 'Medium', status: 'In Review', client: 'Vikram Sundaram', amount: '$120' },
    { id: 't3', title: 'HDFC & SBI Mutual Fund SIP Liquidation Review', category: 'Mutual Funds', dueDate: 'Sep 29, 2026', priority: 'High', status: 'Pending', client: 'Priya Nair', amount: '$15,000' },
    { id: 't4', title: 'Post Office Senior Citizen Scheme Monthly Disbursement', category: 'Post Office Schemes', dueDate: 'Oct 01, 2026', priority: 'Medium', status: 'Completed', client: 'Arun Kumar', amount: '$4,800' },
    { id: 't5', title: 'Audit Fire Incident Loss Verification (CLM-2026-8801)', category: 'SIU Adjudication', dueDate: 'Oct 03, 2026', priority: 'Critical', status: 'Pending', client: 'Sneha Reddy', amount: '$85,000' },
    { id: 't6', title: 'NPS Tier-1 Corporate Contribution Ledger Sync', category: 'Retirement Scheme', dueDate: 'Oct 05, 2026', priority: 'Low', status: 'Completed', client: 'Ananya Deshmukh', amount: '$2,100' },
    { id: 't7', title: 'Sukanya Samriddhi Yojana (SSY) Annual Audit', category: 'Post Office Schemes', dueDate: 'Oct 06, 2026', priority: 'Medium', status: 'In Review', client: 'Meenakshi Iyer', amount: '$1,500' },
  ]);

  // Comprehensive Private Enterprise Scheme Directory (All Top Companies & Schemes)
  const SCHEME_CATEGORIES = [
    {
      id: 'LIC',
      title: 'LIC Life & Term Policies',
      desc: 'Jeevan Anand, Jeevan Labh, Tech Term, SIIP & Saral Pension',
      icon: <Landmark className="w-5 h-5 text-blue-400" />,
      tag: 'Life Insurance',
      partner: 'Life Insurance Corporation (Clone LIC)',
      interestOrReturn: '8.2% Guaranteed Bonus',
      popular: 'Jeevan Anand #99201',
    },
    {
      id: 'MutualFunds',
      title: 'Top Mutual Funds & SIPs',
      desc: 'SBI Bluechip, HDFC Top 100, ICICI Prudential, Axis Midcap & Nippon',
      icon: <PieChart className="w-5 h-5 text-purple-400" />,
      tag: 'Equity & Hybrid SIP',
      partner: 'AMFI / Direct Institutional AMC',
      interestOrReturn: '14.8% 3-Yr CAGR',
      popular: 'SBI Bluechip Growth',
    },
    {
      id: 'PostOffice',
      title: 'Post Office Small Savings',
      desc: 'Public Provident Fund (PPF), Sukanya Samriddhi (SSY), SCSS & NSC',
      icon: <Stamp className="w-5 h-5 text-amber-400" />,
      tag: 'Guaranteed Sovereign',
      partner: 'India Post Savings Bank Network',
      interestOrReturn: '7.4% - 8.2% p.a.',
      popular: 'PPF 15-Yr Tax-Free',
    },
    {
      id: 'SmartPass',
      title: 'Smart Bus & Transit Pass',
      desc: 'City Express Pass, Concession Smart Card, Metro RFID & Annual Commute',
      icon: <Bus className="w-5 h-5 text-cyan-400" />,
      tag: 'Smart Transit Pass',
      partner: 'Metropolitan & Municipal Transit Corp',
      interestOrReturn: 'Instant Digital Card Pass',
      popular: 'City Bus All-Route Pass',
    },
    {
      id: 'HealthProtection',
      title: 'Comprehensive Mediclaim & Health',
      desc: 'Star Health Comprehensive, Care Health & HDFC ERGO Optima Cashless',
      icon: <HeartPulse className="w-5 h-5 text-rose-400" />,
      tag: 'Health & Cashless',
      partner: 'Direct TPA Cashless Network',
      interestOrReturn: '10,000+ Hospital Network',
      popular: 'Optima Super Secure',
    },
    {
      id: 'CorporateNPS',
      title: 'NPS & Corporate Retirement Pension',
      desc: 'National Pension System Tier I & Tier II Retirement Wealth Management',
      icon: <Coins className="w-5 h-5 text-emerald-400" />,
      tag: 'Pension & Wealth',
      partner: 'PFRDA Institutional Fund Managers',
      interestOrReturn: 'Tax Exempt Sec 80CCD (1B)',
      popular: 'Tier-1 Pension Growth',
    },
  ];

  // Payment Form State
  const [selectedScheme, setSelectedScheme] = useState(SCHEME_CATEGORIES[0].id);
  const [paymentAmount, setPaymentAmount] = useState('3500');
  const [policyId, setPolicyId] = useState('LIC-JA-2026-99201');
  const [beneficiaryName, setBeneficiaryName] = useState('Rahul Sharma');
  const [beneficiaryPhone, setBeneficiaryPhone] = useState('+91 98765 43210');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'NetBanking' | 'Card' | 'Wallet'>('UPI');
  const [paymentSuccess, setPaymentSuccess] = useState<string | null>(null);
  const [receiptDetails, setReceiptDetails] = useState<any | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // 248 Profiles Dataset representation (Rich Profiles with Interactive Click-to-Call Phone numbers)
  const mockClients = [
    { id: 'CLI-001', name: 'Rahul Sharma', email: 'rahul.sharma@clic.enterprise', phone: '+91 98765 43210', schemes: ['LIC Jeevan Anand #99201', 'Smart Bus Pass #TN-8821', 'SBI Bluechip SIP'], status: 'Approved', totalClaims: 2, totalPaid: '$8,450', tenure: '3.5 yrs', city: 'Mumbai' },
    { id: 'CLI-002', name: 'Priya Nair', email: 'priya.nair@clic.enterprise', phone: '+91 94441 23456', schemes: ['HDFC Top 100 Mutual Fund', 'Post Office PPF #4412', 'Comprehensive Auto Shield'], status: 'Approved', totalClaims: 1, totalPaid: '$14,200', tenure: '2.1 yrs', city: 'Chennai' },
    { id: 'CLI-003', name: 'Arun Kumar', email: 'arun.kumar@clic.enterprise', phone: '+91 98200 11223', schemes: ['Post Office SCSS', 'Smart Pass Metro #DL-009', 'LIC Tech Term'], status: 'Approved', totalClaims: 3, totalPaid: '$48,000', tenure: '5.0 yrs', city: 'Delhi' },
    { id: 'CLI-004', name: 'Sneha Reddy', email: 'sneha.reddy@clic.enterprise', phone: '+91 97000 88990', schemes: ['Sukanya Samriddhi (SSY)', 'LIC Jeevan Labh', 'Care Health Cashless'], status: 'Approved', totalClaims: 1, totalPaid: '$3,800', tenure: '1.8 yrs', city: 'Hyderabad' },
    { id: 'CLI-005', name: 'Vikram Sundaram', email: 'vikram.s@clic.enterprise', phone: '+91 99401 55667', schemes: ['Smart Transit Bus Pass #BL-771', 'ICICI Prudential SIP'], status: 'Approved', totalClaims: 0, totalPaid: '$1,200', tenure: '1.2 yrs', city: 'Bengaluru' },
    { id: 'CLI-006', name: 'Ananya Deshmukh', email: 'ananya.d@clic.enterprise', phone: '+91 98111 22334', schemes: ['LIC Saral Pension', 'Post Office NSC (VIII Issue)', 'Axis Midcap SIP'], status: 'Approved', totalClaims: 1, totalPaid: '$12,500', tenure: '4.2 yrs', city: 'Pune' },
    { id: 'CLI-007', name: 'Karthik Raman', email: 'karthik.r@clic.enterprise', phone: '+91 98840 99887', schemes: ['Smart Bus Pass #KL-302', 'Star Health Comprehensive', 'NPS Tier-1 Pension'], status: 'Approved', totalClaims: 2, totalPaid: '$18,900', tenure: '2.8 yrs', city: 'Kochi' },
    { id: 'CLI-008', name: 'Meenakshi Iyer', email: 'meenakshi.i@clic.enterprise', phone: '+91 98450 12389', schemes: ['LIC Jeevan Umang', 'Post Office Monthly Income (MIS)', 'SBI Small Cap'], status: 'Approved', totalClaims: 0, totalPaid: '$6,400', tenure: '3.0 yrs', city: 'Coimbatore' },
    { id: 'CLI-009', name: 'Rohan Gupta', email: 'rohan.gupta@clic.enterprise', phone: '+91 98199 44556', schemes: ['LIC SIIP Market Linked', 'Nippon India Growth SIP'], status: 'Approved', totalClaims: 1, totalPaid: '$7,200', tenure: '2.4 yrs', city: 'Kolkata' },
    { id: 'CLI-010', name: 'Divya Venkatesh', email: 'divya.v@clic.enterprise', phone: '+91 94450 67890', schemes: ['Smart Transit Metro Pass #CH-44', 'Post Office PPF'], status: 'Approved', totalClaims: 0, totalPaid: '$2,400', tenure: '1.5 yrs', city: 'Madurai' },
    { id: 'CLI-011', name: 'Amitabh Sen', email: 'amitabh.s@clic.enterprise', phone: '+91 98300 23412', schemes: ['LIC Bima Jyoti Guaranteed', 'HDFC ERGO Cashless'], status: 'Approved', totalClaims: 2, totalPaid: '$21,300', tenure: '6.1 yrs', city: 'Ahmedabad' },
    { id: 'CLI-012', name: 'Shweta Chawla', email: 'shweta.c@clic.enterprise', phone: '+91 98990 77123', schemes: ['Parag Parikh Flexi Cap', 'Smart Bus Annual Pass'], status: 'Approved', totalClaims: 0, totalPaid: '$4,100', tenure: '1.9 yrs', city: 'Chandigarh' },
  ];

  const filteredClients = mockClients.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
      c.email.toLowerCase().includes(clientSearch.toLowerCase()) ||
      c.phone.includes(clientSearch) ||
      c.city.toLowerCase().includes(clientSearch.toLowerCase()) ||
      c.schemes.some(s => s.toLowerCase().includes(clientSearch.toLowerCase()));
    
    if (selectedSchemeFilter === 'ALL') return matchesSearch;
    return matchesSearch && c.schemes.some(s => s.toLowerCase().includes(selectedSchemeFilter.toLowerCase()));
  });

  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setPaymentSuccess(null);
    setTimeout(() => {
      setIsProcessing(false);
      const txnId = `CLI-TXN-${Date.now().toString().slice(-7)}`;
      const receipt = {
        txnId,
        scheme: SCHEME_CATEGORIES.find(s => s.id === selectedScheme)?.title || selectedScheme,
        policyId,
        beneficiaryName,
        beneficiaryPhone,
        amount: paymentAmount,
        method: paymentMethod,
        timestamp: new Date().toLocaleString(),
        status: 'DIRECT APPROVAL SETTLED'
      };
      setReceiptDetails(receipt);
      setPaymentSuccess(`Transaction ${txnId} settled successfully! Instant digital certificate and scheme approval created.`);
    }, 650);
  };

  return (
    <div className="space-y-6">
      {/* ======================================================== */}
      {/* CLI CONNECTION UNIFIED TOP NAVIGATION BAR */}
      {/* ======================================================== */}
      <div className="bg-gradient-to-r from-[#091224] via-[#0E1B38] to-[#0A1326] border border-cyan-500/30 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
        
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs uppercase font-mono tracking-widest text-cyan-400 font-bold">
                CLI CONNECTION • PRIVATE ENTERPRISE PORTAL
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-cyan-300 border border-blue-800">
                248 Active Profiles
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                100% Direct Approvals
              </span>
            </div>
            
            <h2 className="font-['Caveat',cursive] text-2xl sm:text-3xl lg:text-4xl text-white font-bold tracking-wide">
              Better Connections for a Smarter Tomorrow
            </h2>
            
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {language === 'en' 
                ? 'Centralized executive workspace for 248 Client Profiles, Task Programs, Scheme Payments (LIC Policies, Mutual Funds, Post Office Savings, Smart Transit Pass), Audited Reports & Bilingual Controls.'
                : '248 ग्राहक प्रोफाइल, कार्य कार्यक्रम, योजना भुगतान (एलआईसी पॉलिसी, म्यूचुअल फंड, डाकघर बचत, स्मार्ट बस पास), ऑडिट रिपोर्ट और द्विभाषी सेटिंग्स के लिए निजी एकीकृत पोर्टल।'
              }
            </p>
          </div>

          {/* 6 UNIFIED TAB BUTTONS - Clicking opens ONLY that specific section */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 bg-[#050B18] p-1.5 sm:p-2 rounded-2xl border border-slate-700/80 shadow-inner">
            {[
              { id: 'dashboard', label: language === 'en' ? 'Dashboard' : 'डैशबोर्ड', icon: <TrendingUp className="w-4 h-4" /> },
              { id: 'clients', label: language === 'en' ? 'Clients (248)' : 'ग्राहक (248)', icon: <Users className="w-4 h-4" /> },
              { id: 'tasks', label: language === 'en' ? 'Tasks' : 'कार्य', icon: <Calendar className="w-4 h-4" /> },
              { id: 'payments', label: language === 'en' ? 'Payments & Schemes' : 'भुगतान व योजनाएं', icon: <CreditCard className="w-4 h-4 text-emerald-400" /> },
              { id: 'reports', label: language === 'en' ? 'Reports' : 'रिपोर्ट्स', icon: <FileText className="w-4 h-4" /> },
              { id: 'settings', label: language === 'en' ? 'Settings' : 'सेटिंग्स', icon: <Settings className="w-4 h-4" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id as any)}
                className={`flex items-center gap-2 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-400 text-white shadow-lg shadow-cyan-500/25 ring-1 ring-cyan-300/40'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* ======================================================== */}
      {/* TAB CONTENT: DASHBOARD OVERVIEW BAR (Reference UI Mockup) */}
      {/* Shown ONLY when activeTab === 'dashboard' */}
      {/* ======================================================== */}
      {activeTab === 'dashboard' && (
        <div className="space-y-4">
          {/* Executive KPI Ticker & Stats Matching Reference Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Total Clients</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-black text-white font-mono">248</span>
                  <span className="text-xs font-bold text-emerald-400 font-mono">+12% this mo.</span>
                </div>
                <span className="text-[10px] text-slate-500 block mt-0.5">Approved Policyholders</span>
              </div>
              <div className="w-11 h-11 rounded-xl bg-blue-950/80 border border-blue-800/80 text-cyan-400 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Active Schemes</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-black text-white font-mono">42</span>
                  <span className="text-xs font-bold text-cyan-400 font-mono">+5 New</span>
                </div>
                <span className="text-[10px] text-slate-500 block mt-0.5">LIC, Mutual Funds, Post Office</span>
              </div>
              <div className="w-11 h-11 rounded-xl bg-indigo-950/80 border border-indigo-800/80 text-indigo-400 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Pending Tasks</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-black text-white font-mono">{tasks.filter(t => t.status === 'Pending').length}</span>
                  <span className="text-xs font-bold text-amber-400 font-mono">In Review</span>
                </div>
                <span className="text-[10px] text-slate-500 block mt-0.5">Underwriting & SIU Audits</span>
              </div>
              <div className="w-11 h-11 rounded-xl bg-amber-950/80 border border-amber-800/80 text-amber-400 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Approval Rate</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-black text-emerald-400 font-mono">98.4%</span>
                  <span className="text-xs font-bold text-emerald-500 font-mono">Verified</span>
                </div>
                <span className="text-[10px] text-slate-500 block mt-0.5">Zero Delinquency Standard</span>
              </div>
              <div className="w-11 h-11 rounded-xl bg-emerald-950/80 border border-emerald-800/80 text-emerald-400 flex items-center justify-center">
                <BadgeCheck className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB CONTENT: CLIENTS (248 Profiles with Direct Call Links) */}
      {/* Shown ONLY when activeTab === 'clients' */}
      {/* ======================================================== */}
      {activeTab === 'clients' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-bold text-white tracking-tight">
                  {language === 'en' ? 'Client Directory & Scheme Registry (248 Profiles)' : 'ग्राहक निर्देशिका एवं योजना पंजी (248 प्रोफाइल)'}
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                  All Approved
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {language === 'en'
                  ? 'Interactive client portfolio. Click any phone number to touch-call or copy, review registered schemes, and execute direct payments.'
                  : 'इंटरैक्टिव ग्राहक पोर्टफोलियो। कॉल करने या कॉपी करने के लिए फोन नंबर पर क्लिक करें, पंजीकृत योजनाएं देखें और भुगतान करें।'
                }
              </p>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                  placeholder="Search name, phone, city, scheme..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-sans"
                />
              </div>

              <select
                value={selectedSchemeFilter}
                onChange={(e) => setSelectedSchemeFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                <option value="ALL">All Schemes</option>
                <option value="LIC">LIC Policies</option>
                <option value="Mutual Fund">Mutual Funds</option>
                <option value="Post Office">Post Office Schemes</option>
                <option value="Smart">Smart Transit Pass</option>
              </select>
            </div>
          </div>

          {/* Client Table */}
          <div className="overflow-x-auto border border-slate-800 rounded-2xl bg-slate-950">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase tracking-wider bg-slate-950/80">
                  <th className="py-3.5 px-4">Client Name & ID</th>
                  <th className="py-3.5 px-4">Direct Phone (Touch to Call)</th>
                  <th className="py-3.5 px-4">Email Address</th>
                  <th className="py-3.5 px-4">Registered Schemes</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Settled Payouts</th>
                  <th className="py-3.5 px-4 text-right">Direct Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-slate-900/60 transition group">
                    <td className="py-3.5 px-4 font-semibold text-white">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center font-bold text-xs shadow-md shrink-0">
                          {client.name.charAt(0)}
                        </div>
                        <div>
                          <span className="group-hover:text-cyan-300 transition">{client.name}</span>
                          <span className="text-[10px] text-slate-500 block font-mono">
                            {client.id} • {client.city} ({client.tenure})
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Direct Touch to Call Phone Number */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setCallingClient({ name: client.name, phone: client.phone, city: client.city })}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-950/80 hover:bg-blue-900 text-cyan-300 border border-blue-800/80 hover:border-cyan-400 transition cursor-pointer text-xs font-mono"
                          title="Touch to dial client through VOIP"
                        >
                          <PhoneCall className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <span>{client.phone}</span>
                        </button>
                        
                        <button
                          onClick={() => handleCopyPhone(client.phone)}
                          className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
                          title="Copy phone number"
                        >
                          {copiedPhone === client.phone ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-300 font-mono text-[11px]">
                      {client.email}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {client.schemes.map((s) => (
                          <span key={s} className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-slate-900 text-slate-300 border border-slate-700">
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                        <BadgeCheck className="w-3 h-3 text-emerald-400" />
                        <span>{client.status}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400">
                      {client.totalPaid}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          setBeneficiaryName(client.name);
                          setBeneficiaryPhone(client.phone);
                          onTabChange('payments');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-[11px] font-bold transition cursor-pointer shadow-sm"
                      >
                        Make Payment
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB CONTENT: TASKS (Operational Verification) */}
      {/* Shown ONLY when activeTab === 'tasks' */}
      {/* ======================================================== */}
      {activeTab === 'tasks' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-bold text-white tracking-tight">
                  {language === 'en' ? 'Task Programs & Scheme Verifications' : 'कार्य कार्यक्रम एवं योजना सत्यापन'}
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Underwriting workflows for LIC Policies, Mutual Fund SIP authorizations, Post Office savings verifications & transit passes.
              </p>
            </div>

            <button
              onClick={() => {
                const newTask = {
                  id: `t-${Date.now()}`,
                  title: 'New Mutual Fund SIP Mandate Verification',
                  category: 'Mutual Funds',
                  dueDate: 'Oct 07, 2026',
                  priority: 'Medium',
                  status: 'Pending',
                  client: 'Priya Nair',
                  amount: '$5,000'
                };
                setTasks([newTask, ...tasks]);
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-cyan-500 text-white transition flex items-center gap-1.5 cursor-pointer shadow-md self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Task</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-cyan-300 border border-slate-700 font-semibold">
                      {task.category}
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                      task.priority === 'Critical' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                      task.priority === 'High' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                      'bg-slate-800 text-slate-300'
                    }`}>
                      {task.priority} Priority
                    </span>
                  </div>

                  <h4 className="font-bold text-white text-sm leading-snug">{task.title}</h4>
                  
                  <div className="flex items-center justify-between text-xs text-slate-400 mt-2 font-mono">
                    <span>Client: <strong className="text-slate-200 font-sans">{task.client}</strong></span>
                    <span>Due: {task.dueDate}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-emerald-400">Val: {task.amount}</span>
                  
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold ${
                      task.status === 'Completed' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                      task.status === 'In Review' ? 'bg-blue-950 text-cyan-300 border border-blue-800' :
                      'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}>
                      {task.status}
                    </span>

                    <button
                      onClick={() => {
                        setTasks(tasks.map(t => t.id === task.id ? { ...t, status: t.status === 'Completed' ? 'Pending' : 'Completed' } : t));
                      }}
                      className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
                    >
                      {task.status === 'Completed' ? 'Reopen' : 'Mark Done'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB CONTENT: PAYMENTS & SCHEMES (LIC, Mutual Funds, Post Office, Smart Transit) */}
      {/* Shown ONLY when activeTab === 'payments' */}
      {/* ======================================================== */}
      {activeTab === 'payments' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-bold text-white tracking-tight">
                  {language === 'en' 
                    ? 'Payment & Scheme Direct Application Gateway' 
                    : 'भुगतान एवं योजना प्रत्यक्ष आवेदन गेटवे'}
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Complete portal to apply and pay for <strong>LIC Policies</strong>, <strong>Top Mutual Funds & SIPs</strong>, 
                <strong>Post Office Savings (PPF, SSY, NSC)</strong>, and <strong>Smart Transit Bus Passes</strong>.
              </p>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-mono">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Direct Bank Settlement Active</span>
            </div>
          </div>

          {/* Scheme Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {SCHEME_CATEGORIES.map((scheme) => (
              <div
                key={scheme.id}
                onClick={() => {
                  setSelectedScheme(scheme.id);
                  setPolicyId(scheme.popular);
                }}
                className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
                  selectedScheme === scheme.id
                    ? 'bg-blue-950/80 border-cyan-400 shadow-xl ring-2 ring-cyan-400/40'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                      {scheme.icon}
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">
                      {scheme.tag}
                    </span>
                  </div>

                  <h4 className="font-bold text-white text-sm">{scheme.title}</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{scheme.desc}</p>
                </div>

                <div className="mt-4 pt-2.5 border-t border-slate-900 flex items-center justify-between text-xs">
                  <span className="text-[11px] font-mono text-cyan-400 font-medium">
                    {scheme.interestOrReturn}
                  </span>
                  <span className={`text-[11px] font-bold ${selectedScheme === scheme.id ? 'text-white' : 'text-slate-500'}`}>
                    {selectedScheme === scheme.id ? 'Selected Scheme ✓' : 'Select Scheme →'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Payment Form Box */}
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-5">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <Send className="w-4 h-4 text-cyan-400" />
                <span>Direct Application & Payment Form ({SCHEME_CATEGORIES.find(s => s.id === selectedScheme)?.title})</span>
              </h4>
              <span className="text-xs text-slate-400 font-mono">Instant Approval Guarantee</span>
            </div>

            {paymentSuccess && receiptDetails && (
              <div className="p-4 rounded-xl bg-emerald-950/90 border border-emerald-800 text-emerald-200 text-xs space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-bold block text-sm">Payment & Scheme Application Successful!</span>
                    <span className="text-[11px] font-mono text-emerald-300">{paymentSuccess}</span>
                  </div>
                </div>

                <div className="p-3 bg-black/40 rounded-lg border border-emerald-900/60 font-mono text-[11px] grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <span className="text-slate-400 block text-[10px]">TXN ID</span>
                    <span className="text-white font-bold">{receiptDetails.txnId}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">CLIENT</span>
                    <span className="text-white font-bold">{receiptDetails.beneficiaryName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">AMOUNT PAID</span>
                    <span className="text-emerald-400 font-bold">${receiptDetails.amount}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">SETTLEMENT</span>
                    <span className="text-cyan-400 font-bold">{receiptDetails.method} (Instant)</span>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleProcessPayment} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block">Policy / Mandate / Transit Pass ID</label>
                <input
                  type="text"
                  value={policyId}
                  onChange={(e) => setPolicyId(e.target.value)}
                  placeholder="e.g. LIC-JA-99201 or SIP-HDFC-8821"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-cyan-400 font-mono"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block">Client / Beneficiary Name</label>
                <input
                  type="text"
                  value={beneficiaryName}
                  onChange={(e) => setBeneficiaryName(e.target.value)}
                  placeholder="Rahul Sharma"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block">Client Registered Phone Number</label>
                <input
                  type="text"
                  value={beneficiaryPhone}
                  onChange={(e) => setBeneficiaryPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-cyan-400 font-mono"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block">Payment / Premium / Investment Amount ($ or ₹)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono">$</span>
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="3500"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 pl-8 pr-3 text-white focus:outline-none focus:border-cyan-400 font-mono font-bold"
                    required
                  />
                </div>
              </div>

              <div className="md:col-span-2 space-y-1">
                <label className="text-slate-300 font-semibold block">Select Payment Channel</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['UPI', 'NetBanking', 'Card', 'Wallet'] as const).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`py-2 px-2 text-center rounded-xl border text-xs font-bold transition cursor-pointer ${
                        paymentMethod === method
                          ? 'bg-blue-600 text-white border-cyan-400 shadow-md'
                          : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2 pt-2">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 shadow-xl shadow-emerald-500/20 transition flex items-center justify-center gap-2 cursor-pointer text-sm"
                >
                  <DollarSign className="w-4 h-4" />
                  <span>
                    {isProcessing 
                      ? 'Processing Scheme Settlement...' 
                      : `Confirm & Pay $${paymentAmount} for ${selectedScheme} via ${paymentMethod}`}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB CONTENT: REPORTS (Audited Analytics & Scheme Returns) */}
      {/* Shown ONLY when activeTab === 'reports' */}
      {/* ======================================================== */}
      {activeTab === 'reports' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-bold text-white tracking-tight">
                  {language === 'en' ? 'Portfolio Performance & Regulatory Scheme Reports' : 'पोर्टफोलियो प्रदर्शन एवं नियामक योजना रिपोर्ट'}
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Audited financial loss ratios, scheme underwriting reserves, Mutual Fund CAGR summaries & compliance filings.
              </p>
            </div>

            <button
              onClick={onOpenReportsModal}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <span>Open Full Executive Report Modal</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-[10px] uppercase font-mono text-slate-400 block font-semibold">Total Portfolio Exposure</span>
              <span className="text-2xl font-bold font-mono text-white">
                ${claims.reduce((s, c) => s + c.claimAmount, 0).toLocaleString()}
              </span>
              <span className="text-xs text-slate-500 block">Across {claims.length} evaluated claims & 248 scheme profiles</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-[10px] uppercase font-mono text-emerald-400 block font-semibold">Fast-Track Settled Disbursements</span>
              <span className="text-2xl font-bold font-mono text-emerald-300">
                ${claims.filter(c => c.status === 'Fast-Track Approved' || c.status === 'Settled').reduce((s, c) => s + c.claimAmount, 0).toLocaleString()}
              </span>
              <span className="text-xs text-slate-500 block">Straight-through automated disbursements</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-[10px] uppercase font-mono text-rose-400 block font-semibold">Protected SIU Anomaly Savings</span>
              <span className="text-2xl font-bold font-mono text-rose-300">
                ${claims.filter(c => c.riskTier === 'Critical' || c.riskTier === 'Elevated').reduce((s, c) => s + c.claimAmount, 0).toLocaleString()}
              </span>
              <span className="text-xs text-slate-500 block">Flagged for forensic audit</span>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB CONTENT: SETTINGS (Language: English & Hindi Included) */}
      {/* Shown ONLY when activeTab === 'settings' */}
      {/* ======================================================== */}
      {activeTab === 'settings' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div>
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-slate-400" />
              <h3 className="text-lg font-bold text-white tracking-tight">
                {language === 'en' ? 'System Settings & Scheme Preferences' : 'सिस्टम सेटिंग्स एवं योजना प्राथमिकताएं'}
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Configure language localization, automated scheme settlements, and multi-factor authentication.
            </p>
          </div>

          <div className="space-y-4 max-w-2xl text-xs">
            {/* Bilingual Switcher: English & Hindi */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Languages className="w-4 h-4 text-cyan-400" />
                  <span className="font-bold text-white text-sm">System Language / भाषा</span>
                </div>
                <span className="text-slate-400 text-[11px] block">
                  Select default language interface (English or हिन्दी)
                </span>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-700">
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                    language === 'en'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {language === 'en' && <Check className="w-3.5 h-3.5" />}
                  <span>English</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLanguage('hi')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                    language === 'hi'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {language === 'hi' && <Check className="w-3.5 h-3.5" />}
                  <span>हिन्दी</span>
                </button>
              </div>
            </div>

            {/* Direct Auto-Disbursement */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4">
              <div>
                <span className="font-bold text-white block">
                  {language === 'en' ? 'Direct Auto-Disbursement' : 'प्रत्यक्ष स्वचालित संवितरण'}
                </span>
                <span className="text-slate-400 text-[11px]">
                  Instant settlement for verified claims, mutual fund payouts & bus pass renewals
                </span>
              </div>
              <input
                type="checkbox"
                checked={directDisbursement}
                onChange={(e) => setDirectDisbursement(e.target.checked)}
                className="w-4 h-4 rounded text-cyan-500 accent-cyan-500 cursor-pointer"
              />
            </div>

            {/* Multi-Factor Authentication */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4">
              <div>
                <span className="font-bold text-white block">
                  {language === 'en' ? 'Multi-Factor Authentication (2FA)' : 'बहु-कारक प्रमाणीकरण (2FA)'}
                </span>
                <span className="text-slate-400 text-[11px]">
                  Enforce OTP authorization for policy payouts and scheme withdrawals &gt; $25,000
                </span>
              </div>
              <input
                type="checkbox"
                checked={twoFactorAuth}
                onChange={(e) => setTwoFactorAuth(e.target.checked)}
                className="w-4 h-4 rounded text-cyan-500 accent-cyan-500 cursor-pointer"
              />
            </div>

            {/* SMS & Notification Alerts */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4">
              <div>
                <span className="font-bold text-white block">
                  {language === 'en' ? 'SMS & Policyholder WhatsApp Alerts' : 'एसएमएस और व्हाट्सएप अलर्ट'}
                </span>
                <span className="text-slate-400 text-[11px]">
                  Instant notification alerts for premium receipts, smart pass expiry & claims status
                </span>
              </div>
              <input
                type="checkbox"
                checked={smsAlerts}
                onChange={(e) => setSmsAlerts(e.target.checked)}
                className="w-4 h-4 rounded text-cyan-500 accent-cyan-500 cursor-pointer"
              />
            </div>

            {/* Governance Action */}
            <div className="pt-2">
              <button
                onClick={onOpenGovernance}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center gap-2 cursor-pointer shadow-md"
              >
                <span>Open Model Governance & Thresholds</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* DIRECT DIAL MODAL SIMULATION (Interactive Call Interface) */}
      {/* ======================================================== */}
      {callingClient && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0B132B] border border-cyan-500/80 w-full max-w-sm rounded-3xl p-6 shadow-2xl text-center space-y-4 animate-scaleUp">
            <div className="relative w-20 h-20 rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-500 mx-auto flex items-center justify-center">
              <PhoneCall className="w-9 h-9 animate-pulse" />
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
              </span>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold block">
                Call Connected • {String(Math.floor(callDuration / 60)).padStart(2, '0')}:{String(callDuration % 60).padStart(2, '0')}
              </span>
              <h3 className="text-xl font-bold text-white mt-1">{callingClient.name}</h3>
              <p className="text-sm font-mono text-cyan-300 mt-0.5">{callingClient.phone}</p>
              <span className="text-[11px] text-slate-400 block mt-1">{callingClient.city} • Verified Policyholder</span>
            </div>

            <p className="text-xs text-slate-400 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              Encrypted enterprise VOIP channel connected through CLI CONNECTION Secure Gateway. Touch screen active.
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => setCallingClient(null)}
                className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition cursor-pointer shadow-lg shadow-rose-600/30"
              >
                End Call
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
