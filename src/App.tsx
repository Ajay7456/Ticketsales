import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Ticket, 
  Calendar, 
  MapPin, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ShieldCheck, 
  BarChart3, 
  ScanLine,
  Camera,
  X,
  Menu,
  MessageCircle,
  Twitter,
  Facebook,
  Share2,
  Sun,
  Moon,
  Download
} from 'lucide-react';
import { EventDetails, TicketType, Stats, Ticket as TicketData, GalleryItem } from './types';
import { cn, formatCurrency, formatDate } from './lib/utils';
import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

// --- Components ---

const Navbar = ({ onAdminClick, onScannerClick, theme, onThemeToggle }: { 
  onAdminClick: () => void, 
  onScannerClick: () => void,
  theme: 'light' | 'dark',
  onThemeToggle: () => void
}) => (
  <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-zinc-200 dark:border-white/10">
    <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
          <Ticket className="text-black w-5 h-5" />
        </div>
        <span className="font-bold text-xl tracking-tight text-zinc-900 dark:text-white">TIX.</span>
      </div>
      <div className="flex items-center gap-4">
        <button 
          onClick={onThemeToggle}
          className="p-2 text-zinc-500 dark:text-white/70 hover:text-zinc-900 dark:hover:text-white transition-colors"
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>
        <button 
          onClick={onScannerClick}
          className="text-sm font-medium text-zinc-600 dark:text-white/70 hover:text-zinc-900 dark:hover:text-white transition-colors flex items-center gap-1"
        >
          <ScanLine className="w-4 h-4" />
          <span className="hidden sm:inline">Scanner</span>
        </button>
        <button 
          onClick={onAdminClick}
          className="text-sm font-medium text-white/70 hover:text-white transition-colors flex items-center gap-1"
        >
          <ShieldCheck className="w-4 h-4" />
          <span className="hidden sm:inline">Admin</span>
        </button>
      </div>
    </div>
  </nav>
);

const Hero = ({ event }: { event: EventDetails }) => (
  <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
    <div className="absolute inset-0 z-0">
      <img 
        src={event.hero_image} 
        alt={event.title}
        className="w-full h-full object-cover opacity-50 scale-105"
        referrerPolicy="no-referrer"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
    </div>
    <div className="relative z-10 text-center px-4 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <span className="inline-block px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold tracking-widest uppercase rounded-full mb-4 border border-emerald-500/30">
          Live Event 2026
        </span>
        <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter">
          {event.title}
        </h1>
        <div className="flex flex-wrap items-center justify-center gap-6 text-white/80 font-medium">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-500" />
            <span>{formatDate(event.date)}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-500" />
            <a 
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.venue)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-400 transition-colors underline underline-offset-4 decoration-emerald-500/30"
            >
              {event.venue}
            </a>
          </div>
        </div>

        <div className="mt-10 flex items-center justify-center gap-4">
          <span className="text-white/40 text-xs font-bold uppercase tracking-widest mr-2">Share Event</span>
          <a 
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out ${event.title}!`)}&url=${encodeURIComponent(window.location.href)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-white/60 hover:text-emerald-400 hover:border-emerald-500/50 hover:bg-emerald-500/10 transition-all"
            title="Share on Twitter"
          >
            <Twitter className="w-4 h-4" />
          </a>
          <a 
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-white/60 hover:text-emerald-400 hover:border-emerald-500/50 hover:bg-emerald-500/10 transition-all"
            title="Share on Facebook"
          >
            <Facebook className="w-4 h-4" />
          </a>
          <a 
            href={`https://wa.me/?text=${encodeURIComponent(`Check out ${event.title}! ${window.location.href}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-white/60 hover:text-emerald-400 hover:border-emerald-500/50 hover:bg-emerald-500/10 transition-all"
            title="Share on WhatsApp"
          >
            <MessageCircle className="w-4 h-4" />
          </a>
        </div>
      </motion.div>
    </div>
  </section>
);

