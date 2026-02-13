
import React, { useState } from 'react';
import { X, Search, Filter, Layers, Heart, ArrowRight, Plus, Check, Leaf, Scale, Droplet } from 'lucide-react';
import { Fabric, TechPackData } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (fabric: Fabric, replaceIndex?: number) => void;
  techData: TechPackData | null;
}

const MOCK_FABRICS: Fabric[] = [
    { id: '1', name: 'Heavyweight French Terry', composition: '100% Cotton', weight: '450 GSM', width: '180cm', price: '$12.50', category: 'Knits', tags: ['Streetwear', 'Premium', 'Loopback'], image: 'https://images.unsplash.com/photo-1620799140408-ed5341cd2431?q=80&w=2000&auto=format&fit=crop' },
    { id: '2', name: 'Organic Jersey', composition: '100% Organic Cotton', weight: '180 GSM', width: '160cm', price: '$8.20', category: 'Knits', tags: ['Sustainable', 'Basics', 'Soft'], image: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?q=80&w=2000&auto=format&fit=crop' },
    { id: '3', name: 'Technical Nylon Shell', composition: '100% Nylon', weight: '120 GSM', width: '150cm', price: '$15.00', category: 'Wovens', tags: ['Outerwear', 'Waterproof', 'Performance'], image: 'https://images.unsplash.com/photo-1550953683-162e24d770c0?q=80&w=2000&auto=format&fit=crop' },
    { id: '4', name: 'Raw Denim 14oz', composition: '100% Cotton', weight: '14oz', width: '150cm', price: '$18.50', category: 'Denim', tags: ['Selvedge', 'Rigid', 'Workwear'], image: 'https://images.unsplash.com/photo-1542060748-10c2872b2010?q=80&w=2000&auto=format&fit=crop' },
    { id: '5', name: 'Silk Charmeuse', composition: '100% Silk', weight: '19mm', width: '140cm', price: '$45.00', category: 'Silk', tags: ['Luxury', 'Drape', 'Evening'], image: 'https://images.unsplash.com/photo-1612459828062-11471d882d24?q=80&w=2000&auto=format&fit=crop' },
    { id: '6', name: 'Recycled Poly Mesh', composition: '100% Recycled Polyester', weight: '150 GSM', width: '160cm', price: '$6.50', category: 'Activewear', tags: ['Sport', 'Breathable', 'Eco'], image: 'https://images.unsplash.com/photo-1620799140171-71380720473e?q=80&w=2000&auto=format&fit=crop' },
];

const FabricLibraryView: React.FC<Props> = ({ isOpen, onClose, onSelect, techData }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // New Filters
  const [selectedComposition, setSelectedComposition] = useState<string>('All');
  const [selectedWeight, setSelectedWeight] = useState<string>('All');
  const [onlySustainable, setOnlySustainable] = useState<boolean>(false);
  
  const [showReplaceModal, setShowReplaceModal] = useState<Fabric | null>(null);

  if (!isOpen) return null;

  const categories = ['All', ...Array.from(new Set(MOCK_FABRICS.map(f => f.category)))];
  const compositions = ['All', 'Cotton', 'Polyester', 'Nylon', 'Silk', 'Wool', 'Linen'];
  const weights = ['All', 'Light (<200)', 'Medium (200-350)', 'Heavy (>350)'];

  const getGsm = (weightStr: string): number => {
      const match = weightStr.match(/(\d+)/);
      if (!match) return 0;
      let val = parseInt(match[1]);
      if (weightStr.toLowerCase().includes('oz')) val = val * 33.9; // oz to gsm conversion
      if (weightStr.toLowerCase().includes('mm')) val = val * 4.3; // momme to gsm conversion
      return val;
  };

  const filteredFabrics = MOCK_FABRICS.filter(f => {
      const query = searchQuery.toLowerCase();
      const matchesSearch = f.name.toLowerCase().includes(query) || f.tags.some(t => t.toLowerCase().includes(query));
      const matchesCategory = selectedCategory === 'All' || f.category === selectedCategory;
      
      const matchesComposition = selectedComposition === 'All' || f.composition.toLowerCase().includes(selectedComposition.toLowerCase());
      
      const gsm = getGsm(f.weight);
      let matchesWeight = true;
      if (selectedWeight.startsWith('Light')) matchesWeight = gsm < 200;
      if (selectedWeight.startsWith('Medium')) matchesWeight = gsm >= 200 && gsm <= 350;
      if (selectedWeight.startsWith('Heavy')) matchesWeight = gsm > 350;

      const isSustainable = f.tags.some(t => ['sustainable', 'recycled', 'organic', 'eco'].includes(t.toLowerCase())) || f.composition.toLowerCase().includes('organic') || f.composition.toLowerCase().includes('recycled');
      const matchesSustainability = !onlySustainable || isSustainable;

      return matchesSearch && matchesCategory && matchesComposition && matchesWeight && matchesSustainability;
  });

  const handleUseFabric = (fabric: Fabric) => {
      if (techData && techData.bom.length > 0) {
          setShowReplaceModal(fabric);
      } else {
          onSelect(fabric);
      }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity" onClick={onClose} />
      
      {/* Main Modal */}
      <div className="relative w-full max-w-6xl bg-[#F2F2F7] rounded-[32px] shadow-2xl overflow-hidden h-full max-h-[90vh] flex flex-col animate-scale-in border border-white/20">
          
          {/* Header */}
          <div className="bg-white/70 backdrop-blur-xl border-b border-gray-200/50 p-5 flex justify-between items-center sticky top-0 z-10">
              <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
                      <Layers size={20} className="text-white" />
                  </div>
                  <h2 className="text-[22px] font-bold text-[#1D1D1F] tracking-tight">Fabric Library</h2>
              </div>
              <button onClick={onClose} className="p-2 bg-gray-200/50 hover:bg-gray-300/50 rounded-full text-[#1D1D1F] transition-colors">
                  <X size={20} />
              </button>
          </div>

          {/* Filters & Search Toolbar */}
          <div className="flex flex-col">
              {/* Primary Search & Categories */}
              <div className="p-4 bg-white/40 border-b border-gray-200/50 flex flex-wrap gap-4 items-center">
                  <div className="relative group">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                          type="text" 
                          placeholder="Search fabrics..." 
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 pr-4 py-2 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 w-64 shadow-sm"
                      />
                  </div>
                  <div className="h-6 w-px bg-gray-300 mx-1 hidden md:block" />
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide flex-1">
                      {categories.map(cat => (
                          <button 
                              key={cat}
                              onClick={() => setSelectedCategory(cat)}
                              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${selectedCategory === cat ? 'bg-black text-white' : 'bg-white text-gray-600 hover:bg-gray-50 border border-transparent hover:border-gray-200'}`}
                          >
                              {cat}
                          </button>
                      ))}
                  </div>
              </div>
              
              {/* Secondary Filters */}
              <div className="px-4 py-3 bg-white/60 border-b border-gray-200/50 flex flex-wrap gap-3 items-center">
                   <div className="flex items-center gap-2 text-xs font-medium text-gray-500 mr-2">
                       <Filter size={14} /> Refine:
                   </div>
                   
                   <div className="relative group">
                       <select 
                            value={selectedComposition} 
                            onChange={(e) => setSelectedComposition(e.target.value)}
                            className="appearance-none bg-white border border-gray-200 hover:border-gray-300 pl-3 pr-8 py-1.5 rounded-lg text-xs font-medium text-gray-700 outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
                       >
                           {compositions.map(c => <option key={c} value={c}>{c === 'All' ? 'Material: All' : c}</option>)}
                       </select>
                       <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                           <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L5 5L9 1" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                       </div>
                   </div>

                   <div className="relative group">
                       <select 
                            value={selectedWeight} 
                            onChange={(e) => setSelectedWeight(e.target.value)}
                            className="appearance-none bg-white border border-gray-200 hover:border-gray-300 pl-3 pr-8 py-1.5 rounded-lg text-xs font-medium text-gray-700 outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
                       >
                           {weights.map(w => <option key={w} value={w}>{w === 'All' ? 'Weight: All' : w}</option>)}
                       </select>
                       <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                           <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L5 5L9 1" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                       </div>
                   </div>

                   <button 
                        onClick={() => setOnlySustainable(!onlySustainable)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                            onlySustainable 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                        }`}
                   >
                       <Leaf size={12} fill={onlySustainable ? "currentColor" : "none"} />
                       Sustainable Only
                   </button>
                   
                   {(selectedCategory !== 'All' || selectedComposition !== 'All' || selectedWeight !== 'All' || onlySustainable) && (
                       <button 
                           onClick={() => { setSelectedCategory('All'); setSelectedComposition('All'); setSelectedWeight('All'); setOnlySustainable(false); setSearchQuery(''); }}
                           className="text-xs text-red-500 hover:text-red-600 font-medium ml-auto"
                       >
                           Clear Filters
                       </button>
                   )}
              </div>
          </div>

          {/* Grid */}
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
              {filteredFabrics.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400">
                      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-3 shadow-sm">
                          <Search size={24} className="opacity-20" />
                      </div>
                      <p className="font-medium text-gray-900">No fabrics match your filters</p>
                      <button 
                           onClick={() => { setSelectedCategory('All'); setSelectedComposition('All'); setSelectedWeight('All'); setOnlySustainable(false); setSearchQuery(''); }}
                           className="text-sm text-emerald-600 mt-2 font-medium hover:underline"
                      >
                          Reset all filters
                      </button>
                  </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredFabrics.map(fabric => (
                        <div key={fabric.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:scale-[1.01] transition-all group border border-gray-100 flex flex-col">
                            <div className="aspect-video relative overflow-hidden">
                                <img src={fabric.image} alt={fabric.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                <button className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur rounded-full text-gray-400 hover:text-red-500 transition-colors">
                                    <Heart size={16} />
                                </button>
                                <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
                                    {fabric.tags.map(tag => (
                                        <span key={tag} className="text-[9px] font-bold uppercase tracking-wide bg-black/60 backdrop-blur text-white px-2 py-0.5 rounded-md flex items-center gap-1">
                                            {['sustainable', 'recycled', 'organic', 'eco'].includes(tag.toLowerCase()) && <Leaf size={8} fill="currentColor"/>}
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="p-5 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-lg leading-tight">{fabric.name}</h3>
                                        <p className="text-xs text-gray-500 font-medium">{fabric.category}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-emerald-600">{fabric.price}</div>
                                        <div className="text-[10px] text-gray-400">/ yard</div>
                                    </div>
                                </div>
                                <div className="space-y-2 mb-6">
                                    <div className="flex justify-between text-xs border-b border-gray-50 pb-1">
                                        <span className="text-gray-400 flex items-center gap-1"><Droplet size={10}/> Content</span>
                                        <span className="font-medium text-gray-700">{fabric.composition}</span>
                                    </div>
                                    <div className="flex justify-between text-xs border-b border-gray-50 pb-1">
                                        <span className="text-gray-400 flex items-center gap-1"><Scale size={10}/> Weight</span>
                                        <span className="font-medium text-gray-700">{fabric.weight}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-400">Width</span>
                                        <span className="font-medium text-gray-700">{fabric.width}</span>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleUseFabric(fabric)}
                                    className="mt-auto w-full py-2.5 bg-black text-white rounded-xl font-semibold text-sm hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 group-hover:shadow-lg"
                                >
                                    Add to Tech Pack <ArrowRight size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
              )}
          </div>
      </div>

      {/* Replace BOM Modal */}
      {showReplaceModal && techData && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
              <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full animate-scale-in">
                  <h3 className="text-lg font-bold mb-4">Replace Material?</h3>
                  <p className="text-sm text-gray-500 mb-4">
                      Select an existing BOM item to replace with <strong>{showReplaceModal.name}</strong>, or add as new.
                  </p>
                  <div className="max-h-60 overflow-y-auto border border-gray-100 rounded-xl mb-4">
                      {techData.bom.map((item, idx) => (
                          <button 
                              key={idx}
                              onClick={() => { onSelect(showReplaceModal, idx); setShowReplaceModal(null); }}
                              className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 flex justify-between items-center group"
                          >
                              <div>
                                  <div className="font-bold text-sm text-gray-800">{item.item}</div>
                                  <div className="text-xs text-gray-400">{item.placement}</div>
                              </div>
                              <div className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center group-hover:border-black">
                                  <div className="w-3 h-3 bg-black rounded-full opacity-0 group-hover:opacity-100" />
                              </div>
                          </button>
                      ))}
                      <button 
                          onClick={() => { onSelect(showReplaceModal); setShowReplaceModal(null); }}
                          className="w-full text-left p-3 hover:bg-gray-50 flex items-center gap-3 text-emerald-600 font-medium text-sm"
                      >
                          <Plus size={16} /> Add as new material
                      </button>
                  </div>
                  <button onClick={() => setShowReplaceModal(null)} className="w-full py-2 bg-gray-100 rounded-xl font-semibold text-sm hover:bg-gray-200 text-gray-600">Cancel</button>
              </div>
          </div>
      )}
    </div>
  );
};

export default FabricLibraryView;
