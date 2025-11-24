import React, { useState, useEffect } from 'react';
import { AppView, ContractData, PartyInfo } from './types';
import { EMPTY_CONTRACT } from './constants';
import ContractBuilder from './components/ContractBuilder';
import PrintView from './components/PrintView';
import PriceHistory from './components/PriceHistory';
import PartyManager from './components/PartyManager';
import { FilePlus, FileText, Search, Clock, ChevronRight, TrendingUp, Users, Building2 } from 'lucide-react';

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

  // --- Views ---

  const renderDashboard = () => (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-slate-900 text-white p-6 shadow-lg">
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
                  className="group flex items-center justify-between p-4 border rounded-lg hover:border-blue-400 hover:shadow-md transition-all cursor-pointer bg-white"
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
                      <ChevronRight className="text-slate-300 group-hover:text-blue-500" />
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