import React, { useState } from 'react';
import { PartyInfo } from '../types';
import { ArrowLeft, Plus, Save, Trash2, Building2, User, Phone, MapPin, FileText, Search } from 'lucide-react';

interface Props {
  title: string; // e.g. "我方公司管理" or "承攬商管理"
  colorTheme: 'blue' | 'green';
  parties: PartyInfo[];
  onUpdate: (parties: PartyInfo[]) => void;
  onBack: () => void;
}

const EMPTY_PARTY: PartyInfo = {
  companyName: '',
  taxId: '',
  representative: '',
  phone: '',
  address: ''
};

const PartyManager: React.FC<Props> = ({ title, colorTheme, parties, onUpdate, onBack }) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(-1); // -1 means creating new
  const [editData, setEditData] = useState<PartyInfo>(EMPTY_PARTY);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSelect = (index: number) => {
    setSelectedIndex(index);
    setEditData({ ...parties[index] });
  };

  const handleCreateNew = () => {
    setSelectedIndex(-1);
    setEditData(EMPTY_PARTY);
  };

  const handleSave = () => {
    if (!editData.companyName.trim()) {
      alert('請輸入公司名稱');
      return;
    }

    const newParties = [...parties];
    if (selectedIndex === -1) {
      newParties.push(editData);
    } else {
      newParties[selectedIndex] = editData;
    }
    
    onUpdate(newParties);
    
    // If we just created a new one, select it
    if (selectedIndex === -1) {
      setSelectedIndex(newParties.length - 1);
    }
    alert('儲存成功！');
  };

  const handleDelete = () => {
    if (selectedIndex === -1) return;
    if (window.confirm(`確定要刪除「${parties[selectedIndex].companyName}」嗎？`)) {
      const newParties = parties.filter((_, i) => i !== selectedIndex);
      onUpdate(newParties);
      handleCreateNew();
    }
  };

  const filteredParties = parties.map((p, i) => ({ p, originalIndex: i })).filter(({ p }) => 
    p.companyName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.taxId.includes(searchTerm) ||
    p.representative.toLowerCase().includes(searchTerm)
  );

  // Theme Logic
  const themeBorder = colorTheme === 'blue' ? 'border-blue-200 focus:ring-blue-200' : 'border-green-200 focus:ring-green-200';
  const themeBgLight = colorTheme === 'blue' ? 'bg-blue-50' : 'bg-green-50';
  
  // Explicit button styles to avoid "green text on green bg" issues
  const addButtonClass = selectedIndex === -1
    ? (colorTheme === 'blue' ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700' : 'bg-green-600 text-white shadow-md hover:bg-green-700')
    : 'bg-white border border-dashed border-slate-300 text-slate-500 hover:border-slate-400 hover:text-slate-700 hover:bg-slate-50';

  const saveButtonClass = colorTheme === 'blue' 
    ? 'bg-blue-600 text-white hover:bg-blue-700' 
    : 'bg-green-600 text-white hover:bg-green-700';

  const iconColorClass = colorTheme === 'blue' ? "text-blue-600" : "text-green-600";
  const iconSubColorClass = colorTheme === 'blue' ? "text-blue-500" : "text-green-500";
  const selectedTextClass = colorTheme === 'blue' ? 'text-blue-700' : 'text-green-700';

  return (
    <div className="min-h-screen bg-slate-50 pb-10">
      <header className="bg-white border-b sticky top-0 z-20 px-6 py-4 flex items-center gap-4 shadow-sm">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500 hover:text-slate-800">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Building2 className={iconColorClass} />
            {title}
          </h1>
          <p className="text-xs text-slate-500">管理常用資料，方便合約快速帶入</p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar List */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[calc(100vh-140px)] sticky top-[100px]">
          <div className="p-4 border-b bg-slate-50 space-y-3">
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="搜尋公司..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className={`w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 outline-none ${themeBorder}`}
                />
             </div>
             <button 
               onClick={handleCreateNew}
               className={`w-full py-2 rounded-lg flex items-center justify-center gap-2 font-medium transition-all ${addButtonClass}`}
             >
               <Plus size={18} /> 新增公司資料
             </button>
          </div>
          
          <div className="overflow-y-auto flex-1 p-2 space-y-1">
             {filteredParties.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">
                   無符合資料
                </div>
             ) : (
                filteredParties.map(({ p, originalIndex }) => (
                  <button
                    key={originalIndex}
                    onClick={() => handleSelect(originalIndex)}
                    className={`w-full text-left p-3 rounded-lg transition-all border ${
                      selectedIndex === originalIndex 
                        ? `${themeBgLight} ${colorTheme === 'blue' ? 'border-blue-200' : 'border-green-200'} shadow-sm` 
                        : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-200'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h3 className={`font-bold text-sm ${selectedIndex === originalIndex ? selectedTextClass : 'text-slate-700'}`}>
                        {p.companyName || '(未命名公司)'}
                      </h3>
                    </div>
                    <div className="text-xs text-slate-500 flex flex-col gap-0.5">
                       {p.taxId && <span>統編: {p.taxId}</span>}
                       {p.representative && <span>負責人: {p.representative}</span>}
                    </div>
                  </button>
                ))
             )}
          </div>
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-2">
           <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-full flex flex-col animate-fade-in">
              <div className="p-6 border-b flex justify-between items-center bg-slate-50/50 rounded-t-xl">
                 <h2 className="text-lg font-bold text-slate-800">
                    {selectedIndex === -1 ? '新增資料' : '編輯資料'}
                 </h2>
                 {selectedIndex !== -1 && (
                   <button 
                     onClick={handleDelete}
                     className="text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                   >
                     <Trash2 size={16} /> 刪除
                   </button>
                 )}
              </div>

              <div className="p-6 flex-1 overflow-y-auto">
                 <div className="space-y-6 max-w-2xl">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                        <Building2 size={16} className={iconSubColorClass} /> 公司名稱 <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="text"
                        value={editData.companyName}
                        onChange={e => setEditData({...editData, companyName: e.target.value})}
                        className={`w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 outline-none transition-all ${themeBorder}`}
                        placeholder="請輸入公司完整名稱"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                            <FileText size={16} className="text-slate-400" /> 統一編號
                          </label>
                          <input 
                            type="text"
                            value={editData.taxId}
                            onChange={e => setEditData({...editData, taxId: e.target.value})}
                            className={`w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 outline-none ${themeBorder}`}
                            placeholder="8碼統編"
                          />
                       </div>
                       <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                            <User size={16} className="text-slate-400" /> 代表人/負責人
                          </label>
                          <input 
                            type="text"
                            value={editData.representative}
                            onChange={e => setEditData({...editData, representative: e.target.value})}
                            className={`w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 outline-none ${themeBorder}`}
                            placeholder="姓名"
                          />
                       </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                        <Phone size={16} className="text-slate-400" /> 聯絡電話
                      </label>
                      <input 
                        type="text"
                        value={editData.phone}
                        onChange={e => setEditData({...editData, phone: e.target.value})}
                        className={`w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 outline-none ${themeBorder}`}
                        placeholder="公司電話或手機"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                        <MapPin size={16} className="text-slate-400" /> 公司地址
                      </label>
                      <input 
                        type="text"
                        value={editData.address}
                        onChange={e => setEditData({...editData, address: e.target.value})}
                        className={`w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 outline-none ${themeBorder}`}
                        placeholder="詳細地址"
                      />
                    </div>
                 </div>
              </div>

              <div className="p-6 border-t bg-slate-50 rounded-b-xl flex justify-end">
                 <button 
                   onClick={handleSave}
                   className={`${saveButtonClass} px-8 py-2.5 rounded-lg hover:opacity-90 shadow-lg flex items-center gap-2 font-bold transition-transform active:scale-95`}
                 >
                   <Save size={18} />
                   {selectedIndex === -1 ? '新增資料' : '儲存變更'}
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default PartyManager;