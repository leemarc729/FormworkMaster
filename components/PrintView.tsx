import React, { useRef } from 'react';
import { ContractData } from '../types';
import { Printer, ArrowLeft, Download, FileCheck, Home } from 'lucide-react';

interface Props {
  data: ContractData;
  onBack: () => void;
  onHome: () => void;
}

const PrintView: React.FC<Props> = ({ data, onBack, onHome }) => {
  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' });

  // Helper to get consistent category labels
  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'general': return '一般條款';
      case 'payment': return '付款條件';
      case 'safety': return '安全衛生';
      case 'environment': return '環保清潔';
      case 'custom': return '特殊條款';
      default: return '其他條款';
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 pb-10">
      {/* Toolbar - Hidden in Print */}
      <div className="no-print sticky top-0 bg-white shadow-md z-50 p-4 mb-8">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={onHome} className="text-slate-600 hover:text-blue-600 flex items-center gap-2 font-medium transition-colors">
              <Home size={20} /> 回首頁
            </button>
            <div className="h-5 w-px bg-slate-300"></div>
            <button onClick={onBack} className="text-slate-600 hover:text-slate-900 flex items-center gap-2 font-medium">
              <ArrowLeft size={20} /> 返回編輯
            </button>
          </div>
          
          <div className="flex gap-3">
             <div className="hidden md:flex items-center text-amber-600 text-sm bg-amber-50 px-3 py-1 rounded-full border border-amber-200 mr-4">
               <FileCheck size={16} className="mr-2"/> 請確認內容正確後再列印
             </div>
             <button 
              onClick={handlePrint}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 shadow-md flex items-center gap-2 font-bold"
            >
              <Printer size={20} /> 列印 / 另存 PDF
            </button>
          </div>
        </div>
      </div>

      {/* Contract Paper */}
      <div 
        ref={componentRef}
        className="max-w-[21cm] mx-auto bg-white shadow-2xl px-[2cm] pb-[2cm] pt-[1cm] min-h-[29.7cm] print:shadow-none print:m-0 print:w-full print:max-w-none"
      >
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-black border-b-4 border-black inline-block pb-2 px-8 mb-4">工程承攬合約書</h1>
          <p className="text-lg text-gray-600">合約編號：{data.id.slice(0, 8).toUpperCase()}</p>
        </div>

        {/* 1. Basic Info */}
        <section className="mb-10">
          <div className="grid grid-cols-[100px_1fr] gap-y-3 mb-6">
             <div className="font-bold">工程名稱：</div>
             <div className="border-b border-gray-300 pb-1">{data.title}</div>
             
             <div className="font-bold">工程地點：</div>
             <div className="border-b border-gray-300 pb-1">{data.projectLocation}</div>
             
             <div className="font-bold">合約期間：</div>
             <div className="border-b border-gray-300 pb-1">
                自 {data.startDate} 起 至 {data.endDate} 止
             </div>
          </div>

          <div className="flex justify-between gap-10 mt-8">
            <div className="flex-1 border p-4">
               <h3 className="font-bold text-lg mb-4 text-center bg-gray-100 py-1">甲方 (定作人)</h3>
               <div className="space-y-2 text-sm">
                 <p><span className="font-bold">公司名稱：</span>{data.partyA.companyName}</p>
                 <p><span className="font-bold">統一編號：</span>{data.partyA.taxId}</p>
                 <p><span className="font-bold">代 表 人：</span>{data.partyA.representative}</p>
                 <p><span className="font-bold">地    址：</span>{data.partyA.address}</p>
                 <p><span className="font-bold">電    話：</span>{data.partyA.phone}</p>
               </div>
            </div>
            <div className="flex-1 border p-4">
               <h3 className="font-bold text-lg mb-4 text-center bg-gray-100 py-1">乙方 (承攬人)</h3>
               <div className="space-y-2 text-sm">
                 <p><span className="font-bold">公司名稱：</span>{data.partyB.companyName}</p>
                 <p><span className="font-bold">統一編號：</span>{data.partyB.taxId}</p>
                 <p><span className="font-bold">代 表 人：</span>{data.partyB.representative}</p>
                 <p><span className="font-bold">地    址：</span>{data.partyB.address}</p>
                 <p><span className="font-bold">電    話：</span>{data.partyB.phone}</p>
               </div>
            </div>
          </div>
        </section>

        {/* 2. Items */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4 border-l-4 border-black pl-3">一、承攬項目與費用</h2>
          <table className="w-full border-collapse border border-gray-400 text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-400 p-2 text-left">項次</th>
                <th className="border border-gray-400 p-2 text-left">項目名稱</th>
                <th className="border border-gray-400 p-2 text-center">單位</th>
                <th className="border border-gray-400 p-2 text-right">數量</th>
                <th className="border border-gray-400 p-2 text-right">單價</th>
                <th className="border border-gray-400 p-2 text-right">複價 (NTD)</th>
                <th className="border border-gray-400 p-2 text-left">備註</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, index) => (
                <tr key={index}>
                  <td className="border border-gray-400 p-2 text-center">{index + 1}</td>
                  <td className="border border-gray-400 p-2">{item.name}</td>
                  <td className="border border-gray-400 p-2 text-center">{item.unit}</td>
                  <td className="border border-gray-400 p-2 text-right">{item.quantity}</td>
                  <td className="border border-gray-400 p-2 text-right">{item.price.toLocaleString()}</td>
                  <td className="border border-gray-400 p-2 text-right">{(item.quantity * item.price).toLocaleString()}</td>
                  <td className="border border-gray-400 p-2 text-gray-600 text-xs">{item.note}</td>
                </tr>
              ))}
              <tr className="bg-gray-50 font-bold">
                 <td colSpan={5} className="border border-gray-400 p-2 text-right">總計 (未稅)</td>
                 <td className="border border-gray-400 p-2 text-right">{data.totalAmount.toLocaleString()}</td>
                 <td className="border border-gray-400 p-2"></td>
              </tr>
               <tr className="bg-gray-50 font-bold">
                 <td colSpan={5} className="border border-gray-400 p-2 text-right">營業稅 (5%)</td>
                 <td className="border border-gray-400 p-2 text-right">{Math.round(data.totalAmount * 0.05).toLocaleString()}</td>
                 <td className="border border-gray-400 p-2"></td>
              </tr>
               <tr className="bg-gray-100 font-bold text-lg">
                 <td colSpan={5} className="border border-gray-400 p-2 text-right">合約總價 (含稅)</td>
                 <td className="border border-gray-400 p-2 text-right">{Math.round(data.totalAmount * 1.05).toLocaleString()}</td>
                 <td className="border border-gray-400 p-2"></td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* 3. Clauses */}
        <section className="mb-12 page-break-inside-avoid">
           <h2 className="text-xl font-bold mb-4 border-l-4 border-black pl-3">二、合約條款</h2>
           <ol className="list-decimal pl-6 space-y-3 text-left leading-relaxed">
             {data.clauses.filter(c => c.selected).map((clause) => (
               <li key={clause.id} className="whitespace-pre-wrap break-words">
                 <span className="font-bold text-gray-900">
                    【{getCategoryLabel(clause.category)}】
                 </span>
                 {clause.content}
               </li>
             ))}
           </ol>
        </section>

        {/* Signatures */}
        <section className="mt-20 page-break-inside-avoid">
          <div className="grid grid-cols-2 gap-20">
            <div>
              <p className="font-bold text-lg mb-8">立合約書人 (甲方)：</p>
              <div className="h-24 border-b border-gray-400 relative">
                <span className="absolute bottom-1 text-gray-400 text-sm">公司大小章 / 負責人簽章</span>
              </div>
            </div>
            <div>
              <p className="font-bold text-lg mb-8">立合約書人 (乙方)：</p>
              <div className="h-24 border-b border-gray-400 relative">
                <span className="absolute bottom-1 text-gray-400 text-sm">公司大小章 / 負責人簽章</span>
              </div>
            </div>
          </div>
          <div className="text-center mt-12 text-sm text-gray-500">
            {currentDate}
          </div>
        </section>
      </div>
    </div>
  );
};

export default PrintView;