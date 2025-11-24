
import React, { useState, useMemo } from 'react';
import { ContractData, PartyInfo, ContractItem } from '../types';
import { ArrowLeft, Search, TrendingUp, Building2, Calendar, FileText } from 'lucide-react';

interface Props {
  contracts: ContractData[];
  onBack: () => void;
}

interface PriceRecord {
  contractId: string;
  contractTitle: string;
  date: string;
  item: ContractItem;
}

interface ContractorHistory {
  info: PartyInfo;
  records: PriceRecord[];
}

const PriceHistory: React.FC<Props> = ({ contracts, onBack }) => {
  const [selectedContractor, setSelectedContractor] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const historyData = useMemo(() => {
    const data: Record<string, ContractorHistory> = {};

    contracts.forEach(contract => {
      const contractorName = contract.partyB.companyName;
      // Skip if no company name is recorded
      if (!contractorName) return;

      if (!data[contractorName]) {
        data[contractorName] = {
          info: contract.partyB,
          records: [],
        };
      }

      contract.items.forEach(item => {
        data[contractorName].records.push({
          contractId: contract.id,
          contractTitle: contract.title,
          date: contract.createdAt,
          item: item
        });
      });
    });

    // Sort records by date (newest first)
    Object.values(data).forEach(d => {
      d.records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    });

    return data;
  }, [contracts]);

  const filteredContractors = Object.keys(historyData).filter(name =>
    name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedData = selectedContractor ? historyData[selectedContractor] : null;

  return (
    <div className="min-h-screen bg-slate-50 pb-10">
       <header className="bg-white border-b sticky top-0 z-20 px-6 py-4 flex items-center gap-4 shadow-sm">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500 hover:text-slate-800">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp className="text-blue-600" />
              承攬商價格資料庫
            </h1>
            <p className="text-xs text-slate-500">管理各承攬商歷史報價紀錄</p>
          </div>
       </header>

       <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar List */}
          <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[calc(100vh-140px)] sticky top-[100px]">
             <div className="p-4 border-b bg-slate-50">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="搜尋公司名稱..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-200 outline-none"
                  />
                </div>
             </div>
             <div className="overflow-y-auto flex-1 p-2 space-y-1">
                {filteredContractors.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-sm">
                    {Object.keys(historyData).length === 0 ? "尚無合約資料" : "無符合搜尋結果"}
                  </div>
                ) : (
                  filteredContractors.map(name => (
                    <button
                      key={name}
                      onClick={() => setSelectedContractor(name)}
                      className={`w-full text-left p-3 rounded-lg transition-all border ${
                        selectedContractor === name 
                          ? 'bg-blue-50 border-blue-200 shadow-sm' 
                          : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-200'
                      }`}
                    >
                      <h3 className={`font-bold text-sm ${selectedContractor === name ? 'text-blue-700' : 'text-slate-700'}`}>{name}</h3>
                      <div className="flex justify-between items-center mt-2">
                         <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500">
                           {historyData[name].info.representative || '未知代表人'}
                         </span>
                         <span className="text-xs text-slate-400 font-medium">
                           {historyData[name].records.length} 筆紀錄
                         </span>
                      </div>
                    </button>
                  ))
                )}
             </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
             {selectedData ? (
               <div className="bg-white rounded-xl shadow-sm border border-slate-200 min-h-[calc(100vh-140px)] flex flex-col animate-fade-in">
                  {/* Contractor Header */}
                  <div className="p-6 border-b bg-slate-50/50 rounded-t-xl">
                    <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                       <div>
                          <h2 className="text-2xl font-bold text-slate-800 mb-2 flex items-center gap-2">
                            <Building2 className="text-slate-400" />
                            {selectedContractor}
                          </h2>
                          <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                             <span className="flex items-center gap-1 bg-white px-2 py-1 rounded border border-slate-200">
                               <span className="font-semibold text-slate-700">統編:</span> {selectedData.info.taxId || '-'}
                             </span>
                             <span className="flex items-center gap-1 bg-white px-2 py-1 rounded border border-slate-200">
                               <span className="font-semibold text-slate-700">負責人:</span> {selectedData.info.representative || '-'}
                             </span>
                             <span className="flex items-center gap-1 bg-white px-2 py-1 rounded border border-slate-200">
                               <span className="font-semibold text-slate-700">電話:</span> {selectedData.info.phone || '-'}
                             </span>
                          </div>
                       </div>
                       <div className="flex gap-4">
                          <div className="text-right px-4 py-2 bg-blue-50 rounded-lg border border-blue-100">
                             <div className="text-xs text-blue-600 font-medium uppercase tracking-wider">總項目數</div>
                             <div className="text-2xl font-bold text-blue-700">{selectedData.records.length}</div>
                          </div>
                       </div>
                    </div>
                  </div>

                  {/* Price Table */}
                  <div className="flex-1 overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider sticky top-0">
                        <tr>
                           <th className="p-4 border-b w-32">日期</th>
                           <th className="p-4 border-b">工程合約</th>
                           <th className="p-4 border-b">項目名稱</th>
                           <th className="p-4 border-b w-20 text-center">單位</th>
                           <th className="p-4 border-b w-32 text-right">單價</th>
                           <th className="p-4 border-b w-24 text-right">數量</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm">
                        {selectedData.records.map((record, idx) => (
                          <tr key={idx} className="hover:bg-blue-50/50 transition-colors group">
                            <td className="p-4 text-slate-500 whitespace-nowrap flex items-center gap-2">
                              <Calendar size={14} className="text-slate-300 group-hover:text-blue-400" />
                              {new Date(record.date).toLocaleDateString()}
                            </td>
                            <td className="p-4 text-slate-600 font-medium max-w-xs truncate" title={record.contractTitle}>
                               <span className="flex items-center gap-2">
                                 <FileText size={14} className="text-slate-300" />
                                 {record.contractTitle}
                               </span>
                            </td>
                            <td className="p-4 text-slate-800 font-medium">
                              {record.item.name}
                            </td>
                            <td className="p-4 text-slate-500 text-center bg-slate-50/50">
                              {record.item.unit}
                            </td>
                            <td className="p-4 text-right font-bold text-slate-700">
                              ${record.item.price.toLocaleString()}
                            </td>
                            <td className="p-4 text-right text-slate-500 font-mono">
                              {record.item.quantity}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
               </div>
             ) : (
               <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-full flex flex-col items-center justify-center text-slate-400 p-8 min-h-[400px]">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                    <TrendingUp size={40} className="text-slate-300" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-600 mb-2">請選擇承攬商</h3>
                  <p className="text-slate-400 text-center max-w-xs">點擊左側列表中的承攬商，即可查看其歷史報價與施工項目明細。</p>
               </div>
             )}
          </div>
       </div>
    </div>
  );
};

export default PriceHistory;
