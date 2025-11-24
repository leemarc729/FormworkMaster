import { Clause, ContractItem } from './types';
import { v4 as uuidv4 } from 'uuid';

export const DEFAULT_ITEMS: Partial<ContractItem>[] = [
  { name: '普通模板 (Regular Formwork)', unit: 'm²', price: 450 },
  { name: '清水模板 (Architectural Concrete)', unit: 'm²', price: 850 },
  { name: '系統模板 (System Formwork)', unit: 'm²', price: 600 },
  { name: '單面模 (Single-sided)', unit: 'm²', price: 1200 },
  { name: '免拆模板 (Non-removable)', unit: 'm²', price: 1500 },
  { name: '樓梯 (Stairs)', unit: '式', price: 5000 },
  { name: '零星工料 (Misc. Labor/Material)', unit: '工', price: 3000 },
];

export const PRESET_CLAUSES: Clause[] = [
  {
    id: 'c1',
    category: 'general',
    content: '乙方應依甲方提供之施工圖說及工程進度表施工，不得無故延誤。',
    isCustom: false,
    selected: true,
  },
  {
    id: 'c2',
    category: 'general',
    content: '施工期間若發生設計變更，雙方應另行議定單價及工期。',
    isCustom: false,
    selected: true,
  },
  {
    id: 'c3',
    category: 'payment',
    content: '付款方式：每月依實作數量計價一次，保留款為計價金額之 10%，於工程驗收合格後無息退還。',
    isCustom: false,
    selected: true,
  },
  {
    id: 'c4',
    category: 'payment',
    content: '訂金：合約簽訂後支付總價 30% 作為訂金。',
    isCustom: false,
    selected: false,
  },
  {
    id: 'c5',
    category: 'safety',
    content: '乙方應嚴格遵守勞工安全衛生法規，施工人員須配戴安全帽及相關防護具。',
    isCustom: false,
    selected: true,
  },
  {
    id: 'c6',
    category: 'safety',
    content: '工地現場禁止飲酒、賭博及其他違法行為，違者甲方得依規定罰款或驅離。',
    isCustom: false,
    selected: true,
  },
  {
    id: 'c7',
    category: 'environment',
    content: '乙方應負責施工範圍內之廢棄物清理及運棄。',
    isCustom: false,
    selected: true,
  },
  {
    id: 'c8',
    category: 'custom',
    content: '雨天或其他不可抗力因素導致無法施工時，工期得順延之。',
    isCustom: false,
    selected: false,
  }
];

export const EMPTY_CONTRACT = (): any => ({
  id: uuidv4(),
  title: '新建工程模板合約',
  createdAt: new Date().toISOString(),
  status: 'draft',
  partyA: { companyName: '', taxId: '', representative: '', phone: '', address: '' },
  partyB: { companyName: '', taxId: '', representative: '', phone: '', address: '' },
  items: [],
  clauses: JSON.parse(JSON.stringify(PRESET_CLAUSES)),
  totalAmount: 0,
  projectLocation: '',
  startDate: '',
  endDate: '',
});
