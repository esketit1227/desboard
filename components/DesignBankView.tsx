import React, { useState, useRef } from 'react';
import { X, Folder, Image as ImageIcon, FileText, Upload, Trash2, Search, Plus, Check, Grid, LayoutGrid, ChevronRight, MoreHorizontal, User, Share2, Globe, Download, Link as LinkIcon, Briefcase, FolderPlus, ArrowLeft } from 'lucide-react';
import { DesignAsset, AssetType, ProjectStatus } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  assets: DesignAsset[];
  onUpload: (file: File) => void;
  onDelete: (id: string) => void;
  onSelect?: (asset: DesignAsset) => void;
  onUpdateAsset?: (id: string, updates: Partial<DesignAsset>) => void;
  onCreateFolder?: (name: string, parentId: string | null) => void;
  mode?: 'view' | 'pick_logo';
  isDarkMode?: boolean;
}

const MOCK_CLIENTS = ['Velvet & Vine', 'Urban Tread', 'Global Corp', 'Acme Co', 'Nebula Studios'];

const DesignBankView: React.FC<Props> = ({ isOpen, onClose, assets, onUpload, onDelete, onSelect, onUpdateAsset, onCreateFolder, mode = 'view', isDarkMode = false }) => {
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [shareModalAsset, setShareModalAsset] = useState<DesignAsset | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Navigation Logic
  const getBreadcrumbs = () => {
    const crumbs = [{ id: null, name: 'Vault' }];
    if (!currentFolderId) return crumbs;

    let current = assets.find(a => a.id === currentFolderId);
    const path = [];
    while (current) {
        path.unshift({ id: current.id, name: current.name });
        current = assets.find(a => a.id === current.parentId);
    }
    return [...crumbs, ...path];
  };

  const breadcrumbs = getBreadcrumbs();

  const filteredAssets = assets.filter(asset => {
    // 1. Filter by hierarchy
    if (asset.parentId !== currentFolderId && asset.id !== currentFolderId) {
        // Only show items in current folder
        if (asset.parentId !== currentFolderId) return false;
    }
    
    // 2. Filter by Search
    if (searchQuery) {
        return asset.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
               asset.client?.toLowerCase().includes(searchQuery.toLowerCase());
    }

    return true;
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      // Create asset wrapper, would typically happen in parent, but for now passing file
      // In a real app, we'd pass parentId to the upload handler
      onUpload(e.target.files[0]); 
    }
  };

  const handleCreateFolder = () => {
      const name = window.prompt("Enter folder name:");
      if (name && onCreateFolder) {
          onCreateFolder(name, currentFolderId);
      }
  };

  const getStatusColor = (status?: ProjectStatus) => {
      switch(status) {
          case 'completed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
          case 'on-going': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
          case 'pending': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
          default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
      }
  };

  // Styling Constants
  const cardClass = isDarkMode ? 'glass-card-dark border-white/10 hover:bg-white/5' : 'glass-card hover:bg-white/50';
  const textClass = isDarkMode ? 'text-white' : 'text-black';
  const subTextClass = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const inputBgClass = isDarkMode ? 'bg-white/10 border-white/10 focus:border-white/30 text-white' : 'bg-white/50 border-white/40 focus:border-black/20 text-black';

  const ShareModal = () => {
      if (!shareModalAsset) return null;
      const shareUrl = `https://desboard.design/share/${shareModalAsset.id}`;
      
      return (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <div className={`w-full max-w-md p-6 rounded-2xl shadow-2xl animate-scale-in border ${isDarkMode ? 'bg-[#1C1C1E] border-white/10' : 'bg-white border-white/50'}`}>
                  <div className="flex justify-between items-center mb-6">
                      <h3 className={`text-lg font-bold ${textClass}`}>Share "{shareModalAsset.name}"</h3>
                      <button onClick={() => setShareModalAsset(null)} className={`p-1 rounded-full ${subTextClass} hover:bg-gray-100 dark:hover:bg-white/10`}><X size={20}/></button>
                  </div>

                  <div className="space-y-4">
                      {/* Web Spectating */}
                      <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                          <div className="flex items-center gap-3 mb-2">
                              <div className="p-2 bg-blue-500 text-white rounded-lg"><Globe size={18}/></div>
                              <div>
                                  <div className={`text-sm font-bold ${textClass}`}>Web Spectating</div>
                                  <div className={`text-xs ${subTextClass}`}>Anyone with the link can view</div>
                              </div>
                              <div className="ml-auto">
                                   <div className={`w-10 h-5 rounded-full relative transition-colors ${true ? 'bg-green-500' : 'bg-gray-300'}`}>
                                       <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                                   </div>
                              </div>
                          </div>
                          <div className={`flex items-center gap-2 p-2 rounded-lg text-xs mt-2 ${isDarkMode ? 'bg-black/50 text-gray-400' : 'bg-white text-gray-600 border border-gray-200'}`}>
                              <LinkIcon size={12}/>
                              <span className="truncate flex-1">{shareUrl}</span>
                              <button className="font-bold hover:text-blue-500">Copy</button>
                          </div>
                      </div>

                      {/* Download Link */}
                      <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                           <div className="flex items-center gap-3">
                              <div className="p-2 bg-purple-500 text-white rounded-lg"><Download size={18}/></div>
                              <div>
                                  <div className={`text-sm font-bold ${textClass}`}>Direct Download</div>
                                  <div className={`text-xs ${subTextClass}`}>PDF & Assets Package</div>
                              </div>
                              <button className={`ml-auto px-3 py-1.5 rounded-lg text-xs font-bold border ${isDarkMode ? 'border-white/20 text-white hover:bg-white/10' : 'border-gray-200 text-gray-700 hover:bg-white'}`}>
                                  Generate
                              </button>
                          </div>
                      </div>
                  </div>
                  
                  <div className="mt-6 flex justify-end">
                      <button onClick={() => setShareModalAsset(null)} className={`px-4 py-2 rounded-xl text-sm font-bold ${isDarkMode ? 'bg-white text-black' : 'bg-black text-white'}`}>Done</button>
                  </div>
              </div>
          </div>
      );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-4 md:px-8 md:py-8">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity" 
        onClick={onClose}
      />
      
      {/* Main Window */}
      <div className={`relative w-full max-w-7xl rounded-[32px] shadow-2xl overflow-hidden h-full max-h-[90vh] flex flex-col animate-scale-in border border-white/20 ${isDarkMode ? 'bg-black' : 'bg-[#F2F2F7]'}`}>
        
        {/* Toolbar */}
        <div className={`${isDarkMode ? 'bg-black/70 border-white/10' : 'bg-white/60 border-white/40'} backdrop-blur-xl border-b p-5 flex flex-col md:flex-row justify-between items-center sticky top-0 z-20 gap-4`}>
           <div className="flex items-center gap-4 w-full md:w-auto overflow-hidden">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg shrink-0 ${isDarkMode ? 'bg-white text-black' : 'bg-black text-white'}`}>
                  {mode === 'pick_logo' ? <ImageIcon size={20} strokeWidth={1.5} /> : <Folder size={20} strokeWidth={1.5} />}
              </div>
              
              <div className="flex flex-col overflow-hidden">
                  <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-wider text-gray-500 mb-0.5">
                       {breadcrumbs.map((crumb, i) => (
                           <React.Fragment key={i}>
                               {i > 0 && <ChevronRight size={10} />}
                               <button 
                                   onClick={() => setCurrentFolderId(crumb.id as string)}
                                   className={`hover:text-black dark:hover:text-white transition-colors ${i === breadcrumbs.length - 1 ? 'text-black dark:text-white' : ''}`}
                               >
                                   {crumb.name}
                               </button>
                           </React.Fragment>
                       ))}
                  </div>
                  <h2 className={`text-[20px] font-light tracking-tighter leading-none ${textClass} truncate`}>
                      {breadcrumbs[breadcrumbs.length -1].name}
                  </h2>
              </div>
           </div>

           <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              <div className="relative group hidden md:block">
                  <Search size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${subTextClass}`} />
                  <input 
                    type="text" 
                    placeholder="Search vault..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`pl-10 pr-4 py-2 rounded-xl text-[14px] focus:outline-none focus:ring-0 w-48 transition-all border ${inputBgClass}`}
                  />
              </div>

              {mode === 'view' && (
                  <button 
                    onClick={handleCreateFolder}
                    className={`h-10 px-3 rounded-xl flex items-center gap-2 text-[13px] font-bold transition-all border ${isDarkMode ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-white border-gray-200 text-black hover:bg-gray-50'}`}
                  >
                    <FolderPlus size={16} /> <span className="hidden lg:inline">New Folder</span>
                  </button>
              )}
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                className={`h-10 px-4 rounded-xl flex items-center gap-2 text-[13px] font-bold uppercase tracking-wide transition-all shadow-sm hover:scale-105 ${isDarkMode ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'}`}
              >
                <Plus size={16} strokeWidth={3} /> <span className="hidden md:inline">Upload</span>
              </button>

              <button 
                onClick={onClose}
                className={`p-2.5 rounded-full transition-colors ${isDarkMode ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-white/50 hover:bg-white text-black'}`}
              >
                <X size={20} strokeWidth={1.5} />
              </button>
           </div>
        </div>

        {/* Content Grid */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8" onClick={() => setActiveMenuId(null)}>
            {filteredAssets.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <div className={`w-20 h-20 rounded-[32px] flex items-center justify-center mb-4 ${isDarkMode ? 'bg-white/5' : 'bg-white'}`}>
                        <Folder size={32} strokeWidth={1} className="opacity-20" />
                    </div>
                    <p className={`text-[17px] font-medium ${textClass}`}>Empty Folder</p>
                    <p className={`text-[14px] ${subTextClass}`}>Upload assets or create sub-folders.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                    {filteredAssets.map(asset => (
                        <div 
                            key={asset.id} 
                            onClick={() => {
                                if (asset.type === 'folder') {
                                    setCurrentFolderId(asset.id);
                                } else if (onSelect) {
                                    onSelect(asset);
                                }
                            }}
                            className={`
                                group relative rounded-[24px] p-3 
                                flex flex-col ${asset.type === 'folder' ? 'aspect-[2/1] justify-center' : 'aspect-[4/5]'}
                                transition-all duration-300 hover:scale-[1.02] cursor-pointer
                                ${cardClass}
                            `}
                        >
                            {/* Folder View */}
                            {asset.type === 'folder' ? (
                                <div className="flex items-center gap-4 px-2">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isDarkMode ? 'bg-white/10 text-white' : 'bg-yellow-100 text-yellow-600'}`}>
                                        <Folder size={24} fill="currentColor" className="opacity-80"/>
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className={`text-[14px] font-bold ${textClass} truncate`}>{asset.name}</h4>
                                        <p className={`text-[11px] ${subTextClass}`}>Folder</p>
                                    </div>
                                </div>
                            ) : (
                                /* Asset View */
                                <>
                                    {/* Preview */}
                                    <div className={`flex-1 flex items-center justify-center overflow-hidden mb-3 relative rounded-xl ${isDarkMode ? 'bg-white/5' : 'bg-white/60'}`}>
                                        {asset.type === 'logo' && asset.url ? (
                                            <img src={asset.url} alt={asset.name} className="max-w-full max-h-full object-contain p-4" />
                                        ) : asset.type === 'techpack' ? (
                                            <div className="relative w-full h-full flex items-center justify-center">
                                                <div className="absolute inset-0 opacity-40">
                                                    {asset.data?.images.frontSketch && (
                                                        <img src={`data:image/png;base64,${asset.data.images.frontSketch}`} className={`w-full h-full object-contain ${isDarkMode ? '' : 'mix-blend-multiply'}`} />
                                                    )}
                                                </div>
                                                <div className={`z-10 p-3 rounded-2xl shadow-sm ${isDarkMode ? 'bg-[#3C3C3E]' : 'bg-white'}`}>
                                                    <FileText size={24} strokeWidth={1.5} className={textClass} />
                                                </div>
                                            </div>
                                        ) : (
                                            <Folder size={24} strokeWidth={1.5} className="text-gray-400" />
                                        )}
                                        
                                        {/* Quick Status Pill */}
                                        {asset.status && (
                                            <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wide ${getStatusColor(asset.status)}`}>
                                                {asset.status.replace('-', ' ')}
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Info */}
                                    <div className="flex justify-between items-start px-1 relative">
                                        <div className="min-w-0 flex-1 mr-2">
                                            <h4 className={`text-[13px] font-bold tracking-tight truncate ${textClass}`} title={asset.name}>{asset.name}</h4>
                                            
                                            {/* Client Tag */}
                                            {asset.client ? (
                                                <div className="flex items-center gap-1 mt-1">
                                                    <User size={10} className={subTextClass} />
                                                    <span className={`text-[11px] font-medium truncate ${subTextClass}`}>{asset.client}</span>
                                                </div>
                                            ) : (
                                                <p className={`text-[11px] font-medium ${subTextClass}`}>{asset.date}</p>
                                            )}
                                        </div>
                                        
                                        {/* Context Menu Trigger */}
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === asset.id ? null : asset.id); }}
                                            className={`p-1 rounded-md hover:bg-gray-100 dark:hover:bg-white/10 ${activeMenuId === asset.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}
                                        >
                                            <MoreHorizontal size={16} className={subTextClass} />
                                        </button>

                                        {/* Dropdown Menu */}
                                        {activeMenuId === asset.id && (
                                            <div className={`absolute bottom-full right-0 mb-2 w-48 rounded-xl shadow-xl border z-50 animate-scale-in p-1 ${isDarkMode ? 'bg-[#2C2C2E] border-white/10' : 'bg-white border-gray-200'}`} onClick={(e) => e.stopPropagation()}>
                                                <div className={`px-3 py-2 text-[10px] font-bold uppercase tracking-wider ${subTextClass} border-b ${isDarkMode ? 'border-white/5' : 'border-gray-50'}`}>Actions</div>
                                                <button onClick={() => { setShareModalAsset(asset); setActiveMenuId(null); }} className={`w-full text-left px-3 py-2 text-xs font-medium rounded-lg flex items-center gap-2 ${isDarkMode ? 'hover:bg-white/10 text-white' : 'hover:bg-gray-50 text-gray-700'}`}>
                                                    <Share2 size={14}/> Share Link
                                                </button>
                                                
                                                {/* Status Submenu Mock */}
                                                <div className="px-3 py-1.5 mt-1">
                                                    <div className={`text-[9px] font-bold uppercase ${subTextClass} mb-1`}>Set Status</div>
                                                    <div className="flex gap-1">
                                                        <button onClick={() => { onUpdateAsset?.(asset.id, {status: 'completed'}); setActiveMenuId(null); }} className="w-4 h-4 rounded-full bg-green-500 hover:scale-110 transition-transform" title="Completed"/>
                                                        <button onClick={() => { onUpdateAsset?.(asset.id, {status: 'on-going'}); setActiveMenuId(null); }} className="w-4 h-4 rounded-full bg-orange-500 hover:scale-110 transition-transform" title="On Going"/>
                                                        <button onClick={() => { onUpdateAsset?.(asset.id, {status: 'pending'}); setActiveMenuId(null); }} className="w-4 h-4 rounded-full bg-gray-400 hover:scale-110 transition-transform" title="Pending"/>
                                                    </div>
                                                </div>

                                                {/* Client Tagging Mock */}
                                                <div className="px-3 py-1.5 mt-1 border-t border-gray-100 dark:border-white/5">
                                                    <div className={`text-[9px] font-bold uppercase ${subTextClass} mb-1`}>Tag Client</div>
                                                    <select 
                                                        className={`w-full text-xs bg-transparent outline-none ${textClass}`}
                                                        onChange={(e) => { onUpdateAsset?.(asset.id, {client: e.target.value}); setActiveMenuId(null); }}
                                                        value={asset.client || ''}
                                                    >
                                                        <option value="">None</option>
                                                        {MOCK_CLIENTS.map(c => <option key={c} value={c}>{c}</option>)}
                                                    </select>
                                                </div>
                                                
                                                <div className="h-px bg-gray-100 dark:bg-white/5 my-1" />
                                                <button onClick={() => onDelete(asset.id)} className="w-full text-left px-3 py-2 text-xs font-medium rounded-lg flex items-center gap-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                                                    <Trash2 size={14}/> Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
        
        {/* Footer info */}
        <div className={`backdrop-blur-sm border-t p-4 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'bg-black/50 border-white/10 text-gray-500' : 'bg-white/30 border-white/40 text-gray-400'}`}>
            <span>{filteredAssets.length} Items</span>
            <span>Vault Storage: 2.4GB / 5TB</span>
        </div>

        <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/png,image/jpeg,image/svg+xml" 
            className="hidden" 
        />
        
        <ShareModal />
      </div>
    </div>
  );
};

export default DesignBankView;