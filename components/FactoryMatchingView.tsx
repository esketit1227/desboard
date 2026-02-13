
import React, { useState } from 'react';
import { X, Factory as FactoryIcon, MapPin, DollarSign, Leaf, CheckCircle, ExternalLink, Filter, ShoppingBag, Send, Loader2, Award, Zap } from 'lucide-react';
import { Factory, TechPackData } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  data: TechPackData;
}

const INTERNAL_FACTORIES: Factory[] = [
    { id: 'f1', name: 'Portugal Tex Manufacturing', region: 'Portugal', specialties: ['Jersey', 'Cotton', 'Streetwear'], moq: '200', priceTier: 'Mid', rating: 4.8, sustainability: true, source: 'internal' },
    { id: 'f2', name: 'Vietnam Performance Lab', region: 'Vietnam', specialties: ['Technical', 'Synthetics', 'Outerwear'], moq: '500', priceTier: 'Budget', rating: 4.5, sustainability: false, source: 'internal' },
    { id: 'f3', name: 'Italian Luxury Knitwear', region: 'Italy', specialties: ['Knitwear', 'Wool', 'Luxury'], moq: '50', priceTier: 'High', rating: 5.0, sustainability: true, source: 'internal' },
    { id: 'f4', name: 'Istanbul Denim Co', region: 'Turkey', specialties: ['Denim', 'Woven', 'Heavyweight'], moq: '300', priceTier: 'Mid', rating: 4.7, sustainability: true, source: 'internal' },
];

const ALIBABA_FACTORIES: Factory[] = [
    { id: 'a1', name: 'Guangzhou Garment Co., Ltd.', region: 'China', specialties: ['Hoodies', 'T-Shirts', 'Streetwear'], moq: '50', priceTier: 'Budget', rating: 4.6, sustainability: false, source: 'alibaba', badges: ['Gold Supplier', 'Verified', 'Trade Assurance'], responseRate: '98%', yearsActive: 12 },
    { id: 'a2', name: 'Hangzhou Silk Imp & Exp', region: 'China', specialties: ['Silk', 'Dresses', 'Blouses'], moq: '100', priceTier: 'Mid', rating: 4.9, sustainability: true, source: 'alibaba', badges: ['Gold Supplier', 'Verified'], responseRate: '95%', yearsActive: 8 },
    { id: 'a3', name: 'Dhaka Knitwear Solutions', region: 'Bangladesh', specialties: ['Cotton', 'Basics', 'Bulk'], moq: '1000', priceTier: 'Budget', rating: 4.3, sustainability: false, source: 'alibaba', badges: ['Verified'], responseRate: '88%', yearsActive: 15 },
    { id: 'a4', name: 'Lahore Textile Mills', region: 'Pakistan', specialties: ['Denim', 'Woven'], moq: '500', priceTier: 'Budget', rating: 4.5, sustainability: true, source: 'alibaba', badges: ['Gold Supplier'], responseRate: '92%', yearsActive: 20 },
];

