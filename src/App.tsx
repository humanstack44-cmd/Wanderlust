import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Calendar, Compass, Search, Menu, X, ArrowRight, Globe, Star, Sparkles } from 'lucide-react';
import { cn } from './lib/utils';
import { getTravelItinerary, getDestinationSuggestions } from './services/geminiService';
import Markdown from 'react-markdown';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY 
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) 
  : null;

const Navbar = ({ onBookClick }: { onBookClick: () => void }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showDeployGuide, setShowDeployGuide] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [tempKey, setTempKey] = useState(localStorage.getItem('WANDERLUST_API_KEY') || '');

  const saveKey = () => {
    localStorage.setItem('WANDERLUST_API_KEY', tempKey);
    setShowSettings(false);
    window.location.reload(); // Reload to apply the new key
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-6 py-4",
        isScrolled ? "bg-white/90 backdrop-blur-lg shadow-sm" : "bg-transparent"
      )}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className={cn("w-8 h-8 transition-colors", isScrolled ? "text-ink" : "text-white")} />
            <span className={cn("text-2xl font-display font-bold tracking-tight transition-colors", isScrolled ? "text-ink" : "text-white")}>
              WANDERLUST
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {['Destinations', 'Experiences', 'AI Planner', 'Journal'].map((item) => (
              <a 
                key={item} 
                href={`#${item.toLowerCase().replace(' ', '-')}`}
                className={cn(
                  "text-[10px] font-bold uppercase tracking-[0.2em] hover:text-gold transition-colors",
                  isScrolled ? "text-ink" : "text-white"
                )}
              >
                {item}
              </a>
            ))}
            <button 
              onClick={() => setShowSettings(true)}
              className={cn(
                "p-2 rounded-full transition-all",
                isScrolled ? "text-ink hover:bg-gray-100" : "text-white hover:bg-white/10"
              )}
              title="API Settings"
            >
              <Search className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setShowDeployGuide(true)}
              className={cn(
                "text-[10px] font-bold uppercase tracking-[0.2em] border px-4 py-2 rounded-full transition-all cursor-pointer",
                isScrolled ? "border-ink text-ink hover:bg-ink hover:text-white" : "border-white/40 text-white hover:bg-white hover:text-ink"
              )}
            >
              Deploy Guide
            </button>
            <button 
              onClick={onBookClick}
              className={cn(
                "px-8 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer shadow-lg",
                isScrolled ? "bg-ink text-white hover:bg-gold" : "bg-white text-ink hover:bg-gold hover:text-white"
              )}
            >
              Book Now
            </button>
          </div>

          <button 
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="text-ink" /> : <Menu className={isScrolled ? "text-ink" : "text-white"} />}
          </button>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-full left-0 right-0 bg-white p-6 shadow-xl md:hidden flex flex-col gap-4"
            >
              {['Destinations', 'Experiences', 'AI Planner', 'Journal'].map((item) => (
                <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-serif border-b border-gray-100 pb-2">{item}</a>
              ))}
              <button 
                onClick={() => {
                  onBookClick();
                  setIsMobileMenuOpen(false);
                }}
                className="bg-ink text-white py-4 rounded-xl font-bold uppercase tracking-widest text-xs"
              >
                Book Your Escape
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettings(false)}
              className="absolute inset-0 bg-ink/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl p-10"
            >
              <h2 className="text-3xl mb-4 font-display">AI <span className="italic font-light">Settings</span></h2>
              <p className="text-sm text-gray-500 mb-6">Enter your Gemini API Key to enable the AI Travel Concierge. This is stored locally in your browser.</p>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Gemini API Key</label>
                  <input 
                    type="password"
                    placeholder="Paste your key here..."
                    className="w-full border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:border-gold transition-all"
                    value={tempKey}
                    onChange={(e) => setTempKey(e.target.value)}
                  />
                </div>
                <button 
                  onClick={saveKey}
                  className="w-full bg-ink text-white py-4 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-gold transition-all"
                >
                  Save Configuration
                </button>
                <button 
                  onClick={() => {
                    localStorage.removeItem('WANDERLUST_API_KEY');
                    setTempKey('');
                    window.location.reload();
                  }}
                  className="w-full text-gray-400 text-[10px] uppercase tracking-widest font-bold hover:text-red-500 transition-colors"
                >
                  Reset to Default
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDeployGuide && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeployGuide(false)}
              className="absolute inset-0 bg-ink/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl p-12"
            >
              <button 
                onClick={() => setShowDeployGuide(false)}
                className="absolute top-8 right-8 text-gray-400 hover:text-ink transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-4xl mb-6">Deployment <span className="italic font-light">Guide</span></h2>
              <div className="prose prose-slate max-w-none text-sm leading-relaxed">
                <p>To deploy this platform to <strong>Netlify</strong> via GitHub:</p>
                <ol className="space-y-4">
                  <li><strong>Push to GitHub:</strong> Upload these project files to a new GitHub repository.</li>
                  <li><strong>Connect Netlify:</strong> In your Netlify dashboard, select "Import from GitHub" and choose your repo.</li>
                  <li><strong>Configure API Keys:</strong> Go to Site Settings &gt; Environment Variables and add:
                    <ul className="mt-2 space-y-1 font-mono text-xs bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <li>GEMINI_API_KEY = (Your Google AI Studio Key)</li>
                      <li>VITE_STRIPE_PUBLISHABLE_KEY = (Your Stripe Key)</li>
                    </ul>
                  </li>
                  <li><strong>Build Settings:</strong> Command: <code>npm run build</code> | Directory: <code>dist</code></li>
                </ol>
                <div className="mt-8 p-4 bg-gold/10 rounded-2xl border border-gold/20 flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-gold shrink-0 mt-1" />
                  <p className="text-xs text-ink/70 italic">Note: For full Stripe payment functionality, a server-capable host like Render or Railway is recommended, or use Netlify Functions.</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

