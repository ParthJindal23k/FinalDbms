import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Map,
  User,
  Settings,
  Truck,
  Package,
  BarChart3,
  DollarSign,
  Globe,
  ShieldCheck,
  Clock,
  FileText,
  Info,
  Loader2
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { useToast } from '../components/ui/use-toast';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import ShipmentStatusCard from '../components/dashboard/ShipmentStatusCard';
import StatsCards from '../components/dashboard/StatsCards';
import { useQuery } from '@tanstack/react-query';
import { get } from '../lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';
import { Progress } from '../components/ui/progress';

// Generate a unique ID (same as TrackShipment.tsx)
const generateUniqueId = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Sample shipment data if no shipments exist
const getSampleShipment = () => {
  const creationDate = new Date();
  const estimatedDelivery = new Date(creationDate);
  estimatedDelivery.setDate(creationDate.getDate() + 7);
  
  return {
    id: generateUniqueId(),
    productName: "Sample Electronics Package",
    quantity: 10,
    originPort: "Shanghai",
    destinationPort: "Los Angeles",
    status: "pending",
    estimatedDelivery: estimatedDelivery.toLocaleDateString(),
    progressPercentage: 25,
    isSample: true
  };
};

// Function to get shipments from localStorage (similar to TrackShipment.tsx)
const getLocalShipments = () => {
  const userEmail = localStorage.getItem("userEmail") || "";
  const userShipmentsKey = `userShipments_${userEmail}`;
  
  try {
    const shipmentData = localStorage.getItem(userShipmentsKey);
    if (shipmentData) {
      const storedShipments = JSON.parse(shipmentData);
      if (storedShipments.length > 0) {
        // Map the data to match our ShipmentStatusCard props format
        return storedShipments.map(shipment => ({
          id: shipment.id,
          productName: shipment.product_name || "Unknown Product",
          quantity: shipment.quantity || 1,
          originPort: shipment.origin_port || "Unknown Origin",
          destinationPort: shipment.destination_port || "Unknown Destination",
          status: shipment.status || "pending",
          estimatedDelivery: shipment.estimated_delivery ? new Date(shipment.estimated_delivery).toLocaleDateString() : null,
          progressPercentage: calculateProgress(shipment.status)
        }));
      }
    }
  } catch (err) {
    console.error("Error retrieving stored shipments:", err);
  }
  
  return [];
};

// Calculate progress percentage based on status
const calculateProgress = (status) => {
  switch (status?.toLowerCase()) {
    case 'approved':
    case 'in transit':
      return 50;
    case 'delivered':
      return 100;
    case 'declined':
    case 'rejected':
      return 0;
    case 'pending':
    default:
      return 25;
  }
};

const fetchUserStats = async () => {
  try {
    return await get('/dashboard/user-stats');
  } catch (error) {
    console.error("Error fetching user stats:", error);
    // Return default stats if request fails
    return {
      activeShipments: 0,
      pendingCustoms: 0
    };
  }
};

const fetchUserShipments = async () => {
  try {
    return await get('/dashboard/user-shipments');
  } catch (error) {
    console.error("Error fetching shipments:", error);
    return [];
  }
};

const fetchUserProfile = async () => {
  try {
    return await get('/dashboard/user-profile');
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return { email: "user@example.com" };
  }
};

const UserDashboard = () => {
  const { toast } = useToast();
  const [userName, setUserName] = useState(() => {
    // Initialize with email from localStorage if available
    return localStorage.getItem('userEmail') || '!';
  });
  
  const navigate = useNavigate();
  
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

  useEffect(() => {
    // If profile data is loaded, use that email (it's the most up-to-date)
    if (profileData && profileData.email) {
      setUserName(profileData.email);
    } else {
      // Otherwise use email from localStorage as fallback
      const storedEmail = localStorage.getItem('userEmail');
      if (storedEmail) {
        setUserName(storedEmail);
      }
    }
    
    if (profileError) {
      toast({
        title: "Error loading profile",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    }

    if (statsError) {
      toast({
        title: "Error loading dashboard data",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    }
  }, [profileData, profileError, statsError, toast]);

  const stats = statsData || {
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
              <h1 className="text-2xl font-bold mb-2">Welcome back, {userName.includes('@') ? userName.split('@')[0] : userName}!</h1>
              <p className="text-gray-600">Manage your global trading operations from one place.</p>
            </div>
            <div className="flex mt-4 md:mt-0 space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center"
                onClick={() => navigate('/track-shipments')}
              >
                <Truck className="mr-1 h-4 w-4" />
                Track Shipments
              </Button>
              <Button 
                size="sm" 
                className="bg-trade-blue hover:bg-blue-700 flex items-center"
                asChild
              >
                <Link to="/new-shipment">
                  <Plus className="mr-1 h-4 w-4" />
                  New Shipment
                </Link>
              </Button>
            </div>
          </div>
          
          {/* Stats Cards */}
          {statsLoading ? (
            <div className="text-center py-4">Loading stats...</div>
          ) : (
            <StatsCards stats={stats} userType="user" />
          )}
          
          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center" asChild>
              <Link to="/new-shipment">
                <Plus className="h-6 w-6 text-green-600 mb-2" />
                <span>Create Shipment</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center" asChild>
              <Link to="/track-shipments">
                <Truck className="h-6 w-6 text-blue-600 mb-2" />
                <span>Track Shipments</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center" asChild>
              <Link to="/documents">
                <FileText className="h-6 w-6 text-purple-600 mb-2" />
                <span>Documents</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center" asChild>
              <Link to="/settings">
                <Settings className="h-6 w-6 text-gray-600 mb-2" />
                <span>Settings</span>
              </Link>
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default UserDashboard;
