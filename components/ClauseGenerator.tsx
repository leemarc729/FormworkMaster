import React, { useState } from 'react';
import { generateClause } from '../services/geminiService';
import { Sparkles, Loader2, PlusCircle } from 'lucide-react';

interface Props {
  onAddClause: (text: string) => void;
}

const ClauseGenerator: React.FC<Props> = ({ onAddClause }) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError('');
    setResult('');
    
    try {
      const text = await generateClause(prompt);
      setResult(text);
    } catch (err) {
      setError('AI 服務暫時無法使用，請檢查 API Key 或稍後再試。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-xl border border-indigo-100 mb-6">
      <div className="flex items-center gap-2 mb-3 text-indigo-800 font-semibold">
        <Sparkles className="w-5 h-5" />
        <h3>AI 智慧條款助理</h3>
      </div>
      <p className="text-sm text-indigo-600 mb-4">
        描述您遇到的特殊狀況（例如：颱風天停工標準、特殊材料計價方式），AI 將為您撰寫專業合約條款。
      </p>
      
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="例如：若遇到連續降雨超過三天，工期應如何計算..."
          className="flex-1 border border-indigo-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-300 outline-none"
          onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
        />
        <button
          onClick={handleGenerate}
          disabled={loading || !prompt}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : '生成條款'}
        </button>
      </div>

      {error && <div className="text-red-500 text-sm mb-2">{error}</div>}

      {result && (
        <div className="bg-white p-4 rounded-lg border border-indigo-100 shadow-sm animate-fade-in">
          <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">AI 建議內容</h4>
          <p className="text-gray-800 mb-4 leading-relaxed">{result}</p>
          <button
            onClick={() => {
              onAddClause(result);
              setResult('');
              setPrompt('');
            }}
            className="text-sm bg-green-600 text-white px-3 py-1.5 rounded-md hover:bg-green-700 flex items-center gap-2 w-fit ml-auto"
          >
            <PlusCircle className="w-4 h-4" />
            加入合約
          </button>
        </div>
      )}
    </div>
  );
};

export default ClauseGenerator;