const Hero = ({ onBookClick }: { onBookClick: () => void }) => {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      <motion.div 
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute inset-0 z-0"
      >
        <img 
          src="https://picsum.photos/seed/travel-luxury-v2/1920/1080?blur=2" 
          alt="Luxury Travel" 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
      </motion.div>

      <div className="relative z-10 text-center px-6 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <span className="text-gold uppercase tracking-[0.4em] text-xs mb-6 block font-bold">The Pinnacle of Bespoke Exploration</span>
          <h1 className="text-7xl md:text-9xl text-white mb-10 leading-[0.85] font-display">
            Crafting <br />
            <span className="italic font-light">Timeless</span> <br />
            Memories
          </h1>
          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBookClick}
              className="bg-white text-ink px-12 py-5 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-gold hover:text-white transition-all flex items-center gap-3 group cursor-pointer shadow-2xl"
            >
              Start Your Journey <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
            </motion.button>
            <motion.a 
              whileHover={{ scale: 1.05 }}
              href="#destinations"
              className="glass text-white px-12 py-5 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-white/20 transition-all inline-block shadow-xl"
            >
              View Collections
            </motion.a>
          </div>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
      >
        <span className="text-white/40 text-[10px] uppercase tracking-[0.3em]">Scroll to Explore</span>
        <div className="w-px h-16 bg-gradient-to-b from-white/60 to-transparent" />
      </motion.div>
    </section>
  );
};

const DestinationCard = ({ name, country, description, image, price }: any) => (
  <motion.div 
    whileHover={{ y: -10 }}
    className="group cursor-pointer"
  >
    <div className="relative aspect-[3/4] overflow-hidden rounded-3xl mb-4">
      <img 
        src={image} 
        alt={name} 
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        referrerPolicy="no-referrer"
      />
      <div className="absolute top-4 right-4 glass px-3 py-1 rounded-full text-white text-xs uppercase tracking-widest">
        {country}
      </div>
      {price && (
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-xl text-ink text-xs font-bold shadow-lg">
          From ${price}
        </div>
      )}
    </div>
    <h3 className="text-2xl mb-1">{name}</h3>
    <p className="text-sm text-gray-500 line-clamp-2">{description}</p>
  </motion.div>
);

