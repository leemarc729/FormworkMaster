import React, { useState, useEffect } from 'react';
import { ContractData, ContractItem, Clause, PartyInfo } from '../types';
import { DEFAULT_ITEMS, PRESET_CLAUSES } from '../constants';
import { v4 as uuidv4 } from 'uuid';
import { Trash2, Plus, ArrowRight, Save, Printer, ArrowLeft, CheckSquare, Square, FileText, Edit2, X, Check, Building2, User, ArrowUp, ArrowDown, PlusCircle } from 'lucide-react';

interface Props {
  initialData: ContractData;
  onSave: (data: ContractData) => void;
  onCancel: () => void;
  myCompanies: PartyInfo[];
  contractors: PartyInfo[];
  onSaveMyCompany: (party: PartyInfo) => void;
  onSaveContractor: (party: PartyInfo) => void;
}

const CATEGORIES: { id: Clause['category'] | 'all', label: string }[] = [
  { id: 'all', label: '全部' },
  { id: 'general', label: '一般條款' },
  { id: 'payment', label: '付款條件' },
  { id: 'safety', label: '安全衛生' },
  { id: 'environment', label: '環保清潔' },
  { id: 'custom', label: '特殊條款' },
];

const ContractBuilder: React.FC<Props> = ({ 
  initialData, 
  onSave, 
  onCancel,
  myCompanies,
  contractors,
  onSaveMyCompany,
  onSaveContractor
}) => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<ContractData>(initialData);
  
  // Clause Editing State
  const [editingClauseId, setEditingClauseId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editCategory, setEditCategory] = useState<Clause['category']>('custom');
  
  // Manual Clause Input State
  const [customClauseText, setCustomClauseText] = useState('');
  
  // Filter State
  const [activeCategory, setActiveCategory] = useState<Clause['category'] | 'all'>('all');

  // Helper to update Party info
  const updateParty = (party: 'partyA' | 'partyB', field: keyof PartyInfo, value: string) => {
    setData(prev => ({
      ...prev,
      [party]: { ...prev[party], [field]: value }
    }));
  };

  // Helper to load party from saved list
  const loadParty = (party: 'partyA' | 'partyB', partyInfo: PartyInfo) => {
    setData(prev => ({
      ...prev,
      [party]: { ...partyInfo }
    }));
  };

  // Helper to save current party to list
  const saveCurrentParty = (partyType: 'partyA' | 'partyB') => {
    const partyData = data[partyType];
    if(!partyData.companyName) {
      alert('請至少輸入公司名稱');
      return;
    }
    
    if (partyType === 'partyA') {
      onSaveMyCompany(partyData);
      alert(`已將「${partyData.companyName}」加入我方公司列表`);
    } else {
      onSaveContractor(partyData);
      alert(`已將「${partyData.companyName}」加入承攬商列表`);
    }
  };

  // Helper to update items
  const addItem = (preset?: Partial<ContractItem>) => {
    const newItem: ContractItem = {
      id: uuidv4(),
      name: preset?.name || '',
      unit: preset?.unit || 'm²',
      price: preset?.price || 0,
      quantity: 1,
      note: ''
    };
    setData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const removeItem = (id: string) => {
    setData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };

  const updateItem = (id: string, field: keyof ContractItem, value: any) => {
    setData(prev => ({
      ...prev,
      items: prev.items.map(item => item.id === id ? { ...item, [field]: value } : item)
    }));
  };

  // Recalculate total whenever items change
  useEffect(() => {
    const total = data.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setData(prev => ({ ...prev, totalAmount: total }));
  }, [data.items]);

  // Helper to toggle clause
  const toggleClause = (id: string) => {
    setData(prev => ({
      ...prev,
      clauses: prev.clauses.map(c => c.id === id ? { ...c, selected: !c.selected } : c)
    }));
  };

  const handleAddCustomClause = () => {
    if (!customClauseText.trim()) return;

    const newClause: Clause = {
      id: uuidv4(),
      category: 'custom', 
      content: customClauseText,
      isCustom: true,
      selected: true
    };
    setData(prev => ({
      ...prev,
      clauses: [...prev.clauses, newClause]
    }));
    
    setCustomClauseText('');
    setActiveCategory('custom'); // Switch to custom tab to see the new item
  };

  const startEditing = (e: React.MouseEvent, clause: Clause) => {
    e.stopPropagation();
    setEditingClauseId(clause.id);
    setEditContent(clause.content);
    setEditCategory(clause.category);
  };

  const saveEditing = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setData(prev => ({
      ...prev,
      clauses: prev.clauses.map(c => c.id === id ? { 
        ...c, 
        content: editContent,
        category: editCategory 
      } : c)
    }));
    setEditingClauseId(null);
    setEditContent('');
  };

  const cancelEditing = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingClauseId(null);
    setEditContent('');
  };

  const deleteClause = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('確定要刪除此條款嗎？')) {
      setData(prev => ({
        ...prev,
        clauses: prev.clauses.filter(c => c.id !== id)
      }));
    }
  };

  // Reordering Clauses
  const moveClause = (e: React.MouseEvent, index: number, direction: 'up' | 'down') => {
    e.stopPropagation();
    const newClauses = [...data.clauses];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newClauses.length) return;

    // Swap
    [newClauses[index], newClauses[targetIndex]] = [newClauses[targetIndex], newClauses[index]];
    
    setData(prev => ({ ...prev, clauses: newClauses }));
  };

  // --- Render Steps ---

  const renderStep1_BasicInfo = () => (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">工程基本資料</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">合約標題</label>
            <input 
              type="text" 
              value={data.title} 
              onChange={e => setData({...data, title: e.target.value})}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">工程地點</label>
            <input 
              type="text" 
              value={data.projectLocation} 
              onChange={e => setData({...data, projectLocation: e.target.value})}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">預計開工日</label>
            <input 
              type="date" 
              value={data.startDate} 
              onChange={e => setData({...data, startDate: e.target.value})}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">預計完工日</label>
            <input 
              type="date" 
              value={data.endDate} 
              onChange={e => setData({...data, endDate: e.target.value})}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Party A */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative group">
          <div className="flex justify-between items-center mb-4">
             <h3 className="text-lg font-bold text-blue-600 flex items-center gap-2">
              <span className="w-2 h-6 bg-blue-600 rounded-full"></span>
              甲方 (發包/業主)
            </h3>
            <div className="flex gap-2">
              {/* Dropdown for My Companies */}
              <select 
                className="text-xs border border-blue-200 rounded px-2 py-1 bg-blue-50 text-blue-700 outline-none max-w-[120px] md:max-w-xs"
                onChange={(e) => {
                  const p = myCompanies.find(p => p.companyName === e.target.value);
                  if (p) loadParty('partyA', p);
                  e.target.value = ''; // reset
                }}
              >
                <option value="">📂 我方公司...</option>
                {myCompanies.map((p, i) => (
                  <option key={i} value={p.companyName}>{p.companyName}</option>
                ))}
              </select>
              <button 
                onClick={() => saveCurrentParty('partyA')}
                title="儲存到我方公司列表"
                className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-500 hover:text-blue-600 transition-colors"
              >
                <Save size={14} />
              </button>
            </div>
          </div>
          
          <div className="space-y-4">
            <input placeholder="公司名稱" className="w-full border p-2 rounded" value={data.partyA.companyName} onChange={e => updateParty('partyA', 'companyName', e.target.value)} />
            <input placeholder="統一編號" className="w-full border p-2 rounded" value={data.partyA.taxId} onChange={e => updateParty('partyA', 'taxId', e.target.value)} />
            <input placeholder="代表人" className="w-full border p-2 rounded" value={data.partyA.representative} onChange={e => updateParty('partyA', 'representative', e.target.value)} />
            <input placeholder="電話" className="w-full border p-2 rounded" value={data.partyA.phone} onChange={e => updateParty('partyA', 'phone', e.target.value)} />
            <input placeholder="地址" className="w-full border p-2 rounded" value={data.partyA.address} onChange={e => updateParty('partyA', 'address', e.target.value)} />
          </div>
        </div>

        {/* Party B */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-green-600 flex items-center gap-2">
              <span className="w-2 h-6 bg-green-600 rounded-full"></span>
              乙方 (承攬/模板商)
            </h3>
            <div className="flex gap-2">
              {/* Dropdown for Contractors */}
              <select 
                className="text-xs border border-green-200 rounded px-2 py-1 bg-green-50 text-green-700 outline-none max-w-[120px] md:max-w-xs"
                onChange={(e) => {
                  const p = contractors.find(p => p.companyName === e.target.value);
                  if (p) loadParty('partyB', p);
                  e.target.value = '';
                }}
              >
                <option value="">📂 承攬廠商...</option>
                {contractors.map((p, i) => (
                  <option key={i} value={p.companyName}>{p.companyName}</option>
                ))}
              </select>
               <button 
                onClick={() => saveCurrentParty('partyB')}
                title="儲存到承攬商列表"
                className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-500 hover:text-green-600 transition-colors"
              >
                <Save size={14} />
              </button>
            </div>
          </div>
          <div className="space-y-4">
            <input placeholder="公司名稱" className="w-full border p-2 rounded" value={data.partyB.companyName} onChange={e => updateParty('partyB', 'companyName', e.target.value)} />
            <input placeholder="統一編號" className="w-full border p-2 rounded" value={data.partyB.taxId} onChange={e => updateParty('partyB', 'taxId', e.target.value)} />
            <input placeholder="代表人" className="w-full border p-2 rounded" value={data.partyB.representative} onChange={e => updateParty('partyB', 'representative', e.target.value)} />
            <input placeholder="電話" className="w-full border p-2 rounded" value={data.partyB.phone} onChange={e => updateParty('partyB', 'phone', e.target.value)} />
            <input placeholder="地址" className="w-full border p-2 rounded" value={data.partyB.address} onChange={e => updateParty('partyB', 'address', e.target.value)} />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2_Items = () => (
    <div className="space-y-6 animate-fade-in">
       <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800">施工項目與單價</h3>
            <div className="flex gap-2">
              <select 
                className="border rounded-lg px-3 py-2 text-sm bg-slate-50"
                onChange={(e) => {
                  const preset = DEFAULT_ITEMS.find(i => i.name === e.target.value);
                  if (preset) addItem(preset);
                  e.target.value = ""; // Reset
                }}
              >
                <option value="">+ 快速新增常用項目...</option>
                {DEFAULT_ITEMS.map(item => (
                  <option key={item.name} value={item.name}>{item.name}</option>
                ))}
              </select>
              <button 
                onClick={() => addItem()} 
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 flex items-center gap-1"
              >
                <Plus size={16} /> 自訂項目
              </button>
            </div>
          </div>

          {data.items.length === 0 ? (
            <div className="text-center py-10 text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-300">
              尚無項目，請從上方選單新增。
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 text-sm">
                    <th className="p-3 rounded-tl-lg">項目名稱</th>
                    <th className="p-3 w-24">單位</th>
                    <th className="p-3 w-32">單價</th>
                    <th className="p-3 w-32">數量</th>
                    <th className="p-3 w-32">小計</th>
                    <th className="p-3 w-48">備註 (但書)</th>
                    <th className="p-3 w-16 rounded-tr-lg"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.items.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50 group">
                      <td className="p-3">
                        <input 
                          value={item.name} 
                          onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                          className="w-full bg-transparent border-b border-transparent focus:border-blue-400 outline-none" 
                          placeholder="項目名稱"
                        />
                      </td>
                      <td className="p-3">
                         <input 
                          value={item.unit} 
                          onChange={(e) => updateItem(item.id, 'unit', e.target.value)}
                          className="w-full bg-transparent border-b border-transparent focus:border-blue-400 outline-none" 
                          placeholder="式/m2"
                        />
                      </td>
                      <td className="p-3">
                        <input 
                          type="number"
                          value={item.price} 
                          onChange={(e) => updateItem(item.id, 'price', Number(e.target.value))}
                          className="w-full bg-transparent border-b border-transparent focus:border-blue-400 outline-none" 
                        />
                      </td>
                      <td className="p-3">
                        <input 
                          type="number"
                          value={item.quantity} 
                          onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                          className="w-full bg-transparent border-b border-transparent focus:border-blue-400 outline-none" 
                        />
                      </td>
                      <td className="p-3 font-medium text-slate-700">
                        {(item.price * item.quantity).toLocaleString()}
                      </td>
                      <td className="p-3">
                        <input 
                          value={item.note || ''} 
                          onChange={(e) => updateItem(item.id, 'note', e.target.value)}
                          className="w-full bg-transparent border-b border-transparent focus:border-blue-400 outline-none text-sm text-slate-500" 
                          placeholder="備註..."
                        />
                      </td>
                      <td className="p-3 text-right">
                        <button onClick={() => removeItem(item.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50 font-bold text-slate-800">
                    <td colSpan={4} className="p-3 text-right">總計金額 (未稅)</td>
                    <td className="p-3 text-blue-600 text-lg">{data.totalAmount.toLocaleString()}</td>
                    <td colSpan={2}></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
       </div>
    </div>
  );

  const renderStep3_Clauses = () => (
    <div className="space-y-6 animate-fade-in">
      
      {/* Manual Clause Input Section (Replaces ClauseGenerator) */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <PlusCircle className="w-5 h-5 text-blue-600"/>
          新增自訂條款
        </h3>
        <p className="text-sm text-slate-500 mb-3">
          請直接輸入您想新增的特殊約定或條款內容，例如：特殊材料計價、颱風停工標準等。
        </p>
        <div className="flex gap-2 items-start">
          <textarea
            value={customClauseText}
            onChange={(e) => setCustomClauseText(e.target.value)}
            placeholder="請在此輸入條款內容..."
            className="flex-1 border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-200 outline-none min-h-[80px] text-slate-700 leading-relaxed resize-y"
          />
          <button
            onClick={handleAddCustomClause}
            disabled={!customClauseText.trim()}
            className="bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 h-fit font-medium transition-colors shadow-sm"
          >
            <Plus size={18} /> 新增
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600"/>
          合約條款選擇
        </h3>
        
        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors border ${
                activeCategory === cat.id
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {data.clauses.map((clause, index) => {
            // Filter Logic
            if (activeCategory !== 'all' && clause.category !== activeCategory) {
              return null;
            }

            const isEditing = editingClauseId === clause.id;
            
            return (
              <div 
                key={clause.id} 
                className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
                  isEditing 
                    ? 'bg-white border-blue-400 ring-2 ring-blue-50 shadow-md' 
                    : (clause.selected ? 'bg-blue-50 border-blue-200 cursor-pointer' : 'bg-white border-slate-200 hover:border-blue-300 cursor-pointer')
                }`}
                onClick={!isEditing ? () => toggleClause(clause.id) : undefined}
              >
                <div className={`mt-1 text-blue-600 shrink-0 ${!clause.selected && !isEditing && 'text-slate-300'}`}>
                  {clause.selected ? <CheckSquare size={20} /> : <Square size={20} />}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                     {isEditing ? (
                       <select
                         value={editCategory}
                         onClick={(e) => e.stopPropagation()}
                         onChange={(e) => setEditCategory(e.target.value as any)}
                         className="text-xs px-2 py-1 rounded border border-blue-300 bg-white text-slate-700 outline-none focus:ring-1 focus:ring-blue-500"
                       >
                         {CATEGORIES.filter(c => c.id !== 'all').map(opt => (
                           <option key={opt.id} value={opt.id}>{opt.label}</option>
                         ))}
                       </select>
                     ) : (
                       <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                         clause.category === 'custom' ? 'bg-purple-100 text-purple-700' : 
                         clause.category === 'safety' ? 'bg-red-100 text-red-700' :
                         clause.category === 'payment' ? 'bg-green-100 text-green-700' :
                         clause.category === 'environment' ? 'bg-teal-100 text-teal-700' :
                         'bg-slate-100 text-slate-600'
                       }`}>
                         {CATEGORIES.find(c => c.id === clause.category)?.label || '一般'}
                       </span>
                     )}

                     <div className="flex gap-2 ml-auto items-center">
                        {/* Sort Arrows */}
                        {!isEditing && (
                          <div className="flex gap-1 mr-2 bg-white rounded border border-slate-200">
                             <button 
                               onClick={(e) => moveClause(e, index, 'up')}
                               disabled={index === 0}
                               className="p-1 hover:bg-slate-100 disabled:text-slate-200 text-slate-500"
                             >
                               <ArrowUp size={14}/>
                             </button>
                             <button 
                               onClick={(e) => moveClause(e, index, 'down')}
                               disabled={index === data.clauses.length - 1}
                               className="p-1 hover:bg-slate-100 disabled:text-slate-200 text-slate-500"
                             >
                               <ArrowDown size={14}/>
                             </button>
                          </div>
                        )}

                        {isEditing ? (
                          <>
                            <button 
                              onClick={(e) => saveEditing(e, clause.id)}
                              className="flex items-center gap-1 px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                            >
                              <Check size={14} /> 儲存
                            </button>
                            <button 
                              onClick={(e) => cancelEditing(e)}
                              className="flex items-center gap-1 px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                            >
                              <X size={14} /> 取消
                            </button>
                          </>
                        ) : (
                          <>
                            <button 
                              onClick={(e) => startEditing(e, clause)}
                              className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-100 rounded transition-colors"
                              title="編輯條款"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              onClick={(e) => deleteClause(e, clause.id)}
                              className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                              title="刪除條款"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                     </div>
                  </div>

                  {isEditing ? (
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full border border-blue-300 rounded p-3 text-sm focus:ring-2 focus:ring-blue-200 outline-none min-h-[100px] bg-white text-slate-900 leading-relaxed"
                      autoFocus
                    />
                  ) : (
                    <p className={`text-sm leading-relaxed whitespace-pre-wrap ${clause.selected ? 'text-slate-800' : 'text-slate-400'}`}>
                      {clause.content}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
          
          {data.clauses.filter(c => activeCategory === 'all' || c.category === activeCategory).length === 0 && (
             <div className="text-center py-8 text-slate-400 italic">
               此分類尚無條款，請使用上方表單新增。
             </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto pb-20">
      {/* Wizard Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">建立新合約</h2>
          <p className="text-slate-500 text-sm">請依序完成下列步驟</p>
        </div>
        <div className="flex gap-2">
           {[1, 2, 3].map(i => (
             <div key={i} className={`w-3 h-3 rounded-full ${step === i ? 'bg-blue-600' : step > i ? 'bg-green-500' : 'bg-slate-200'}`} />
           ))}
        </div>
      </div>

      {/* Content */}
      <div className="mb-8">
        {step === 1 && renderStep1_BasicInfo()}
        {step === 2 && renderStep2_Items()}
        {step === 3 && renderStep3_Clauses()}
      </div>

      {/* Footer / Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-10">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <button 
            onClick={step === 1 ? onCancel : () => setStep(step - 1)}
            className="px-6 py-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 font-medium flex items-center gap-2"
          >
            {step === 1 ? '取消' : <><ArrowLeft size={18} /> 上一步</>}
          </button>
          
          <div className="flex gap-4">
             {step < 3 ? (
               <button 
                onClick={() => setStep(step + 1)}
                className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium flex items-center gap-2 shadow-lg shadow-blue-600/20"
              >
                下一步 <ArrowRight size={18} />
              </button>
             ) : (
               <button 
                onClick={() => onSave(data)}
                className="px-8 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 font-medium flex items-center gap-2 shadow-lg shadow-green-600/20"
              >
                <Save size={18} /> 完成並預覽
              </button>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractBuilder;