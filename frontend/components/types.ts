export interface Position {
  symbol: string;
  name: string;
  category: string;
  shares: number;
  avg_price: number;
  current_price: number;
  unrealized_pnl: number;
}

export const formatYen = (amount: number) => {
  return new Intl.NumberFormat("ja-JP", { style: "currency", currency: "JPY" }).format(amount);
};
