import React from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, Package, TrendingUp, AlertTriangle } from 'lucide-react';

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Transactions Count */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Transactions</p>
              <p className="text-2xl font-bold">{stats.totalTransactions}</p>
            </div>
            <div className="rounded-full p-3 bg-blue-100">
              <CreditCard className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Transaction Value */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Transaction Value</p>
              <p className="text-2xl font-bold">{formatCurrency(stats.transactionValue)}</p>
            </div>
            <div className="rounded-full p-3 bg-green-100">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Active Shipments */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Active Shipments</p>
              <p className="text-2xl font-bold">{stats.activeShipments}</p>
            </div>
            <div className="rounded-full p-3 bg-purple-100">
              <Package className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Pending Customs */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Pending Customs</p>
              <p className="text-2xl font-bold">{stats.pendingCustoms}</p>
            </div>
            <div className="rounded-full p-3 bg-amber-100">
              <AlertTriangle className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <Link to="/new-shipment">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
            + New Shipment
          </button>
        </Link>

        {/* You can add the rest of your dashboard content here, like recent shipments or stats */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Welcome to Your Dashboard</h2>
          <p className="text-gray-700">
            Here you can view your shipment history, track orders, and manage your logistics.
          </p>
          {/* Add shipment list or other dashboard features here */}
        </div>
      </div>
    </div>
  );
};

export default StatsCards;
