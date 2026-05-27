import { getStockDisplay } from '@/lib/stock';

type StockStatusProps = {
  quantity: number;
  className?: string;
};

export function StockStatus({ quantity, className = '' }: StockStatusProps) {
  const display = getStockDisplay(quantity);

  if (display.kind === 'out_of_stock') {
    return (
      <p className={`text-sm font-medium text-red-600 ${className}`.trim()}>Out of Stock</p>
    );
  }

  if (display.kind === 'low_stock') {
    return (
      <p className={`text-sm font-medium text-amber-700 ${className}`.trim()}>
        Only {display.quantity} left
      </p>
    );
  }

  return (
    <span
      className={`inline-flex w-fit rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 ${className}`.trim()}
    >
      In Stock
    </span>
  );
}