const AIPlanner = () => {
  const [destination, setDestination] = useState('');
  const [duration, setDuration] = useState('3 days');
  const [interests, setInterests] = useState('culture and food');
  const [itinerary, setItinerary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePlan = async () => {
    if (!destination) return;
    setLoading(true);
    setError(null);
    try {
      const result = await getTravelItinerary(destination, duration, interests);
      setItinerary(result || null);
    } catch (err: any) {
      console.error(err);
      if (err.message === "MISSING_API_KEY") {
        setError("Configuration Required: Please click the search/settings icon in the menu to add your API Key.");
      } else {
        setError("Our concierge is currently unavailable. Please check your connection or try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="ai-planner" className="py-24 px-6 bg-ink text-white overflow-hidden relative">
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      
      <div className="max-w-7xl mx-auto grid md:grid-columns-2 gap-16 items-start">
        <div>
          <span className="text-white/40 uppercase tracking-widest text-xs mb-4 block">AI Concierge</span>
          <h2 className="text-5xl md:text-7xl mb-8 leading-tight">
            Your Personal <br />
            <span className="italic font-light">Itinerary,</span> <br />
            Crafted by Intelligence
          </h2>
          
          <div className="space-y-8 max-w-md">
            <div className="space-y-3">
              <label className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-bold">Destination</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gold" />
                <input 
                  type="text" 
                  placeholder="Where does your heart lead?"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:border-gold/50 transition-all placeholder:text-white/20"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-bold">Duration</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gold" />
                  <select 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:border-gold/50 transition-all appearance-none cursor-pointer"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                  >
                    <option className="bg-ink">3 days</option>
                    <option className="bg-ink">5 days</option>
                    <option className="bg-ink">1 week</option>
                    <option className="bg-ink">2 weeks</option>
                  </select>
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-bold">Focus</label>
                <div className="relative">
                  <Compass className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gold" />
                  <select 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:border-gold/50 transition-all appearance-none cursor-pointer"
                    value={interests}
                    onChange={(e) => setInterests(e.target.value)}
                  >
                    <option className="bg-ink">Culture & Food</option>
                    <option className="bg-ink">Adventure</option>
                    <option className="bg-ink">Relaxation</option>
                    <option className="bg-ink">Photography</option>
                  </select>
                </div>
              </div>
            </div>

            <button 
              onClick={handlePlan}
              disabled={loading}
              className="w-full bg-gold text-white py-5 rounded-2xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-white hover:text-ink transition-all disabled:opacity-50 shadow-xl"
            >
              {loading ? <Sparkles className="animate-spin w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              {loading ? 'Curating Your Experience...' : 'Generate Bespoke Itinerary'}
            </button>

            {error && (
              <p className="text-red-400 text-xs text-center mt-4 bg-red-400/10 py-3 px-4 rounded-xl border border-red-400/20">
                {error}
              </p>
            )}
          </div>
        </div>

        <div className="min-h-[400px] bg-white rounded-3xl p-8 relative shadow-2xl overflow-hidden">
          {itinerary ? (
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2 text-ink">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-widest">Your Bespoke Journey</span>
                </div>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(itinerary);
                    alert('Itinerary copied to clipboard');
                  }}
                  className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-ink transition-colors"
                >
                  Copy Plan
                </button>
              </div>
              <div className="markdown-body prose-sm md:prose-base max-h-[500px] overflow-y-auto pr-4 custom-scrollbar text-ink">
                <Markdown>{itinerary}</Markdown>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-gray-300 space-y-4">
              <Compass className="w-16 h-16 opacity-20" />
              <p className="max-w-xs text-sm uppercase tracking-widest">Enter your dream destination and let our AI curate a unique experience just for you.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

const FeaturedDestinations = () => {
  const destinations = [
    { name: "Amalfi Coast", country: "Italy", description: "Dramatic cliffs, turquoise waters, and pastel-colored villages.", image: "https://picsum.photos/seed/amalfi/800/1200", price: "2,400" },
    { name: "Santorini", country: "Greece", description: "Iconic blue domes and breathtaking sunsets over the Aegean Sea.", image: "https://picsum.photos/seed/santorini/800/1200", price: "1,850" },
    { name: "Kyoto", country: "Japan", description: "Serene temples, traditional tea houses, and cherry blossom gardens.", image: "https://picsum.photos/seed/kyoto/800/1200", price: "3,100" },
    { name: "Reykjavik", country: "Iceland", description: "Otherworldly landscapes, geothermal spas, and northern lights.", image: "https://picsum.photos/seed/iceland/800/1200", price: "2,200" },
  ];

  return (
    <section id="destinations" className="py-24 px-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
        <div>
          <span className="text-gray-400 uppercase tracking-widest text-xs mb-4 block">Curated Collections</span>
          <h2 className="text-5xl md:text-7xl leading-tight">
            Escape to the <br />
            <span className="italic font-light">Extraordinary</span>
          </h2>
        </div>
        <p className="max-w-md text-gray-500 text-lg">
          We hand-select every destination to ensure your journey is nothing short of legendary. From hidden gems to iconic landmarks.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {destinations.map((dest, i) => (
          <DestinationCard key={i} {...dest} />
        ))}
      </div>
    </section>
  );
};

const Footer = () => (
  <footer className="bg-white border-t border-gray-100 pt-24 pb-12 px-6">
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-24">
      <div className="col-span-1 md:col-span-2">
        <div className="flex items-center gap-2 mb-6">
          <Globe className="w-8 h-8 text-ink" />
          <span className="text-2xl font-serif font-bold tracking-tight">WANDERLUST</span>
        </div>
        <p className="text-gray-500 max-w-sm text-lg leading-relaxed">
          Crafting bespoke travel experiences for the discerning explorer. Your journey begins where the map ends.
        </p>
      </div>
      
      <div>
        <h4 className="font-bold uppercase tracking-widest text-xs mb-6">Explore</h4>
        <ul className="space-y-4 text-gray-500">
          <li><a href="#" className="hover:text-ink transition-colors">Destinations</a></li>
          <li><a href="#" className="hover:text-ink transition-colors">Experiences</a></li>
          <li><a href="#" className="hover:text-ink transition-colors">AI Planner</a></li>
          <li><a href="#" className="hover:text-ink transition-colors">Journal</a></li>
        </ul>
      </div>

      <div>
        <h4 className="font-bold uppercase tracking-widest text-xs mb-6">Connect</h4>
        <ul className="space-y-4 text-gray-500">
          <li><a href="#" className="hover:text-ink transition-colors">Instagram</a></li>
          <li><a href="#" className="hover:text-ink transition-colors">Twitter</a></li>
          <li><a href="#" className="hover:text-ink transition-colors">LinkedIn</a></li>
          <li><a href="#" className="hover:text-ink transition-colors">Contact</a></li>
        </ul>
      </div>
    </div>
    
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center pt-12 border-t border-gray-100 gap-4">
      <p className="text-gray-400 text-sm">© 2026 Wanderlust Elite. All rights reserved.</p>
      <div className="flex gap-8 text-gray-400 text-sm">
        <a href="#" className="hover:text-ink transition-colors">Privacy Policy</a>
        <a href="#" className="hover:text-ink transition-colors">Terms of Service</a>
      </div>
    </div>
  </footer>
);

const BookingModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    destination: '',
    date: '',
    guests: '2'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripePromise) {
      // If Stripe is not configured, just show the success message (demo mode)
      setStep(2);
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: formData.destination,
          name: formData.name
        }),
      });

      const session = await response.json();
      
      if (session.error) {
        throw new Error(session.error);
      }

      const stripe = await stripePromise;
      if (stripe) {
        const { error } = await (stripe as any).redirectToCheckout({
          sessionId: session.id,
        });
        if (error) throw error;
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      alert(error.message || 'Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-ink/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white w-full max-w-xl rounded-[2.5rem] overflow-hidden shadow-2xl"
          >
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 text-gray-400 hover:text-ink transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="p-12">
              {step === 1 ? (
                <>
                  <span className="text-gray-400 uppercase tracking-widest text-xs mb-4 block">Reservation</span>
                  <h2 className="text-4xl mb-8">Begin Your <br /><span className="italic font-light">Journey</span></h2>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Full Name</label>
                        <input 
                          required
                          type="text" 
                          className="w-full border-b border-gray-200 py-2 focus:border-ink outline-none transition-colors"
                          value={formData.name}
                          onChange={e => setFormData({...formData, name: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Email Address</label>
                        <input 
                          required
                          type="email" 
                          className="w-full border-b border-gray-200 py-2 focus:border-ink outline-none transition-colors"
                          value={formData.email}
                          onChange={e => setFormData({...formData, email: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Preferred Destination</label>
                      <input 
                        required
                        type="text" 
                        className="w-full border-b border-gray-200 py-2 focus:border-ink outline-none transition-colors"
                        value={formData.destination}
                        onChange={e => setFormData({...formData, destination: e.target.value})}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Travel Date</label>
                        <input 
                          required
                          type="date" 
                          className="w-full border-b border-gray-200 py-2 focus:border-ink outline-none transition-colors"
                          value={formData.date}
                          onChange={e => setFormData({...formData, date: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Guests</label>
                        <select 
                          className="w-full border-b border-gray-200 py-2 focus:border-ink outline-none transition-colors bg-transparent"
                          value={formData.guests}
                          onChange={e => setFormData({...formData, guests: e.target.value})}
                        >
                          {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>)}
                        </select>
                      </div>
                    </div>

                    <button 
                      type="submit"
                      disabled={isProcessing}
                      className="w-full bg-ink text-white py-5 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-gray-800 transition-colors mt-4 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isProcessing ? <Sparkles className="animate-spin w-4 h-4" /> : null}
                      {isProcessing ? 'Processing...' : 'Secure Deposit & Book'}
                    </button>
                    {!stripePromise && (
                      <p className="text-[10px] text-center text-gray-400 mt-2 italic">
                        Demo Mode: Stripe keys not configured.
                      </p>
                    )}
                  </form>
                </>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-12"
                >
                  <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8">
                    <Sparkles className="text-green-600 w-10 h-10" />
                  </div>
                  <h2 className="text-4xl mb-4">Request Received</h2>
                  <p className="text-gray-500 mb-8 leading-relaxed">
                    Thank you, {formData.name.split(' ')[0]}. A dedicated travel specialist will contact you within 24 hours to begin crafting your escape to {formData.destination}.
                  </p>
                  <button 
                    onClick={onClose}
                    className="border border-ink px-10 py-4 rounded-full font-medium hover:bg-ink hover:text-white transition-all"
                  >
                    Close
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const Journal = () => {
  const stories = [
    {
      title: "The Silent Temples of Kyoto",
      excerpt: "Finding peace in the hidden gardens of the ancient capital during the early morning mist.",
      category: "Culture",
      date: "Oct 24, 2025",
      image: "https://picsum.photos/seed/kyoto-journal/800/600"
    },
    {
      title: "A Night Under the Aurora",
      excerpt: "Chasing the Northern Lights across the frozen landscapes of Iceland's remote north.",
      category: "Adventure",
      date: "Nov 12, 2025",
      image: "https://picsum.photos/seed/aurora-journal/800/600"
    },
    {
      title: "The Flavors of Amalfi",
      excerpt: "A culinary journey through the lemon groves and seaside kitchens of Southern Italy.",
      category: "Gastronomy",
      date: "Dec 05, 2025",
      image: "https://picsum.photos/seed/amalfi-journal/800/600"
    }
  ];

  return (
    <section id="journal" className="py-24 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-gray-400 uppercase tracking-widest text-xs mb-4 block">The Wanderlust Journal</span>
          <h2 className="text-5xl md:text-7xl mb-6">Stories from the <br /><span className="italic font-light">Edge of the World</span></h2>
          <div className="w-24 h-px bg-ink mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {stories.map((story, i) => (
            <motion.article 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="group cursor-pointer"
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl mb-6">
                <img 
                  src={story.image} 
                  alt={story.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-ink/20 group-hover:bg-ink/0 transition-colors duration-500" />
              </div>
              <div className="flex items-center gap-4 mb-4">
                <span className="text-[10px] uppercase tracking-widest font-bold text-ink border border-ink px-2 py-0.5 rounded-full">
                  {story.category}
                </span>
                <span className="text-[10px] uppercase tracking-widest text-gray-400">
                  {story.date}
                </span>
              </div>
              <h3 className="text-2xl mb-3 group-hover:text-gray-600 transition-colors">{story.title}</h3>
              <p className="text-gray-500 leading-relaxed mb-4 line-clamp-2">
                {story.excerpt}
              </p>
              <button className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 group/btn">
                Read Story <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </motion.article>
          ))}
        </div>

        <div className="mt-20 text-center">
          <button className="bg-ink text-white px-10 py-4 rounded-full font-medium hover:bg-gray-800 transition-colors">
            View All Stories
          </button>
        </div>
      </div>
    </section>
  );
};

const LuxuryStays = () => {
  const hotels = [
    {
      name: "Belmond Hotel Caruso",
      location: "Ravello, Italy",
      rate: "1,250",
      image: "https://picsum.photos/seed/hotel1/800/600",
      tag: "Historic Palace"
    },
    {
      name: "Aman Kyoto",
      location: "Kyoto, Japan",
      rate: "2,100",
      image: "https://picsum.photos/seed/hotel2/800/600",
      tag: "Zen Sanctuary"
    },
    {
      name: "Grace Santorini",
      location: "Imerovigli, Greece",
      rate: "1,400",
      image: "https://picsum.photos/seed/hotel3/800/600",
      tag: "Infinity Views"
    }
  ];

  return (
    <section id="experiences" className="py-24 px-6 bg-accent">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div>
            <span className="text-gray-400 uppercase tracking-widest text-xs mb-4 block">Luxury Stays</span>
            <h2 className="text-5xl md:text-7xl leading-tight">
              Refined <br />
              <span className="italic font-light">Sanctuaries</span>
            </h2>
          </div>
          <p className="max-w-md text-gray-500 text-lg">
            Experience the pinnacle of hospitality in our handpicked selection of the world's most exclusive hotels and resorts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {hotels.map((hotel, i) => (
            <motion.div 
              key={i}
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-[2rem] overflow-hidden shadow-sm group cursor-pointer"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img 
                  src={hotel.image} 
                  alt={hotel.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 left-4 glass px-3 py-1 rounded-full text-white text-[10px] uppercase tracking-widest">
                  {hotel.tag}
                </div>
              </div>
              <div className="p-8">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-2xl font-serif">{hotel.name}</h3>
                  <div className="text-right">
                    <span className="block text-xs uppercase tracking-widest text-gray-400">From</span>
                    <span className="text-xl font-bold">${hotel.rate}</span>
                    <span className="text-[10px] text-gray-400 block">/night</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-6">
                  <MapPin className="w-4 h-4" />
                  {hotel.location}
                </div>
                <button className="w-full border border-ink py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-ink hover:text-white transition-all">
                  Check Availability
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default function App() {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const handleBookClick = () => setIsBookingModalOpen(true);

  return (
    <div className="min-h-screen selection:bg-ink selection:text-white">
      <Navbar onBookClick={handleBookClick} />
      <BookingModal isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)} />
      <main>
        <Hero onBookClick={handleBookClick} />
        <FeaturedDestinations />
        <AIPlanner />
        <LuxuryStays />
        <Journal />
        
        {/* Additional Section: Experience */}
        <section id="experiences" className="py-24 px-6 bg-accent">
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <img 
                src="https://picsum.photos/seed/experience/1000/1200" 
                alt="Experience" 
                className="rounded-[4rem] aspect-[4/5] object-cover shadow-2xl"
                referrerPolicy="no-referrer"
              />
              <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-white rounded-full p-8 shadow-xl flex flex-col items-center justify-center text-center">
                <Star className="text-yellow-400 fill-yellow-400 w-8 h-8 mb-2" />
                <span className="text-xs font-bold uppercase tracking-tighter">5-Star Rated Concierge</span>
              </div>
            </div>
            <div>
              <span className="text-gray-400 uppercase tracking-widest text-xs mb-4 block">The Wanderlust Standard</span>
              <h2 className="text-5xl md:text-7xl mb-8 leading-tight">
                Beyond the <br />
                <span className="italic font-light">Ordinary</span>
              </h2>
              <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                We believe travel should be more than just visiting a place. It should be a transformation. Our team of experts works tirelessly to uncover the stories, flavors, and moments that make a destination truly unforgettable.
              </p>
              <ul className="space-y-4 mb-12">
                {['Private Aviation', 'Bespoke Itineraries', '24/7 Global Support', 'Exclusive Access'].map((feat) => (
                  <li key={feat} className="flex items-center gap-3 text-ink font-medium">
                    <div className="w-1.5 h-1.5 bg-ink rounded-full" />
                    {feat}
                  </li>
                ))}
              </ul>
              <button 
                onClick={handleBookClick}
                className="border border-ink px-10 py-4 rounded-full font-medium hover:bg-ink hover:text-white transition-all cursor-pointer"
              >
                Book a Consultation
              </button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
