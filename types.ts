
export interface PartyInfo {
  companyName: string;
  taxId: string; // 統編
  representative: string; // 代表人
  phone: string;
  address: string;
}

export interface ContractItem {
  id: string;
  name: string; // e.g., 普通模板, 清水模
  unit: string; // e.g., m2, 坪
  price: number;
  quantity: number;
  note?: string;
}

export interface Clause {
  id: string;
  category: 'general' | 'payment' | 'safety' | 'environment' | 'custom';
  content: string;
  isCustom: boolean;
  selected: boolean;
}

export interface ContractData {
  id: string;
  title: string;
  createdAt: string;
  status: 'draft' | 'finalized';
  partyA: PartyInfo; // 甲 方 (發包)
  partyB: PartyInfo; // 乙 方 (承攬)
  items: ContractItem[];
  clauses: Clause[];
  totalAmount: number;
  projectLocation: string;
  startDate: string;
  endDate: string;
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  CREATE = 'CREATE',
  PREVIEW = 'PREVIEW',
  PRICE_HISTORY = 'PRICE_HISTORY',
  MY_COMPANIES = 'MY_COMPANIES',
  CONTRACTORS = 'CONTRACTORS',
}
