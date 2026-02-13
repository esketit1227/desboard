
import React, { useState } from 'react';
import { X, Search, Zap, ExternalLink, RefreshCw, Lock, LayoutGrid, Heart, Share2, TrendingUp } from 'lucide-react';

interface PinterestPin {
  id: string;
  imageUrl: string;
  title: string;
  saves: string;
  author: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (imageUrl: string) => void;
}

const MOCK_PINS: PinterestPin[] = [
    { id: 'p1', imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop', title: 'Oversized Blazer Styling', saves: '12k', author: 'Vogue' },
    { id: 'p2', imageUrl: 'https://images.unsplash.com/photo-1550614000-4b9519e09063?q=80&w=1000&auto=format&fit=crop', title: 'Utility Cargo Pants', saves: '8.5k', author: 'Streetwear Daily' },
    { id: 'p3', imageUrl: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?q=80&w=1000&auto=format&fit=crop', title: 'Summer Linen Set', saves: '45k', author: 'Zara Official' },
    { id: 'p4', imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1000&auto=format&fit=crop', title: 'Mohair Knit Sweater', saves: '2.1k', author: 'Knitting Co' },
    { id: 'p5', imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=1000&auto=format&fit=crop', title: 'Structured Corset Top', saves: '15k', author: 'Fashion Nova' },
    { id: 'p6', imageUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=1000&auto=format&fit=crop', title: 'Vintage Denim Jacket', saves: '9k', author: 'Thrift Flip' },
    { id: 'p7', imageUrl: 'https://images.unsplash.com/photo-1551488852-0801464bdd9e?q=80&w=1000&auto=format&fit=crop', title: 'Pleated Midi Skirt', saves: '33k', author: 'Uniqlo' },
    { id: 'p8', imageUrl: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=1000&auto=format&fit=crop', title: 'Technical Shell Jacket', saves: '6k', author: 'ArcTeryx' },
];

const PinterestTrendsView: React.FC<Props> = ({ isOpen, onClose, onGenerate }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('Fashion Trends 2024');
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConnect = () => {
    setIsConnecting(true);
    setTimeout(() => {
      setIsConnecting(false);
      setIsConnected(true);
    }, 1500);
  };

  const handleGenerateClick = (pin: PinterestPin) => {
      setGeneratingId(pin.id);
      onGenerate(pin.imageUrl);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity" onClick={onClose} />
      
      {/* Main Modal */}
      <div className="relative w-full max-w-6xl bg-white rounded-[32px] shadow-2xl overflow-hidden h-full max-h-[90vh] flex flex-col animate-scale-in border border-white/20">
          
          {/* Header */}
          <div className="bg-white border-b border-gray-100 p-5 flex justify-between items-center sticky top-0 z-20">
              <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#E60023] rounded-full flex items-center justify-center shadow-lg shadow-red-200 text-white font-bold text-lg">
                      P
                  </div>
                  <div>
                    <h2 className="text-[20px] font-bold text-[#1D1D1F] tracking-tight leading-none">Pinterest Trends</h2>
                    <p className="text-[11px] text-gray-500 font-medium">Discover & Manufacture</p>
                  </div>
              </div>
              
              <div className="flex items-center gap-3">
                  {!isConnected ? (
                      <button 
                        onClick={handleConnect}
                        disabled={isConnecting}
                        className="bg-gray-100 hover:bg-gray-200 text-black px-4 py-2 rounded-full text-xs font-bold transition-colors flex items-center gap-2"
                      >
                        {isConnecting ? <RefreshCw size={14} className="animate-spin"/> : <Lock size={14}/>}
                        {isConnecting ? 'Connecting...' : 'Connect Account'}
                      </button>
                  ) : (
                      <span className="text-xs font-medium text-green-600 flex items-center gap-1 bg-green-50 px-3 py-1.5 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"/> Connected
                      </span>
                  )}
                  <button onClick={onClose} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-[#1D1D1F] transition-colors">
                      <X size={20} />
                  </button>
              </div>
          </div>

          {/* Search Bar */}
          <div className="px-6 py-4 bg-white/80 backdrop-blur border-b border-gray-100 flex items-center gap-4 sticky top-[80px] z-10">
              <div className="flex-1 relative group">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#E60023] transition-colors" />
                  <input 
                      type="text" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-gray-100 rounded-full pl-12 pr-4 py-3 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-[#E60023]/20 focus:outline-none transition-all"
                  />
              </div>
              <button className="p-3 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-600">
                  <LayoutGrid size={20} />
              </button>
          </div>

          {/* Masonry Grid */}
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
              <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                  {MOCK_PINS.map((pin) => (
                      <div key={pin.id} className="break-inside-avoid relative group rounded-2xl overflow-hidden cursor-pointer">
                          <img src={pin.imageUrl} alt={pin.title} className="w-full h-auto object-cover" />
                          
                          {/* Hover Overlay */}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4">
                              <div className="flex justify-end gap-2">
                                  <button className="p-2 bg-white/20 backdrop-blur rounded-full text-white hover:bg-white/40"><Heart size={16}/></button>
                                  <button className="p-2 bg-white/20 backdrop-blur rounded-full text-white hover:bg-white/40"><Share2 size={16}/></button>
                              </div>
                              
                              <button 
                                  onClick={() => handleGenerateClick(pin)}
                                  disabled={!!generatingId}
                                  className="w-full py-3 bg-white text-black font-bold rounded-full text-xs hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-xl"
                              >
                                  {generatingId === pin.id ? (
                                      <RefreshCw size={14} className="animate-spin" />
                                  ) : (
                                      <Zap size={14} className="fill-yellow-400 text-yellow-400" />
                                  )}
                                  {generatingId === pin.id ? 'Analyzing...' : 'Tech Pack Now'}
                              </button>
                          </div>
                          
                          {/* Pin Info */}
                          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                              <p className="text-xs font-bold truncate">{pin.title}</p>
                              <p className="text-[10px] opacity-80">{pin.author}</p>
                          </div>
                      </div>
                  ))}
              </div>
              
              {!isConnected && (
                  <div className="mt-8 p-6 bg-[#E60023]/5 border border-[#E60023]/10 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-[#E60023] rounded-xl flex items-center justify-center text-white">
                              <TrendingUp size={24} />
                          </div>
                          <div>
                              <h4 className="font-bold text-gray-900">Unlock Real-time Trends</h4>
                              <p className="text-xs text-gray-500">Connect your Pinterest Business account to see live analytics and personalized feeds.</p>
                          </div>
                      </div>
                      <button onClick={handleConnect} className="bg-[#E60023] text-white px-6 py-2 rounded-full text-xs font-bold hover:bg-[#ad081b] transition-colors">
                          Connect Now
                      </button>
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};

export default PinterestTrendsView;