const Gallery = ({ items }: { items: GalleryItem[] }) => {
  const categories = {
    guest: "Guests of Honor",
    performance: "Performances",
    sponsor: "Sponsors"
  };

  return (
    <section className="py-24 bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-4xl font-black text-zinc-900 dark:text-white mb-12 tracking-tight">Event Highlights</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {Object.entries(categories).map(([key, label]) => (
            <div key={key} className="space-y-6">
              <h3 className="text-xl font-bold text-emerald-500 dark:text-emerald-400 uppercase tracking-widest text-sm">{label}</h3>
              <div className="grid gap-6">
                {items.filter(item => item.category === key).map(item => (
                  <motion.div 
                    key={item.id}
                    whileHover={{ y: -5 }}
                    className="group relative aspect-square rounded-2xl overflow-hidden border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5"
                  >
                    <img 
                      src={item.image_url} 
                      alt={item.caption}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                      <p className="text-white font-bold text-sm">{item.caption}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const TicketCard = ({ type, onSelect }: { type: TicketType, onSelect: (type: TicketType) => void }) => {
  const isSoldOut = type.sold >= type.quantity;
  return (
    <div className={cn(
      "relative p-6 rounded-2xl border transition-all duration-300 group",
      isSoldOut 
        ? "bg-zinc-100 dark:bg-white/5 border-zinc-200 dark:border-white/10 opacity-60" 
        : "bg-zinc-50 dark:bg-white/5 border-zinc-200 dark:border-white/10 hover:border-emerald-500/50 hover:bg-zinc-100 dark:hover:bg-white/[0.07]"
    )}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white">{type.name}</h3>
          <p className="text-zinc-500 dark:text-white/50 text-sm mt-1">{type.description}</p>
        </div>
        <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
          {formatCurrency(type.price)}
        </div>
      </div>
      <div className="flex items-center justify-between mt-8">
        <div className="text-xs text-zinc-400 dark:text-white/40 font-medium">
          {isSoldOut ? "SOLD OUT" : `${type.quantity - type.sold} tickets left`}
        </div>
        <button
          disabled={isSoldOut}
          onClick={() => onSelect(type)}
          className={cn(
            "px-6 py-2 rounded-full font-bold text-sm transition-all flex items-center gap-2",
            isSoldOut 
              ? "bg-zinc-200 dark:bg-white/10 text-zinc-400 dark:text-white/30 cursor-not-allowed" 
              : "bg-emerald-500 text-black hover:bg-emerald-400 active:scale-95"
          )}
        >
          {isSoldOut ? "Unavailable" : "Select"}
          {!isSoldOut && <ChevronRight className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};

const CheckoutModal = ({ type, onClose, onSuccess }: { type: TicketType, onClose: () => void, onSuccess: (ref: string) => void }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/initialize-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          amount: type.price,
          ticket_type_id: type.id,
          holder_name: name
        })
      });
      const data = await res.json();
      if (data.authorization_url) {
        // In a real app, we'd redirect or open a popup. 
        // For this demo, we'll simulate the payment success by calling verify after a delay
        window.open(data.authorization_url, '_blank');
        onSuccess(data.reference);
      } else {
        setError(data.error || 'Payment initialization failed');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-3xl p-8 shadow-2xl transition-colors duration-300"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-400 dark:text-white/40 hover:text-zinc-900 dark:hover:text-white">
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Checkout</h2>
        <p className="text-zinc-500 dark:text-white/50 mb-6">You're purchasing a <span className="text-emerald-500 dark:text-emerald-400 font-bold">{type.name}</span> ticket for <span className="text-zinc-900 dark:text-white">{formatCurrency(type.price)}</span>.</p>
        
        <form onSubmit={handlePayment} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-400 dark:text-white/40 uppercase tracking-widest mb-2">Full Name</label>
            <input 
              required
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3 text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-400 dark:text-white/40 uppercase tracking-widest mb-2">Email Address</label>
            <input 
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3 text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
          <button
            disabled={loading}
            type="submit"
            className="w-full bg-emerald-500 text-black font-bold py-4 rounded-xl hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Pay with Paystack"}
          </button>
          <p className="text-center text-[10px] text-white/30 uppercase tracking-widest">
            Secure payment powered by Paystack
          </p>
        </form>
      </motion.div>
    </div>
  );
};

const SuccessModal = ({ ticketId, onClose }: { ticketId: string, onClose: () => void }) => {
  const [downloading, setDownloading] = useState(false);

  const downloadTicket = async () => {
    setDownloading(true);
    try {
      const qrDataUrl = await QRCode.toDataURL(ticketId);
      const doc = new jsPDF();
      
      doc.setFillColor(20, 20, 20);
      doc.rect(0, 0, 210, 297, 'F');
      
      doc.setTextColor(16, 185, 129);
      doc.setFontSize(30);
      doc.text("TIX.", 20, 30);
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.text("Comedy Show 2026", 20, 50);
      
      doc.setFontSize(14);
      doc.text("Ticket ID: " + ticketId, 20, 70);
      doc.text("Date: June 15, 2026", 20, 80);
      doc.text("Venue: Lagos City Hall", 20, 90);
      
      doc.addImage(qrDataUrl, 'PNG', 70, 110, 70, 70);
      
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text("Please present this QR code at the entrance.", 105, 190, { align: 'center' });
      
      doc.save(`ticket-${ticketId}.pdf`);
    } catch (err) {
      console.error(err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-white/95 dark:bg-black/95 backdrop-blur-md transition-colors duration-300" />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-md text-center"
      >
        <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(16,185,129,0.4)]">
          <CheckCircle2 className="text-black w-10 h-10" />
        </div>
        <h2 className="text-3xl font-black text-zinc-900 dark:text-white mb-2">Payment Successful!</h2>
        <p className="text-zinc-500 dark:text-white/60 mb-8">Your ticket has been generated. Check your email or download it below.</p>
        
        <div className="bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-2xl p-6 mb-8 transition-colors duration-300">
          <div className="text-xs text-zinc-400 dark:text-white/40 uppercase tracking-widest mb-2">Ticket ID</div>
          <div className="text-2xl font-mono font-bold text-emerald-600 dark:text-emerald-400">{ticketId}</div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={downloadTicket}
            disabled={downloading}
            className="w-full bg-zinc-900 dark:bg-white text-white dark:text-black font-bold py-4 rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2"
          >
            {downloading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
            Download PDF Ticket
          </button>
          <button
            onClick={onClose}
            className="w-full bg-zinc-100 dark:bg-white/5 text-zinc-900 dark:text-white font-bold py-4 rounded-xl hover:bg-zinc-200 dark:hover:bg-white/10 transition-all"
          >
            Back to Home
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const AdminDashboard = ({ onClose, onUpdate }: { onClose: () => void, onUpdate?: () => void }) => {
  const [password, setPassword] = useState('');
  const [token, setToken] = useState(localStorage.getItem('admin_token') || '');
  const [stats, setStats] = useState<Stats | null>(null);
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [event, setEvent] = useState<EventDetails | null>(null);
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [activeTab, setActiveTab] = useState<'stats' | 'tickets' | 'gallery' | 'settings'>('stats');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Gallery Form State
  const [newGalleryItem, setNewGalleryItem] = useState({ image_url: '', caption: '', category: 'guest' });
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'gallery' | 'hero' | 'host') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      if (type === 'gallery') {
        setNewGalleryItem({ ...newGalleryItem, image_url: base64String });
      } else if (type === 'hero' && event) {
        setEvent({ ...event, hero_image: base64String });
      } else if (type === 'host' && event) {
        setEvent({ ...event, host_image: base64String });
      }
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (data.token) {
        setToken(data.token);
        localStorage.setItem('admin_token', data.token);
      } else {
        setError('Invalid password');
      }
    } catch (err) {
      setError('Login failed');
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [statsRes, ticketsRes, galleryRes, eventRes, typesRes] = await Promise.all([
        fetch('/api/admin/stats', { headers }),
        fetch('/api/admin/tickets', { headers }),
        fetch('/api/gallery'),
        fetch('/api/event'),
        fetch('/api/ticket-types')
      ]);
      setStats(await statsRes.json());
      setTickets(await ticketsRes.json());
      setGallery(await galleryRes.json());
      setEvent(await eventRes.json());
      setTicketTypes(await typesRes.json());
    } catch (err) {
      console.error(err);
      setError('Failed to fetch data');
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  const handleAddGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/admin/gallery/add', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newGalleryItem)
      });
      setNewGalleryItem({ image_url: '', caption: '', category: 'guest' });
      fetchData();
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error(err);
      alert('Failed to add gallery item');
    }
  };

  const handleDeleteGallery = async (id: number) => {
    try {
      await fetch(`/api/admin/gallery/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error(err);
      alert('Failed to delete item');
    }
  };

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;
    try {
      await fetch('/api/admin/event/update', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(event)
      });
      alert('Event updated successfully');
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error(err);
      alert('Failed to update event. The image might be too large.');
    }
  };

  const handleUpdateTicketType = async (type: TicketType) => {
    try {
      await fetch('/api/admin/ticket-types/update', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(type)
      });
      alert('Ticket price updated');
      fetchData();
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error(err);
      alert('Failed to update ticket price');
    }
  };

  const exportToCSV = () => {
    if (tickets.length === 0) return;
    
    const headers = ['Ticket ID', 'Holder Name', 'Email', 'Ticket Type', 'Price', 'Status', 'Purchase Date'];
    const rows = tickets.map(t => [
      t.id,
      t.holder_name,
      t.email,
      t.ticket_type_name,
      t.price,
      t.is_used ? 'Scanned' : 'Pending',
      new Date(t.purchase_date).toLocaleString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `tickets_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!token) {
    return (
      <div className="fixed inset-0 z-[150] bg-white dark:bg-black flex items-center justify-center px-4 transition-colors duration-300">
        <button onClick={onClose} className="absolute top-6 right-6 text-zinc-400 dark:text-white/40 hover:text-zinc-900 dark:hover:text-white">
          <X className="w-8 h-8" />
        </button>
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="text-black w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Admin Access</h2>
            <p className="text-zinc-500 dark:text-white/50 text-sm">Enter password to continue</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3 text-zinc-900 dark:text-white text-center text-lg tracking-widest focus:outline-none focus:border-emerald-500"
            />
            {error && <p className="text-red-500 text-xs text-center">{error}</p>}
            <button className="w-full bg-emerald-500 text-black font-bold py-3 rounded-xl hover:bg-emerald-400 transition-all">
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[150] bg-zinc-50 dark:bg-zinc-950 overflow-y-auto transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-3xl font-black text-white">Admin Dashboard</h1>
            <div className="flex gap-4 mt-4">
              {(['stats', 'tickets', 'gallery', 'settings'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-widest transition-all",
                    activeTab === tab ? "bg-emerald-500 text-black" : "bg-white/5 text-white/40 hover:bg-white/10"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => { localStorage.removeItem('admin_token'); setToken(''); }}
              className="px-4 py-2 bg-white/5 text-white/60 rounded-lg hover:bg-white/10 text-sm font-medium"
            >
              Logout
            </button>
            <button onClick={onClose} className="p-2 bg-white/5 text-white rounded-lg hover:bg-white/10">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {activeTab === 'stats' && stats && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-zinc-900 border border-white/5 p-6 rounded-2xl">
                <div className="flex items-center gap-3 text-white/40 mb-2">
                  <Ticket className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-widest">Tickets Sold</span>
                </div>
                <div className="text-4xl font-black text-white">{stats.totalSold}</div>
              </div>
              <div className="bg-zinc-900 border border-white/5 p-6 rounded-2xl">
                <div className="flex items-center gap-3 text-white/40 mb-2">
                  <BarChart3 className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-widest">Total Revenue</span>
                </div>
                <div className="text-4xl font-black text-emerald-400">{formatCurrency(stats.totalRevenue)}</div>
              </div>
              <div className="bg-zinc-900 border border-white/5 p-6 rounded-2xl">
                <div className="flex items-center gap-3 text-white/40 mb-2">
                  <ScanLine className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-widest">Check-ins</span>
                </div>
                <div className="text-4xl font-black text-white">
                  {tickets.filter(t => t.is_used).length}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              <div className="bg-zinc-900 border border-white/5 p-8 rounded-3xl">
                <h3 className="text-xl font-bold text-white mb-6">Sales by Ticket Type</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats?.salesByType || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <XAxis dataKey="name" stroke="#71717a" fontSize={12} />
                      <YAxis stroke="#71717a" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a' }}
                        itemStyle={{ color: '#10b981' }}
                      />
                      <Bar dataKey="sold" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="bg-zinc-900 border border-white/5 p-8 rounded-3xl">
                <h3 className="text-xl font-bold text-white mb-6">Revenue Distribution</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats?.salesByType.map(s => ({ name: s.name, value: s.sold * s.price })) || []}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {(stats?.salesByType || []).map((_, index) => (
                          <Cell key={`cell-${index}`} fill={['#10b981', '#34d399', '#059669'][index % 3]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a' }}
                        formatter={(value: number) => formatCurrency(value)}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'tickets' && (
          <div className="bg-zinc-900 border border-white/5 rounded-3xl overflow-hidden">
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">Attendee List</h3>
                <div className="text-xs text-white/40 font-bold uppercase tracking-widest mt-1">
                  {tickets.length} Total Attendees
                </div>
              </div>
              <button 
                onClick={exportToCSV}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-black rounded-xl font-bold text-sm hover:bg-emerald-400 transition-all active:scale-95"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/5 text-[10px] font-black text-white/40 uppercase tracking-widest">
                    <th className="px-8 py-4">Holder Name</th>
                    <th className="px-8 py-4">Ticket Type</th>
                    <th className="px-8 py-4">Status</th>
                    <th className="px-8 py-4">Purchase Date</th>
                    <th className="px-8 py-4">Ticket ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {tickets.map((ticket, idx) => (
                    <tr key={ticket.id || idx} className="text-sm text-white/80 hover:bg-white/[0.02] transition-colors">
                      <td className="px-8 py-4 font-medium text-white">{ticket.holder_name}</td>
                      <td className="px-8 py-4">
                        <span className="px-2 py-1 bg-white/5 rounded text-[10px] font-bold uppercase">
                          {ticket.ticket_type_name}
                        </span>
                      </td>
                      <td className="px-8 py-4">
                        {ticket.is_used ? (
                          <span className="flex items-center gap-1.5 text-emerald-400 text-xs">
                            <CheckCircle2 className="w-3 h-3" /> Scanned
                          </span>
                        ) : (
                          <span className="text-white/30 text-xs">Pending</span>
                        )}
                      </td>
                      <td className="px-8 py-4 text-white/40">{new Date(ticket.purchase_date).toLocaleDateString()}</td>
                      <td className="px-8 py-4 font-mono text-xs text-white/40">{ticket.id}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'gallery' && (
          <div className="space-y-8">
            <div className="bg-zinc-900 border border-white/5 p-8 rounded-3xl">
              <h3 className="text-xl font-bold text-white mb-6">Add New Highlight</h3>
              <form onSubmit={handleAddGallery} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-white/40 uppercase tracking-widest">Image Source</label>
                    <div className="flex gap-2">
                      <input 
                        type="text"
                        placeholder="Image URL"
                        value={newGalleryItem.image_url}
                        onChange={e => setNewGalleryItem({...newGalleryItem, image_url: e.target.value})}
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-sm"
                      />
                      <label className="cursor-pointer bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors">
                        <Download className="w-4 h-4" />
                        Upload
                        <input type="file" accept="image/*" className="hidden" onChange={e => handleFileUpload(e, 'gallery')} />
                      </label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-white/40 uppercase tracking-widest">Caption</label>
                    <input 
                      required
                      type="text"
                      placeholder="Caption"
                      value={newGalleryItem.caption}
                      onChange={e => setNewGalleryItem({...newGalleryItem, caption: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-sm"
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <select 
                    value={newGalleryItem.category}
                    onChange={e => setNewGalleryItem({...newGalleryItem, category: e.target.value as any})}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-sm"
                  >
                    <option value="guest">Guest of Honor</option>
                    <option value="performance">Performance</option>
                    <option value="sponsor">Sponsorship</option>
                  </select>
                  <button disabled={uploading} className="bg-emerald-500 text-black font-bold rounded-xl px-8 py-2 hover:bg-emerald-400 disabled:opacity-50">
                    {uploading ? "Uploading..." : "Add Highlight"}
                  </button>
                </div>
                {newGalleryItem.image_url && (
                  <div className="mt-4 aspect-video w-32 rounded-lg overflow-hidden border border-white/10">
                    <img src={newGalleryItem.image_url} className="w-full h-full object-cover" />
                  </div>
                )}
              </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {gallery.map(item => (
                <div key={item.id} className="bg-zinc-900 border border-white/5 rounded-2xl overflow-hidden group">
                  <div className="aspect-square relative">
                    <img src={item.image_url} alt={item.caption} className="w-full h-full object-cover" />
                    <button 
                      onClick={() => handleDeleteGallery(item.id)}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-4">
                    <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1">{item.category}</div>
                    <div className="text-sm text-white font-medium">{item.caption}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && event && (
          <div className="space-y-8">
            <div className="bg-zinc-900 border border-white/5 p-8 rounded-3xl">
              <h3 className="text-xl font-bold text-white mb-6">Event Settings</h3>
              <form onSubmit={handleUpdateEvent} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-white/40 uppercase tracking-widest">Event Title</label>
                    <input 
                      type="text"
                      value={event.title}
                      onChange={e => setEvent({...event, title: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-white/40 uppercase tracking-widest">Hero Image</label>
                    <div className="flex gap-2">
                      <input 
                        type="text"
                        value={event.hero_image}
                        onChange={e => setEvent({...event, hero_image: e.target.value})}
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-sm"
                      />
                      <label className="cursor-pointer bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors">
                        <Download className="w-4 h-4" />
                        Upload
                        <input type="file" accept="image/*" className="hidden" onChange={e => handleFileUpload(e, 'hero')} />
                      </label>
                    </div>
                  </div>
                  {event.hero_image && (
                    <div className="md:col-span-2 space-y-2">
                      <label className="block text-xs font-bold text-white/40 uppercase tracking-widest">Hero Preview</label>
                      <div className="aspect-[21/9] w-full rounded-2xl overflow-hidden border border-white/10">
                        <img src={event.hero_image} className="w-full h-full object-cover" alt="Hero Preview" />
                      </div>
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-white/40 uppercase tracking-widest">Event Date & Time</label>
                    <input 
                      type="datetime-local"
                      value={event.date.slice(0, 16)}
                      onChange={e => setEvent({...event, date: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="block text-xs font-bold text-white/40 uppercase tracking-widest">Event Description</label>
                    <textarea 
                      value={event.description}
                      onChange={e => setEvent({...event, description: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white h-32 resize-none"
                      placeholder="Describe your event..."
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="block text-xs font-bold text-white/40 uppercase tracking-widest">Venue Address</label>
                    <input 
                      type="text"
                      value={event.venue}
                      onChange={e => setEvent({...event, venue: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white"
                      placeholder="Enter full address for map navigation"
                    />
                  </div>
                </div>

                <div className="pt-8 border-t border-white/5">
                  <h4 className="text-lg font-bold text-white mb-6">Host Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-white/40 uppercase tracking-widest">Host Name</label>
                      <input 
                        type="text"
                        value={event.host_name || ''}
                        onChange={e => setEvent({...event, host_name: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white"
                        placeholder="Host Name"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-white/40 uppercase tracking-widest">Host Image</label>
                      <div className="flex gap-2">
                        <input 
                          type="text"
                          value={event.host_image || ''}
                          onChange={e => setEvent({...event, host_image: e.target.value})}
                          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-sm"
                          placeholder="Host Image URL"
                        />
                        <label className="cursor-pointer bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors">
                          <Download className="w-4 h-4" />
                          Upload
                          <input type="file" accept="image/*" className="hidden" onChange={e => handleFileUpload(e, 'host')} />
                        </label>
                      </div>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="block text-xs font-bold text-white/40 uppercase tracking-widest">Host Description</label>
                      <textarea 
                        value={event.host_description || ''}
                        onChange={e => setEvent({...event, host_description: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white h-24 resize-none"
                        placeholder="Brief bio of the host..."
                      />
                    </div>
                    {event.host_image && (
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-white/40 uppercase tracking-widest">Host Preview</label>
                        <div className="w-24 h-24 rounded-full overflow-hidden border border-white/10">
                          <img src={event.host_image} className="w-full h-full object-cover" alt="Host Preview" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <button disabled={uploading} className="bg-emerald-500 text-black font-bold px-8 py-3 rounded-xl hover:bg-emerald-400 disabled:opacity-50">
                  {uploading ? "Uploading..." : "Save Event Changes"}
                </button>
              </form>
            </div>

            <div className="bg-zinc-900 border border-white/5 p-8 rounded-3xl">
              <h3 className="text-xl font-bold text-white mb-6">Ticket Pricing</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {ticketTypes.map(type => (
                  <div key={type.id} className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                    <h4 className="font-bold text-white mb-4">{type.name}</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Price (NGN)</label>
                        <input 
                          type="number"
                          value={type.price}
                          onChange={e => {
                            const newTypes = ticketTypes.map(t => t.id === type.id ? {...t, price: Number(e.target.value)} : t);
                            setTicketTypes(newTypes);
                          }}
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white"
                        />
                      </div>
                      <button 
                        onClick={() => handleUpdateTicketType(type)}
                        className="w-full bg-white/10 text-white text-xs font-bold py-2 rounded-lg hover:bg-white/20"
                      >
                        Update Price
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const TicketScanner = ({ onClose }: { onClose: () => void }) => {
  const [ticketId, setTicketId] = useState('');
  const [password, setPassword] = useState('');
  const [result, setResult] = useState<{ valid: boolean, holder_name?: string, ticket_type?: string, error?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;
    if (isScanning && !result) {
      const timer = setTimeout(() => {
        scanner = new Html5QrcodeScanner(
          "reader",
          { fps: 10, qrbox: { width: 250, height: 250 } },
          false
        );

        scanner.render(
          (decodedText) => {
            setTicketId(decodedText);
            setIsScanning(false);
            if (scanner) {
              scanner.clear().catch(console.error);
            }
          },
          () => {}
        );
      }, 100);
      return () => clearTimeout(timer);
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(console.error);
      }
    };
  }, [isScanning, result]);

  const handleScan = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/validate-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticket_id: ticketId, password })
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ valid: false, error: 'Validation failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-white dark:bg-black flex flex-col items-center justify-center px-4 transition-colors duration-300">
      <button 
        onClick={() => {
          setIsScanning(false);
          onClose();
        }} 
        className="absolute top-6 right-6 text-zinc-400 dark:text-white/40 hover:text-zinc-900 dark:hover:text-white z-[210]"
      >
        <X className="w-8 h-8" />
      </button>
      
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-3">
            <ScanLine className="text-black w-10 h-10" />
          </div>
          <h2 className="text-3xl font-black text-zinc-900 dark:text-white">Ticket Scanner</h2>
          <p className="text-zinc-500 dark:text-white/50">Validate attendee entry</p>
        </div>

        {isScanning ? (
          <div className="space-y-6">
            <div id="reader" className="w-full rounded-2xl overflow-hidden border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900"></div>
            <button 
              onClick={() => setIsScanning(false)}
              className="w-full py-4 bg-zinc-100 dark:bg-white/5 text-zinc-900 dark:text-white font-bold rounded-xl hover:bg-zinc-200 dark:hover:bg-white/10 transition-all"
            >
              Cancel Camera Scan
            </button>
          </div>
        ) : (
          <form onSubmit={handleScan} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-zinc-400 dark:text-white/40 uppercase tracking-widest mb-2">Ticket ID</label>
                <div className="flex gap-2">
                  <input 
                    required
                    type="text"
                    value={ticketId}
                    onChange={(e) => setTicketId(e.target.value.toUpperCase())}
                    placeholder="TKT-XXXXXX"
                    className="flex-1 bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-2xl px-6 py-4 text-zinc-900 dark:text-white text-2xl font-mono focus:outline-none focus:border-emerald-500"
                  />
                  <button 
                    type="button"
                    onClick={() => setIsScanning(true)}
                    className="p-4 bg-emerald-500 text-black rounded-2xl hover:bg-emerald-400 transition-all"
                  >
                    <Camera className="w-6 h-6" />
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-zinc-400 dark:text-white/40 uppercase tracking-widest mb-2">Scanner Password</label>
                <input 
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-2xl px-6 py-4 text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500 text-center"
                />
              </div>
            </div>

            <button
              disabled={loading || !ticketId || !password}
              className="w-full bg-emerald-500 text-black font-black py-5 rounded-2xl hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Validate Entry"}
            </button>
          </form>
        )}

        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={cn(
                "absolute inset-0 z-[220] flex flex-col items-center justify-center p-8 text-center",
                result.valid ? "bg-emerald-600" : "bg-red-600"
              )}
            >
              <div className="mb-8">
                {result.valid ? (
                  <CheckCircle2 className="w-32 h-32 text-white" />
                ) : (
                  <AlertCircle className="w-32 h-32 text-white" />
                )}
              </div>
              
              <h3 className="text-5xl font-black text-white mb-4">
                {result.valid ? "ACCESS GRANTED" : "ACCESS DENIED"}
              </h3>
              
              {result.valid ? (
                <div className="space-y-2">
                  <p className="text-3xl font-bold text-white/90">{result.holder_name}</p>
                  <p className="text-xl font-medium text-white/70 uppercase tracking-widest">{result.ticket_type}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-2xl font-bold text-white">{result.error}</p>
                  {result.holder_name && (
                    <div className="bg-black/20 p-4 rounded-2xl">
                      <p className="text-sm text-white/60 uppercase tracking-widest font-bold mb-1">Original Holder</p>
                      <p className="text-xl font-bold text-white">{result.holder_name}</p>
                    </div>
                  )}
                </div>
              )}
              
              <button
                onClick={() => { setResult(null); setTicketId(''); }}
                className="mt-12 px-12 py-4 bg-white text-black font-black rounded-2xl hover:bg-white/90 transition-all active:scale-95"
              >
                SCAN NEXT
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [event, setEvent] = useState<EventDetails | null>(null);
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [selectedType, setSelectedType] = useState<TicketType | null>(null);
  const [successTicketId, setSuccessTicketId] = useState<string | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme') as 'light' | 'dark') || 'dark';
    }
    return 'dark';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  useEffect(() => {
    fetch('/api/event').then(res => res.json()).then(setEvent);
    fetch('/api/ticket-types').then(res => res.json()).then(setTicketTypes);
    fetch('/api/gallery').then(res => res.json()).then(setGallery);
  }, []);

  const handlePaymentSuccess = async (reference: string) => {
    setVerifying(true);
    // Poll for verification
    const check = async () => {
      try {
        const res = await fetch(`/api/verify-payment?reference=${reference}`);
        const data = await res.json();
        if (data.status === 'success') {
          setSuccessTicketId(data.ticket_id);
          setVerifying(false);
          setSelectedType(null);
        } else {
          setTimeout(check, 3000);
        }
      } catch (err) {
        setTimeout(check, 3000);
      }
    };
    check();
  };

  if (!event) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-white font-sans selection:bg-emerald-500 selection:text-black transition-colors duration-300">
      <Navbar 
        onAdminClick={() => setShowAdmin(true)} 
        onScannerClick={() => setShowScanner(true)} 
        theme={theme}
        onThemeToggle={toggleTheme}
      />
      
      <main>
        <Hero event={event} />
        
        <Gallery items={gallery} />

        <section className="max-w-7xl mx-auto px-4 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="mb-12">
                <h2 className="text-3xl font-black text-zinc-900 dark:text-white mb-6 tracking-tight">About the Event</h2>
                <p className="text-zinc-600 dark:text-white/60 leading-relaxed text-lg">
                  {event.description}
                </p>
              </div>
              
              <div className="mb-12">
                <h2 className="text-3xl font-black text-zinc-900 dark:text-white mb-8 tracking-tight">Select Your Ticket</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {ticketTypes.map((type, idx) => (
                    <React.Fragment key={type.id || idx}>
                      <TicketCard type={type} onSelect={setSelectedType} />
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-8">
                <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-3xl p-8">
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-6">About the Host</h3>
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-emerald-500/30 shrink-0">
                        <img 
                          src={event.host_image || 'https://picsum.photos/seed/host/200/200'} 
                          alt={event.host_name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="text-lg font-bold text-zinc-900 dark:text-white leading-tight">{event.host_name || 'Event Host'}</div>
                        <div className="text-xs text-emerald-500 dark:text-emerald-400 font-bold uppercase tracking-widest mt-1">Official Host</div>
                      </div>
                    </div>
                    <p className="text-zinc-600 dark:text-white/60 text-sm leading-relaxed">
                      {event.host_description || 'No description available for the host.'}
                    </p>
                    
                    <div className="pt-6 border-t border-zinc-200 dark:border-white/5">
                      <div className="flex gap-4">
                        <div className="w-10 h-10 bg-zinc-100 dark:bg-white/5 rounded-xl flex items-center justify-center shrink-0">
                          <MapPin className="text-emerald-500 w-5 h-5" />
                        </div>
                        <div>
                          <a 
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.venue)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-bold text-zinc-900 dark:text-white hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors block"
                          >
                            {event.venue}
                          </a>
                          <div className="text-[10px] text-zinc-400 dark:text-white/40 uppercase font-bold tracking-tighter mt-1">Venue Location</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-8">
                  <h3 className="text-xl font-bold text-emerald-400 mb-4">Need Help?</h3>
                  <p className="text-emerald-400/60 text-sm mb-6">
                    Having trouble with your purchase? Contact our support team 24/7.
                  </p>
                  <a 
                    href="https://wa.me/2349061972103"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-400 transition-all flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Contact Support
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5 bg-zinc-950 py-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Ticket className="text-black w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">TIX.</span>
          </div>
          <div className="text-white/30 text-xs font-medium">
            © 2026 Comedy Show Ticketing. All rights reserved.
          </div>
          <div className="flex gap-6 text-white/40 text-xs font-bold uppercase tracking-widest">
            <a href="#" className="hover:text-emerald-400 transition-colors">Terms</a>
            <a href="#" className="hover:text-emerald-400 transition-colors">Privacy</a>
            <a href="#" className="hover:text-emerald-400 transition-colors">Refund Policy</a>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {selectedType && (
          <CheckoutModal 
            type={selectedType} 
            onClose={() => setSelectedType(null)} 
            onSuccess={handlePaymentSuccess}
          />
        )}
        {verifying && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/90 backdrop-blur-md">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white">Verifying Payment...</h3>
              <p className="text-white/40 text-sm">Please don't close this window.</p>
            </div>
          </div>
        )}
        {successTicketId && (
          <SuccessModal 
            ticketId={successTicketId} 
            onClose={() => setSuccessTicketId(null)} 
          />
        )}
        {showAdmin && (
          <AdminDashboard 
            onClose={() => setShowAdmin(false)} 
            onUpdate={() => {
              fetch('/api/event').then(res => res.json()).then(setEvent);
              fetch('/api/ticket-types').then(res => res.json()).then(setTicketTypes);
              fetch('/api/gallery').then(res => res.json()).then(setGallery);
            }}
          />
        )}
        {showScanner && (
          <TicketScanner onClose={() => setShowScanner(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