const FactoryMatchingView: React.FC<Props> = ({ isOpen, onClose, data }) => {
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [selectedTier, setSelectedTier] = useState<string>('All');
  const [maxMoq, setMaxMoq] = useState<number>(1000);
  const [activeTab, setActiveTab] = useState<'internal' | 'alibaba'>('internal');
  const [isAlibabaConnected, setIsAlibabaConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [sentFactories, setSentFactories] = useState<string[]>([]);

  if (!isOpen) return null;

  const categoryKeywords = data.marketAnalysis?.category.split(' ') || [];
  const fabricationKeywords = data.fabrication.split(' ');

  const currentDataset = activeTab === 'internal' ? INTERNAL_FACTORIES : ALIBABA_FACTORIES;

  // Simple matching logic
  const matchedFactories = currentDataset.filter(f => {
      // Filter Logic
      if (selectedRegion !== 'All' && f.region !== selectedRegion) return false;
      if (selectedTier !== 'All' && f.priceTier !== selectedTier) return false;
      if (parseInt(f.moq) > maxMoq) return false;
      return true;
  }).map(f => {
      let score = 0;
      // Bonus for specialty match
      if (f.specialties.some(s => categoryKeywords.includes(s) || fabricationKeywords.includes(s) || data.description.includes(s))) {
          score += 2;
      }
      return { ...f, matchScore: score };
  }).sort((a, b) => b.matchScore - a.matchScore);

  const regions = ['All', ...Array.from(new Set(currentDataset.map(f => f.region)))];

  const handleAlibabaConnect = () => {
      setIsConnecting(true);
      setTimeout(() => {
          setIsConnecting(false);
          setIsAlibabaConnected(true);
      }, 1500);
  };

  const handleSendTechPack = (id: string) => {
      setSentFactories(prev => [...prev, id]);
  };

  const openAlibabaProfile = (name: string) => {
      // In a real app, this would be the actual vendor URL
      window.open(`https://www.alibaba.com/showroom/${name.toLowerCase().replace(/ /g, '-')}.html`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] h-[800px] animate-scale-in">
        
        {/* Header */}
        <div className="bg-[#1D1D1F] text-white p-6 pb-0">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <FactoryIcon className="text-blue-400" size={24} />
                        <h2 className="text-2xl font-bold">Manufacturing Network</h2>
                    </div>
                    <p className="text-white/60 text-sm">
                        Connect with partners capable of producing <strong>{data.styleName}</strong>.
                    </p>
                </div>
                <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                    <X size={20} />
                </button>
            </div>
            
            {/* Tabs */}
            <div className="flex gap-6 border-b border-white/10">
                <button 
                    onClick={() => setActiveTab('internal')}
                    className={`pb-4 text-sm font-bold uppercase tracking-wide transition-colors relative ${activeTab === 'internal' ? 'text-white' : 'text-white/40 hover:text-white/70'}`}
                >
                    Curated Partners
                    {activeTab === 'internal' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 rounded-full" />}
                </button>
                <button 
                    onClick={() => setActiveTab('alibaba')}
                    className={`pb-4 text-sm font-bold uppercase tracking-wide transition-colors relative flex items-center gap-2 ${activeTab === 'alibaba' ? 'text-[#FF6600]' : 'text-white/40 hover:text-white/70'}`}
                >
                    Alibaba.com Suppliers
                    {activeTab === 'alibaba' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#FF6600] rounded-full" />}
                </button>
            </div>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                <Filter size={16} /> Filters:
            </div>
            
            <select 
                value={selectedRegion} 
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-blue-500"
            >
                {regions.map(r => <option key={r} value={r}>{r === 'All' ? 'All Regions' : r}</option>)}
            </select>

            <select 
                value={selectedTier} 
                onChange={(e) => setSelectedTier(e.target.value)}
                className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-blue-500"
            >
                <option value="All">All Price Tiers</option>
                <option value="Budget">Budget</option>
                <option value="Mid">Mid-Range</option>
                <option value="High">Premium / Luxury</option>
            </select>

            <div className="flex items-center gap-2 text-sm bg-white border border-gray-200 rounded-lg px-3 py-1.5">
                <span className="text-gray-500">Max MOQ:</span>
                <input 
                    type="range" 
                    min="50" 
                    max="1000" 
                    step="50"
                    value={maxMoq}
                    onChange={(e) => setMaxMoq(parseInt(e.target.value))}
                    className="w-24 accent-blue-600"
                />
                <span className="font-mono">{maxMoq}</span>
            </div>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 relative">
            
            {/* Alibaba Connect State */}
            {activeTab === 'alibaba' && !isAlibabaConnected && (
                <div className="absolute inset-0 z-10 bg-white/90 backdrop-blur-sm flex items-center justify-center p-8">
                    <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center border border-gray-100">
                        <div className="w-16 h-16 bg-[#FF6600] rounded-2xl flex items-center justify-center mx-auto mb-6 text-white font-bold text-2xl shadow-lg shadow-orange-200">
                            Al
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Connect to Alibaba.com</h3>
                        <p className="text-gray-500 text-sm mb-6">Link your account to search verified suppliers, check Gold status, and send tech packs directly.</p>
                        <button 
                            onClick={handleAlibabaConnect}
                            disabled={isConnecting}
                            className="w-full py-3 bg-[#FF6600] hover:bg-[#E65C00] text-white rounded-xl font-bold shadow-lg shadow-orange-200 transition-all flex items-center justify-center gap-2"
                        >
                            {isConnecting ? <Loader2 className="animate-spin" size={20} /> : <ShoppingBag size={20} />}
                            {isConnecting ? 'Connecting...' : 'Connect Account'}
                        </button>
                    </div>
                </div>
            )}

            {matchedFactories.length === 0 ? (
                <div className="text-center py-20 text-gray-400">No factories match your filters.</div>
            ) : (
                <div className="grid gap-4">
                    {matchedFactories.map((factory) => (
                        <div key={factory.id} className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-6 items-start md:items-center group">
                            
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 text-gray-500 font-bold text-xl overflow-hidden border border-gray-100">
                                {factory.source === 'alibaba' ? (
                                    <span className="text-[#FF6600]">Al</span>
                                ) : (
                                    factory.name.charAt(0)
                                )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <h3 className="font-bold text-lg text-gray-900 truncate">{factory.name}</h3>
                                    {factory.badges?.includes('Verified') && (
                                        <span className="flex items-center gap-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold px-1.5 py-0.5 rounded border border-blue-100 uppercase tracking-wide">
                                            <CheckCircle size={10} /> Verified
                                        </span>
                                    )}
                                    {factory.badges?.includes('Gold Supplier') && (
                                        <span className="flex items-center gap-0.5 bg-yellow-50 text-yellow-700 text-[10px] font-bold px-1.5 py-0.5 rounded border border-yellow-100 uppercase tracking-wide">
                                            <Award size={10} /> Gold
                                        </span>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 mb-2">
                                    <span className="flex items-center gap-1"><MapPin size={14} /> {factory.region}</span>
                                    <span className="flex items-center gap-1"><DollarSign size={14} /> {factory.priceTier} Tier</span>
                                    <span className="flex items-center gap-1 font-mono text-xs bg-gray-100 px-1.5 rounded">MOQ: {factory.moq}</span>
                                    {factory.yearsActive && <span className="text-gray-400 text-xs">{factory.yearsActive} Yrs</span>}
                                    {factory.responseRate && <span className="text-green-600 text-xs font-medium flex items-center gap-0.5"><Zap size={10}/> {factory.responseRate} Resp.</span>}
                                </div>
                                <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                                    {factory.specialties.map(s => (
                                        <span key={s} className="text-[10px] bg-gray-50 text-gray-600 px-2 py-0.5 rounded border border-gray-100 whitespace-nowrap">{s}</span>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 items-end min-w-[140px]">
                                {sentFactories.includes(factory.id) ? (
                                    <button disabled className="w-full flex items-center justify-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors">
                                        <CheckCircle size={14} /> Sent
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => handleSendTechPack(factory.id)}
                                        className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm
                                            ${activeTab === 'alibaba' 
                                                ? 'bg-[#FF6600] text-white hover:bg-[#E65C00] shadow-orange-100' 
                                                : 'bg-black text-white hover:bg-gray-800'}`}
                                    >
                                        <Send size={14} /> Send Tech Pack
                                    </button>
                                )}
                                
                                {activeTab === 'internal' ? (
                                    <button className="text-xs text-gray-500 hover:text-black flex items-center gap-1">
                                        View Profile <ExternalLink size={10} />
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => openAlibabaProfile(factory.name)}
                                        className="text-xs text-[#FF6600] hover:text-[#E65C00] flex items-center gap-1 font-medium transition-colors"
                                    >
                                        View Alibaba Profile <ExternalLink size={10} />
                                    </button>
                                )}
                            </div>

                        </div>
                    ))}
                </div>
            )}
        </div>

      </div>
    </div>
  );
};

export default FactoryMatchingView;
