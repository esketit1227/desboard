import React, { useState, useRef } from 'react';
import { X, Folder, Image as ImageIcon, FileText, Upload, Trash2, Search, Plus, Check } from 'lucide-react';
import { DesignAsset, AssetType } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  assets: DesignAsset[];
  onUpload: (file: File) => void;
  onDelete: (id: string) => void;
  onSelect?: (asset: DesignAsset) => void;
  mode?: 'view' | 'pick_logo';
}

const DesignBankView: React.FC<Props> = ({ isOpen, onClose, assets, onUpload, onDelete, onSelect, mode = 'view' }) => {
  const [activeTab, setActiveTab] = useState<AssetType | 'all'>(mode === 'pick_logo' ? 'logo' : 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const filteredAssets = assets.filter(asset => {
    const matchesTab = activeTab === 'all' ? true : asset.type === activeTab;
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
        asset.name.toLowerCase().includes(query) || 
        asset.type.toLowerCase().includes(query) || 
        asset.date.toLowerCase().includes(query);
    return matchesTab && matchesSearch;
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      onUpload(e.target.files[0]);
    }
  };

  const getIcon = (type: AssetType) => {
    switch(type) {
      case 'logo': return <ImageIcon size={24} className="text-purple-500" />;
      case 'techpack': return <FileText size={24} className="text-blue-500" />;
      default: return <Folder size={24} className="text-gray-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-6 py-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity" 
        onClick={onClose}
      />
      
      {/* Main Window - iOS Modal Style */}
      <div className="relative w-full max-w-4xl bg-[#F2F2F7] rounded-[32px] shadow-2xl overflow-hidden h-full max-h-[85vh] flex flex-col animate-scale-in border border-white/20">
        
        {/* Toolbar */}
        <div className="bg-white/70 backdrop-blur-xl border-b border-gray-200/50 p-5 flex justify-between items-center sticky top-0 z-10">
           <div className="flex items-center gap-6">
              <h2 className="text-[22px] font-bold text-[#1D1D1F] tracking-tight">
                  {mode === 'pick_logo' ? 'Select Brand Logo' : 'Design Bank'}
              </h2>
              
              {/* Segmented Control */}
              <div className="flex bg-gray-200/50 p-1 rounded-xl">
                  {(mode === 'pick_logo' ? ['logo'] : ['all', 'logo', 'techpack']).map((tab: any) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-1.5 text-[13px] font-semibold rounded-lg transition-all capitalize ${
                            activeTab === tab 
                            ? 'bg-white text-black shadow-sm' 
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        {tab === 'all' ? 'All Items' : tab === 'logo' ? 'Logos' : 'Tech Packs'}
                      </button>
                  ))}
              </div>
           </div>

           <div className="flex items-center gap-3">
              <div className="relative group">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Search" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-gray-200/50 rounded-xl text-[14px] focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 w-48 transition-all"
                  />
              </div>
              
              {(mode === 'view' || activeTab === 'logo') && (
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-[#007AFF] hover:bg-[#0062CC] text-white px-4 py-2 rounded-full flex items-center gap-2 text-[13px] font-semibold transition-colors shadow-sm"
                  >
                    <Plus size={16} strokeWidth={3} /> Upload
                  </button>
              )}

              <button 
                onClick={onClose}
                className="p-2 bg-gray-200/50 hover:bg-gray-300/50 rounded-full text-[#1D1D1F] transition-colors ml-2"
              >
                <X size={20} />
              </button>
           </div>
        </div>

        {/* Content Grid */}
        <div className="flex-1 overflow-y-auto p-8">
            {filteredAssets.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mb-4">
                        <Folder size={32} className="opacity-20 text-gray-500" />
                    </div>
                    <p className="text-[17px] font-medium text-gray-900">No items found</p>
                    <p className="text-[14px]">Upload logos or save tech packs to populate your bank.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {filteredAssets.map(asset => (
                        <div 
                            key={asset.id} 
                            onClick={() => onSelect && onSelect(asset)}
                            className="group relative bg-white rounded-[24px] p-4 shadow-sm hover:shadow-lg transition-all cursor-pointer flex flex-col aspect-square transform hover:scale-[1.02] duration-300"
                        >
                            <div className="flex-1 flex items-center justify-center overflow-hidden mb-4 relative rounded-2xl bg-gray-50/50">
                                {asset.type === 'logo' && asset.url ? (
                                    <img src={asset.url} alt={asset.name} className="max-w-full max-h-full object-contain p-4" />
                                ) : asset.type === 'techpack' ? (
                                    <div className="relative w-full h-full flex items-center justify-center">
                                        <div className="absolute inset-0 opacity-40">
                                            {asset.data?.images.frontSketch && (
                                                <img src={`data:image/png;base64,${asset.data.images.frontSketch}`} className="w-full h-full object-contain mix-blend-multiply" />
                                            )}
                                        </div>
                                        <div className="z-10 bg-white p-3 rounded-2xl shadow-sm">
                                            <FileText size={24} className="text-black" />
                                        </div>
                                    </div>
                                ) : (
                                    getIcon(asset.type)
                                )}
                            </div>
                            
                            <div className="flex justify-between items-start px-1">
                                <div className="min-w-0">
                                    <h4 className="text-[14px] font-semibold text-gray-900 truncate tracking-tight" title={asset.name}>{asset.name}</h4>
                                    <p className="text-[12px] text-gray-500 font-medium">{asset.date}</p>
                                </div>
                                {mode === 'view' && (
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); onDelete(asset.id); }}
                                        className="text-gray-300 hover:text-red-500 transition-colors p-1"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
        
        {/* Footer info */}
        <div className="bg-gray-50/80 backdrop-blur-sm border-t border-gray-200/50 p-4 text-center text-[11px] font-medium text-gray-400">
            {filteredAssets.length} items stored in iCloud Drive
        </div>

        <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/png,image/jpeg,image/svg+xml" 
            className="hidden" 
        />

      </div>
    </div>
  );
};

export default DesignBankView;