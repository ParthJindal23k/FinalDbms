import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Filter,
  Map,
  User,
  Settings
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { useToast } from '../components/ui/use-toast';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import ShipmentStatusCard from '../components/dashboard/ShipmentStatusCard';
import TransactionsList from '../components/dashboard/TransactionsList';
import StatsCards from '../components/dashboard/StatsCards';
import { useQuery } from '@tanstack/react-query';
import { get } from '../lib/api';

const fetchUserStats = async () => {
  return get('/dashboard/user-stats');
};

const fetchUserShipments = async () => {
  return get('/dashboard/user-shipments');
};

const fetchUserTransactions = async () => {
  return get('/dashboard/user-transactions');
};

const fetchUserProfile = async () => {
  return get('/user/profile');
};

const UserDashboard = () => {
  const { toast } = useToast();
  const [userName, setUserName] = useState('User');
  
  // Fetch user profile
  const { data: profileData, error: profileError } = useQuery({
    queryKey: ['userProfile'],
    queryFn: fetchUserProfile,
  });

  // Fetch dashboard stats
  const { data: statsData, error: statsError, isLoading: statsLoading } = useQuery({
    queryKey: ['userStats'],
    queryFn: fetchUserStats,
  });

  // Fetch shipments
  const { data: shipments, error: shipmentsError, isLoading: shipmentsLoading } = useQuery({
    queryKey: ['userShipments'],
    queryFn: fetchUserShipments,
  });

  // Fetch transactions
  const { data: transactions, error: transactionsError, isLoading: transactionsLoading } = useQuery({
    queryKey: ['userTransactions'],
    queryFn: fetchUserTransactions,
  });

  useEffect(() => {
    if (profileData) {
      setUserName(profileData.email.split('@')[0] || 'User');
    }
    
    if (profileError) {
      toast({
        title: "Error loading profile",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    }

    if (statsError || shipmentsError || transactionsError) {
      toast({
        title: "Error loading dashboard data",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    }
  }, [profileData, profileError, statsError, shipmentsError, transactionsError, toast]);

  const stats = statsData || {
    totalTransactions: 0,
    transactionValue: 0,
    activeShipments: 0,
    pendingCustoms: 0
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation isAuthenticated={true} userType="user" />
      
      <main className="flex-1 bg-gray-50">
        <div className="trade-container py-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold mb-2">Welcome back, {userName}</h1>
              <p className="text-gray-600">Here's what's happening with your shipments today.</p>
            </div>
            <div className="flex mt-4 md:mt-0 space-x-2">
              <Button variant="outline" size="sm" className="flex items-center">
                <Filter className="mr-1 h-4 w-4" />
                Filter
              </Button>
              <Button size="sm" className="bg-trade-blue hover:bg-blue-700 flex items-center">
                <Plus className="mr-1 h-4 w-4" />
                New Shipment
              </Button>
            </div>
          </div>
          
          {/* Stats Cards */}
          {statsLoading ? (
            <div className="text-center py-4">Loading stats...</div>
          ) : (
            <StatsCards stats={stats} userType="user" />
          )}
          
          {/* Shipments Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Your Shipments</h2>
              <Link to="#">
                <Button variant="link" className="text-trade-blue">View All</Button>
              </Link>
            </div>
            {shipmentsLoading ? (
              <div className="text-center py-4">Loading shipments...</div>
            ) : shipments && shipments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {shipments.map((shipment) => (
                  <ShipmentStatusCard key={shipment.id} shipment={shipment} />
                ))}
              </div>
            ) : (
              <div className="text-center py-4 bg-white rounded-lg shadow-sm">
                <p className="text-gray-500">No shipments found</p>
              </div>
            )}
          </div>
          
          {/* Transactions Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {transactionsLoading ? (
                <div className="text-center py-4">Loading transactions...</div>
              ) : (
                <TransactionsList transactions={transactions || []} />
              )}
            </div>
            
            {/* Quick Links */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                <h3 className="font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start text-left">
                    <Map className="mr-2 h-4 w-4 text-trade-blue" />
                    Track a Shipment
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-left">
                    <Plus className="mr-2 h-4 w-4 text-green-600" />
                    Create New Transaction
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-left">
                    <User className="mr-2 h-4 w-4 text-purple-600" />
                    Update Profile
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-left">
                    <Settings className="mr-2 h-4 w-4 text-gray-600" />
                    Account Settings
                  </Button>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-trade-blue to-trade-teal text-white rounded-lg p-6">
                <h3 className="font-semibold mb-2">Need Help?</h3>
                <p className="text-sm mb-4 opacity-90">Our support team is here to assist you with any questions.</p>
                <Button className="bg-white text-trade-blue hover:bg-gray-100 w-full">
                  Contact Support
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default UserDashboard;
