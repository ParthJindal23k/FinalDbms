import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Download,
  Upload,
  Users,
  FileText,
  Activity,
  ChevronDown
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { useToast } from '../components/ui/use-toast';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import ShipmentStatusCard from '../components/dashboard/ShipmentStatusCard';
import TransactionsList from '../components/dashboard/TransactionsList';
import ProductsList from '../components/dashboard/ProductsList';
import StatsCards from '../components/dashboard/StatsCards';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { get, del, put, post } from '../lib/api';

const fetchCompanyProfile = async () => {
  return get('/user/profile');
};

const fetchCompanyStats = async () => {
  return get('/dashboard/company-stats');
};

const fetchCompanyShipments = async () => {
  return get('/dashboard/company-shipments');
};

const fetchCompanyTransactions = async () => {
  return get('/dashboard/company-transactions');
};

const fetchCompanyProducts = async () => {
  return get('/dashboard/company-products');
};

const CompanyDashboard = () => {
  const { toast } = useToast();
  const [companyName, setCompanyName] = useState('Company');
  const [currentTab, setCurrentTab] = useState('overview');
  
  // Fetch company profile
  const { data: profileData, error: profileError } = useQuery({
    queryKey: ['companyProfile'],
    queryFn: fetchCompanyProfile,
  });

  // Fetch dashboard stats
  const { data: statsData, error: statsError, isLoading: statsLoading } = useQuery({
    queryKey: ['companyStats'],
    queryFn: fetchCompanyStats,
  });

  // Fetch shipments
  const { data: shipments, error: shipmentsError, isLoading: shipmentsLoading } = useQuery({
    queryKey: ['companyShipments'],
    queryFn: fetchCompanyShipments,
  });

  // Fetch transactions
  const { data: transactions, error: transactionsError, isLoading: transactionsLoading } = useQuery({
    queryKey: ['companyTransactions'],
    queryFn: fetchCompanyTransactions,
  });

  // Fetch products
  const { data: products, error: productsError, isLoading: productsLoading } = useQuery({
    queryKey: ['companyProducts'],
    queryFn: fetchCompanyProducts,
  });

  useEffect(() => {
    if (profileData) {
      setCompanyName(profileData.name || 'Company');
    }
    
    if (profileError) {
      toast({
        title: "Error loading company profile",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    }

    if (statsError || shipmentsError || transactionsError || productsError) {
      toast({
        title: "Error loading dashboard data",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    }
  }, [profileData, profileError, statsError, shipmentsError, transactionsError, productsError, toast]);

  const handleEditProduct = (product: any) => {
    console.log('Edit product:', product);
    // Would implement edit functionality here
  };
  
  const handleDeleteProduct = (productId: string) => {
    console.log('Delete product:', productId);
    // Would implement delete functionality here
  };

  const stats = statsData || {
    totalTransactions: 0,
    transactionValue: 0,
    activeShipments: 0,
    pendingCustoms: 0
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation isAuthenticated={true} userType="company" />
      
      <main className="flex-1 bg-gray-50">
        <div className="trade-container py-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold mb-2">{companyName}</h1>
              <p className="text-gray-600">Company Dashboard</p>
            </div>
            <div className="flex mt-4 md:mt-0 space-x-2">
              <Button variant="outline" size="sm" className="flex items-center">
                <Download className="mr-1 h-4 w-4" />
                Export Data
              </Button>
              <Button size="sm" className="bg-trade-blue hover:bg-blue-700 flex items-center">
                <Plus className="mr-1 h-4 w-4" />
                New Product
              </Button>
            </div>
          </div>
          
          {/* Stats Cards */}
          {statsLoading ? (
            <div className="text-center py-4">Loading stats...</div>
          ) : (
            <StatsCards stats={stats} userType="company" />
          )}
          
          {/* Tabs Navigation */}
          <Tabs defaultValue="overview" onValueChange={setCurrentTab} className="mb-8">
            <TabsList className="grid grid-cols-4 mb-8">
              <TabsTrigger value="overview" className="flex items-center">
                <Activity className="mr-1 h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="products" className="flex items-center">
                <Upload className="mr-1 h-4 w-4" />
                Products
              </TabsTrigger>
              <TabsTrigger value="shipments" className="flex items-center">
                <FileText className="mr-1 h-4 w-4" />
                Shipments
              </TabsTrigger>
              <TabsTrigger value="customers" className="flex items-center">
                <Users className="mr-1 h-4 w-4" />
                Customers
              </TabsTrigger>
            </TabsList>
            
            {/* Overview Tab Content */}
            <TabsContent value="overview">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold">Recent Shipments</h2>
                      <Button variant="link" className="text-trade-blue">View All</Button>
                    </div>
                    {shipmentsLoading ? (
                      <div className="text-center py-4">Loading shipments...</div>
                    ) : shipments && shipments.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  
                  {transactionsLoading ? (
                    <div className="text-center py-4">Loading transactions...</div>
                  ) : (
                    <TransactionsList transactions={transactions || []} />
                  )}
                </div>
                
                <div className="space-y-6">
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                    <h3 className="font-semibold mb-4">Product Categories</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm">
                          <span>Electronics</span>
                          <span className="font-medium">45%</span>
                        </div>
                        <div className="w-full bg-gray-200 h-2 rounded-full mt-1">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm">
                          <span>Food & Beverage</span>
                          <span className="font-medium">30%</span>
                        </div>
                        <div className="w-full bg-gray-200 h-2 rounded-full mt-1">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: '30%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm">
                          <span>Textiles</span>
                          <span className="font-medium">15%</span>
                        </div>
                        <div className="w-full bg-gray-200 h-2 rounded-full mt-1">
                          <div className="bg-purple-500 h-2 rounded-full" style={{ width: '15%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm">
                          <span>Automotive</span>
                          <span className="font-medium">10%</span>
                        </div>
                        <div className="w-full bg-gray-200 h-2 rounded-full mt-1">
                          <div className="bg-amber-500 h-2 rounded-full" style={{ width: '10%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                    <h3 className="font-semibold mb-4">Quick Actions</h3>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start text-left">
                        <Plus className="mr-2 h-4 w-4 text-green-600" />
                        Add New Product
                      </Button>
                      <Button variant="outline" className="w-full justify-start text-left">
                        <Upload className="mr-2 h-4 w-4 text-trade-blue" />
                        Create Shipment
                      </Button>
                      <Button variant="outline" className="w-full justify-start text-left">
                        <FileText className="mr-2 h-4 w-4 text-purple-600" />
                        Generate Report
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {/* Products Tab Content */}
            <TabsContent value="products">
              {productsLoading ? (
                <div className="text-center py-4">Loading products...</div>
              ) : (
                <ProductsList 
                  products={products || []} 
                  onEdit={handleEditProduct} 
                  onDelete={handleDeleteProduct} 
                />
              )}
            </TabsContent>
            
            {/* Shipments Tab Content */}
            <TabsContent value="shipments">
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold">All Shipments</h2>
                </div>
                <div className="p-6">
                  <p className="text-muted-foreground text-center py-8">
                    Shipments management view will be displayed here.
                  </p>
                </div>
              </div>
            </TabsContent>
            
            {/* Customers Tab Content */}
            <TabsContent value="customers">
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold">Customer Management</h2>
                </div>
                <div className="p-6">
                  <p className="text-muted-foreground text-center py-8">
                    Customer relationship management view will be displayed here.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CompanyDashboard;
