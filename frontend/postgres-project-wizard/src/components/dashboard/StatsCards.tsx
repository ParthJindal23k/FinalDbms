import React from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, Package, TrendingUp, AlertTriangle, Globe, ShieldCheck, Clock } from 'lucide-react';

interface StatsCardsProps {
  stats: {
    totalTransactions: number;
    transactionValue: number;
    activeShipments: number;
    pendingCustoms: number;
  };
  userType?: 'user' | 'company';
}

const StatsCards: React.FC<StatsCardsProps> = ({ stats, userType = 'user' }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="stats-dashboard-wrapper">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Export Destinations */}
        <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all p-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-gray-500 mb-1">Export Destinations</p>
              <p className="text-2xl font-bold">24 Countries</p>
            </div>
            <div className="rounded-full p-3 bg-blue-100">
              <Globe className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">Access to global trade networks</p>
          <div className="mt-4 pt-3 border-t border-gray-100">
            <Link to="#" className="text-xs text-blue-600 hover:text-blue-800 font-medium">View all markets →</Link>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all p-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
              <p className="text-2xl font-bold">{formatCurrency(stats.transactionValue || 0)}</p>
            </div>
            <div className="rounded-full p-3 bg-green-100">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">Total transaction value to date</p>
          <div className="mt-4 pt-3 border-t border-gray-100">
            <Link to="#" className="text-xs text-blue-600 hover:text-blue-800 font-medium">Financial summary →</Link>
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all p-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-gray-500 mb-1">Pending Approvals</p>
              <p className="text-2xl font-bold">0</p>
            </div>
            <div className="rounded-full p-3 bg-purple-100">
              <Package className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">Shipments awaiting approval</p>
          <div className="mt-4 pt-3 border-t border-gray-100">
            <Link to="/track-shipments" className="text-xs text-blue-600 hover:text-blue-800 font-medium">Track shipments →</Link>
          </div>
        </div>

        {/* Compliance Status */}
        
      </div>
      
      
    </div>
  );
};

export default StatsCards;
