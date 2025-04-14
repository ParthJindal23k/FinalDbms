
import React from 'react';
import { 
  TrendingUp, 
  Package, 
  ShieldCheck, 
  AlertTriangle 
} from 'lucide-react';

interface StatsCardsProps {
  stats: {
    totalTransactions: number;
    transactionValue: number;
    activeShipments: number;
    pendingCustoms: number;
  };
  userType: 'user' | 'company';
}

const StatsCards: React.FC<StatsCardsProps> = ({ stats, userType }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="trade-stats-card">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              {userType === 'company' ? 'Total Transactions' : 'Your Transactions'}
            </p>
            <h3 className="text-2xl font-bold">{stats.totalTransactions}</h3>
          </div>
          <div className="p-2 bg-blue-100 rounded-full">
            <TrendingUp className="h-6 w-6 text-trade-blue" />
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">+12% from last month</p>
      </div>

      <div className="trade-stats-card">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Transaction Value
            </p>
            <h3 className="text-2xl font-bold">{formatCurrency(stats.transactionValue)}</h3>
          </div>
          <div className="p-2 bg-green-100 rounded-full">
            <TrendingUp className="h-6 w-6 text-green-600" />
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">+5% from last month</p>
      </div>

      <div className="trade-stats-card">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Active Shipments
            </p>
            <h3 className="text-2xl font-bold">{stats.activeShipments}</h3>
          </div>
          <div className="p-2 bg-purple-100 rounded-full">
            <Package className="h-6 w-6 text-purple-600" />
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">3 arriving soon</p>
      </div>

      <div className="trade-stats-card">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Pending Customs
            </p>
            <h3 className="text-2xl font-bold">{stats.pendingCustoms}</h3>
          </div>
          <div className="p-2 bg-amber-100 rounded-full">
            <AlertTriangle className="h-6 w-6 text-amber-600" />
          </div>
        </div>
        <p className="text-xs text-text-muted-foreground mt-2">Requires attention</p>
      </div>
    </div>
  );
};

export default StatsCards;
