import React, { useState, useEffect } from 'react';
import { AppView, ContractData, PartyInfo } from './types';
import { EMPTY_CONTRACT } from './constants';
import ContractBuilder from './components/ContractBuilder';
import PrintView from './components/PrintView';
import PriceHistory from './components/PriceHistory';
import PartyManager from './components/PartyManager';
import { FilePlus, FileText, Search, Clock, ChevronRight, TrendingUp, Users, Building2, Download, Trash2 } from 'lucide-react';

// Helper for CSV export
const exportToCsv = (filename: string, rows: object[]) => {
  if (!rows || !rows.length) {
    alert("無資料可匯出");
    return;
  }
  
  // Get headers
  const headers = Object.keys(rows[0]);
  
  // Construct CSV content with BOM for Excel Chinese support
  const csvContent = 
    "\uFEFF" + 
    [
      headers.join(','), 
      ...rows.map(row => headers.map(header => {
        const val = (row as any)[header];
        const stringVal = val === null || val === undefined ? '' : String(val);
        // Escape quotes and wrap in quotes
        return `"${stringVal.replace(/"/g, '""')}"`;
      }).join(','))
    ].join('\r\n');

  // Create download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Helper for clause label mapping
const getClauseCategoryLabel = (category: string) => {
  switch (category) {
    case 'general': return '一般條款';
    case 'payment': return '付款條件';
    case 'safety': return '安全衛生';
    case 'environment': return '環保清潔';
    case 'custom': return '特殊條款';
    default: return '其他條款';
  }
};

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.DASHBOARD);
  const [contracts, setContracts] = useState<ContractData[]>([]);
  const [currentContract, setCurrentContract] = useState<ContractData | null>(null);
  
  // Separate Lists State
  const [myCompanies, setMyCompanies] = useState<PartyInfo[]>([]);
  const [contractors, setContractors] = useState<PartyInfo[]>([]);

  // Load from local storage on mount
  useEffect(() => {
    const savedContracts = localStorage.getItem('formwork_contracts');
    if (savedContracts) setContracts(JSON.parse(savedContracts));
    
    const savedMyCompanies = localStorage.getItem('formwork_my_companies');
    if (savedMyCompanies) setMyCompanies(JSON.parse(savedMyCompanies));

    const savedContractors = localStorage.getItem('formwork_contractors');
    if (savedContractors) setContractors(JSON.parse(savedContractors));
  }, []);

  // Save Contracts
  const saveContractsToStorage = (updatedContracts: ContractData[]) => {
    localStorage.setItem('formwork_contracts', JSON.stringify(updatedContracts));
    setContracts(updatedContracts);
  };

  // Save My Companies (Party A)
  const saveMyCompaniesToStorage = (updatedParties: PartyInfo[]) => {
    localStorage.setItem('formwork_my_companies', JSON.stringify(updatedParties));
    setMyCompanies(updatedParties);
  };

  // Save Contractors (Party B)
  const saveContractorsToStorage = (updatedParties: PartyInfo[]) => {
    localStorage.setItem('formwork_contractors', JSON.stringify(updatedParties));
    setContractors(updatedParties);
  };
  
  // Helper to add/update party in a specific list
  const handleAddParty = (party: PartyInfo, type: 'my_company' | 'contractor') => {
    const list = type === 'my_company' ? myCompanies : contractors;
    const saveFn = type === 'my_company' ? saveMyCompaniesToStorage : saveContractorsToStorage;

    // Check if duplicate name exists, if so update it, else add new
    const idx = list.findIndex(p => p.companyName === party.companyName);
    let newList;
    if (idx >= 0) {
      newList = [...list];
      newList[idx] = party;
    } else {
      newList = [...list, party];
    }
    saveFn(newList);
  };

  const handleStartNew = () => {
    setCurrentContract(EMPTY_CONTRACT());
    setView(AppView.CREATE);
  };

  const handleEdit = (contract: ContractData) => {
    setCurrentContract(contract);
    setView(AppView.CREATE);
  };

  const handleDeleteContract = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    // First confirmation
    if (window.confirm('確定要刪除這份合約嗎？此動作無法復原。')) {
      // Second confirmation (Double check)
      if (window.confirm('⚠️ 嚴重警告：\n\n您確定真的要刪除嗎？\n刪除後資料將永遠消失，無法找回！')) {
        const newContracts = contracts.filter(c => c.id !== id);
        saveContractsToStorage(newContracts);
        // If the deleted contract was the current one (though unlikely in dashboard view), clear it
        if (currentContract?.id === id) {
          setCurrentContract(null);
        }
      }
    }
  };

  const handleSaveContract = (data: ContractData) => {
    data.status = 'finalized'; // In a real app this might be a separate step
    const existingIndex = contracts.findIndex(c => c.id === data.id);
    let newContracts;
    
    if (existingIndex >= 0) {
      newContracts = [...contracts];
      newContracts[existingIndex] = data;
    } else {
      newContracts = [data, ...contracts];
    }
    
    saveContractsToStorage(newContracts);
    setCurrentContract(data);
    setView(AppView.PREVIEW);
  };

  // --- Export Handlers ---
  const handleExportContracts = () => {
    const data = contracts.map(c => {
      // Calculate financials
      const subTotal = c.totalAmount;
      const tax = Math.round(subTotal * 0.05);
      const grandTotal = Math.round(subTotal * 1.05);

      // Serialize items to a readable string block
      const itemsDetail = c.items.map((i, idx) => 
        `${idx + 1}. ${i.name} (${i.unit})：數量 ${i.quantity} x 單價 $${i.price} = $${i.quantity * i.price}${i.note ? ` [備註: ${i.note}]` : ''}`
      ).join('\n');

      // Serialize clauses to a readable string block
      const clausesDetail = c.clauses
        .filter(cl => cl.selected)
        .map((cl, idx) => `${idx + 1}. 【${getClauseCategoryLabel(cl.category)}】${cl.content}`)
        .join('\n');

      return {
        '合約編號': c.id,
        '標題': c.title,
        '狀態': c.status === 'draft' ? '草稿' : '已定案',
        '建立日期': new Date(c.createdAt).toLocaleDateString(),
        
        // Project Info
        '工程地點': c.projectLocation,
        '預計開工日': c.startDate,
        '預計完工日': c.endDate,

        // Party A
        '甲方-公司名稱': c.partyA.companyName,
        '甲方-統一編號': c.partyA.taxId,
        '甲方-代表人': c.partyA.representative,
        '甲方-電話': c.partyA.phone,
        '甲方-地址': c.partyA.address,

        // Party B
        '乙方-公司名稱': c.partyB.companyName,
        '乙方-統一編號': c.partyB.taxId,
        '乙方-代表人': c.partyB.representative,
        '乙方-電話': c.partyB.phone,
        '乙方-地址': c.partyB.address,

        // Financials
        '未稅金額': subTotal,
        '營業稅(5%)': tax,
        '含稅總額': grandTotal,

        // Detailed Content
        '施工項目明細': itemsDetail,
        '合約條款內容': clausesDetail
      };
    });
    exportToCsv(`contracts_full_backup_${new Date().toISOString().slice(0,10)}.csv`, data);
  };

  const handleExportParties = (type: 'my_company' | 'contractor') => {
    const list = type === 'my_company' ? myCompanies : contractors;
    const filename = type === 'my_company' ? 'my_companies_backup.csv' : 'contractors_backup.csv';
    const data = list.map(p => ({
      '公司名稱': p.companyName,
      '統一編號': p.taxId,
      '負責人': p.representative,
      '電話': p.phone,
      '地址': p.address
    }));
    exportToCsv(filename, data);
  };

  // --- Views ---

  const renderDashboard = () => (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-slate-900 text-white p-6 shadow-lg relative z-20">
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
               <FileText className="text-yellow-400" />
               FormworkMaster 模板合約系統
            </h1>
            <p className="text-slate-400 text-sm mt-1">專業、快速、智慧化的合約製作工具</p>
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            <button 
              onClick={() => setView(AppView.MY_COMPANIES)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-3 rounded-lg font-medium border border-slate-700 flex items-center gap-2 transition-all text-sm"
            >
              <Building2 size={16} /> 我方公司
            </button>
            <button 
              onClick={() => setView(AppView.CONTRACTORS)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-3 rounded-lg font-medium border border-slate-700 flex items-center gap-2 transition-all text-sm"
            >
              <Users size={16} /> 承攬廠商
            </button>
            <button 
              onClick={() => setView(AppView.PRICE_HISTORY)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-3 rounded-lg font-medium border border-slate-700 flex items-center gap-2 transition-all text-sm"
            >
              <TrendingUp size={16} /> 價格管理
            </button>

            {/* Export Dropdown */}
            <div className="relative group">
              <button className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-3 rounded-lg font-medium border border-slate-700 flex items-center gap-2 transition-all text-sm">
                <Download size={16} /> 匯出資料
              </button>
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-slate-200 hidden group-hover:block overflow-hidden z-50">
                <button 
                  onClick={handleExportContracts}
                  className="w-full text-left px-4 py-3 hover:bg-slate-50 text-slate-700 text-sm border-b border-slate-100 flex items-center gap-2"
                >
                  <FileText size={14} className="text-blue-500"/> 匯出完整合約明細 (.csv)
                </button>
                <button 
                  onClick={() => handleExportParties('my_company')}
                  className="w-full text-left px-4 py-3 hover:bg-slate-50 text-slate-700 text-sm border-b border-slate-100 flex items-center gap-2"
                >
                  <Building2 size={14} className="text-blue-500"/> 匯出我方公司 (.csv)
                </button>
                <button 
                  onClick={() => handleExportParties('contractor')}
                  className="w-full text-left px-4 py-3 hover:bg-slate-50 text-slate-700 text-sm flex items-center gap-2"
                >
                  <Users size={14} className="text-green-500"/> 匯出廠商資料 (.csv)
                </button>
              </div>
            </div>

            <button 
              onClick={handleStartNew}
              className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-3 rounded-lg font-bold shadow-lg shadow-blue-900/50 flex items-center gap-2 transition-all transform hover:-translate-y-1 ml-2"
            >
              <FilePlus size={18} /> 新增合約
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 min-h-[500px]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-800">歷史合約</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="搜尋合約..." 
                className="pl-9 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-200 outline-none w-64"
              />
            </div>
          </div>

          {contracts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
              <div className="bg-slate-100 p-4 rounded-full mb-4">
                <FileText size={48} className="text-slate-300" />
              </div>
              <p className="text-lg">尚無合約記錄</p>
              <button onClick={handleStartNew} className="text-blue-600 hover:underline mt-2">
                立即建立第一份合約
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {contracts.map(contract => (
                <div 
                  key={contract.id}
                  onClick={() => handleEdit(contract)}
                  className="group flex items-center justify-between p-4 border rounded-lg hover:border-blue-400 hover:shadow-md transition-all cursor-pointer bg-white relative"
                >
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-bold text-lg">
                        {contract.title.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                          {contract.title}
                        </h3>
                        <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                          <span className="bg-slate-100 px-2 py-0.5 rounded text-xs">
                             {contract.partyA.companyName || '未填寫甲方'}
                          </span>
                          <span>→</span>
                          <span className="bg-slate-100 px-2 py-0.5 rounded text-xs">
                             {contract.partyB.companyName || '未填寫乙方'}
                          </span>
                        </p>
                      </div>
                   </div>
                   
                   <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="font-bold text-slate-700">${contract.totalAmount.toLocaleString()}</p>
                        <p className="text-xs text-slate-400 flex items-center gap-1 justify-end">
                           <Clock size={12} /> {new Date(contract.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                          <button 
                            onClick={(e) => handleDeleteContract(e, contract.id)}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors z-10"
                            title="刪除合約"
                          >
                            <Trash2 size={18} />
                          </button>
                          <ChevronRight className="text-slate-300 group-hover:text-blue-500" />
                      </div>
                   </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );

  return (
    <>
      {view === AppView.DASHBOARD && renderDashboard()}
      {view === AppView.CREATE && currentContract && (
        <div className="min-h-screen bg-slate-50 pt-6">
          <ContractBuilder 
            initialData={currentContract} 
            onSave={handleSaveContract}
            onCancel={() => setView(AppView.DASHBOARD)}
            myCompanies={myCompanies}
            contractors={contractors}
            onSaveMyCompany={(p) => handleAddParty(p, 'my_company')}
            onSaveContractor={(p) => handleAddParty(p, 'contractor')}
          />
        </div>
      )}
      {view === AppView.PREVIEW && currentContract && (
        <PrintView 
          data={currentContract} 
          onBack={() => setView(AppView.CREATE)} 
          onHome={() => setView(AppView.DASHBOARD)}
        />
      )}
      {view === AppView.PRICE_HISTORY && (
        <PriceHistory 
          contracts={contracts} 
          onBack={() => setView(AppView.DASHBOARD)} 
        />
      )}
      {view === AppView.MY_COMPANIES && (
        <PartyManager 
          title="我方公司管理 (甲方)"
          colorTheme="blue"
          parties={myCompanies}
          onUpdate={saveMyCompaniesToStorage}
          onBack={() => setView(AppView.DASHBOARD)}
        />
      )}
      {view === AppView.CONTRACTORS && (
        <PartyManager 
          title="承攬商資料管理 (乙方)"
          colorTheme="green"
          parties={contractors}
          onUpdate={saveContractorsToStorage}
          onBack={() => setView(AppView.DASHBOARD)}
        />
      )}
    </>
  );
};

export default App;