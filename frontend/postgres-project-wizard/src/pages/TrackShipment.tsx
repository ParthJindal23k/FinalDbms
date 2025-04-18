import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { 
  Package, 
  Truck, 
  Calendar, 
  Clock, 
  Check, 
  X, 
  MapPin, 
  Navigation as NavigationIcon,
  ArrowLeft,
  RefreshCw,
  Filter,
  Clock12,
  DollarSign
} from "lucide-react";
import { useToast } from "../components/ui/use-toast";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";

// Generate a truly unique ID with v4 UUID pattern
const generateUniqueId = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const TrackShipment = () => {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const processed = useRef(false);
  
  // Check if we need to clean up duplicate keys
  useEffect(() => {
    const userEmail = localStorage.getItem("userEmail") || "";
    const userShipmentsKey = `userShipments_${userEmail}`;
    
    try {
      // Get stored shipments
      const shipmentData = localStorage.getItem(userShipmentsKey);
      if (shipmentData) {
        let storedShipments = JSON.parse(shipmentData);
        
        // Check for duplicates by tracking ids we've seen
        const seenIds = new Set();
        const uniqueShipments = [];
        
        for (const shipment of storedShipments) {
          // If this ID has an issue or we've seen it before, generate a new one
          if (!shipment.id || seenIds.has(shipment.id)) {
            shipment.id = generateUniqueId();
          }
          seenIds.add(shipment.id);
          uniqueShipments.push(shipment);
        }
        
        // Save back the deduplicated list
        localStorage.setItem(userShipmentsKey, JSON.stringify(uniqueShipments));
        console.log(`Cleaned up shipments for user ${userEmail}. Now have ${uniqueShipments.length} unique shipments.`);
      }
    } catch (err) {
      console.error("Error cleaning up shipments:", err);
    }
    
    // Load shipments only once
    if (!processed.current) {
      fetchShipments();
      processed.current = true;
    }
    
    // Clear location state to prevent duplication
    const clearedState = { 
      ...location.state,
      newShipment: undefined,
      productNames: undefined,
      productPrices: undefined,
      productQuantities: undefined
    };
    
    if (window.history && window.history.replaceState) {
      window.history.replaceState(
        { ...window.history.state, usr: clearedState },
        document.title
      );
    }
  }, []);
  
  const fetchShipments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const userEmail = localStorage.getItem("userEmail") || "";
      
      // Create a unique key for this user's shipments
      const userShipmentsKey = `userShipments_${userEmail}`;
      
      // Try to get real data first
      let apiSuccess = false;
      try {
        if (token) {
          const response = await fetch("http://localhost:5001/api/shipments/user", {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log("Successfully fetched real shipment data:", data);
            
            // Get company details for each shipment
            const enhancedShipments = await Promise.all(data.map(async (shipment) => {
              try {
                // Try to get the registered company name from the API
                const companyResponse = await fetch(`http://localhost:5001/api/companies/${shipment.company_id}`, {
                  headers: {
                    Authorization: `Bearer ${token}`
                  }
                });
                
                if (companyResponse.ok) {
                  const companyData = await companyResponse.json();
                  // Update the company name with the registered name from database
                  return {
                    ...shipment,
                    company_name: companyData.name // Use specifically the 'name' field as shown in the database
                  };
                }
              } catch (error) {
                console.error("Error fetching company details:", error);
              }
              return shipment;
            }));
            
            setShipments(enhancedShipments || data || []);
            setLoading(false);
            apiSuccess = true;
            return;
          }
        }
      } catch (apiError) {
        console.error("API Error:", apiError);
      }
      
      // If API failed, fallback to local storage and new shipments
      console.log("Falling back to stored shipment data for user:", userEmail);
      
      // Get the tax rate
      let taxRate = 0;
      if (location.state?.importTaxRate !== undefined) {
        taxRate = Number(location.state.importTaxRate);
        console.log("Using tax rate from location state:", taxRate);
      } else if (localStorage.getItem("lastTaxRate")) {
        taxRate = Number(localStorage.getItem("lastTaxRate"));
        console.log("Using tax rate from localStorage:", taxRate);
      }
      
      // Ensure it's a valid number
      if (isNaN(taxRate)) {
        console.warn("Invalid tax rate, defaulting to 0");
        taxRate = 0;
      }
      
      // Get previously stored shipments from localStorage for this specific user
      let storedShipments = [];
      try {
        const shipmentData = localStorage.getItem(userShipmentsKey);
        if (shipmentData) {
          storedShipments = JSON.parse(shipmentData);
          console.log(`Retrieved ${storedShipments.length} stored shipments for user ${userEmail}`);
        }
      } catch (err) {
        console.error("Error retrieving stored shipments:", err);
        storedShipments = [];
      }
      
      // Process new shipment data if available
      const hasNewShipment = location.state?.productNames && Array.isArray(location.state.productNames) && 
                            location.state.productNames.length > 0;
      
      if (hasNewShipment) {
        console.log("Processing new shipment data");
        
        const productNames = location.state.productNames || [];
        const productPrices = location.state.productPrices || [];
        const productQuantities = location.state.productQuantities || [];
        const destinationPort = localStorage.getItem("lastDestination") || "Your Selected Destination";
        
        // Generate new shipments
        const newShipments = productNames.map((name, index) => {
          const uniqueId = generateUniqueId();
          
          // Get the actual price and quantity
          const price = productPrices[index] || 0;
          const quantity = productQuantities[index] || 1;
          
          // Calculate subtotal
          const subtotal = price * quantity;
          
          // Calculate tax amount
          const taxAmount = (subtotal * taxRate) / 100;
          
          // Calculate total with tax
          const totalWithTax = subtotal + taxAmount;
          
          // Set creation date to now
          const creationDate = new Date();
          
          // Calculate estimated delivery date as exactly 1 week (7 days) after creation
          const estimatedDelivery = new Date(creationDate);
          estimatedDelivery.setDate(creationDate.getDate() + 7);
          
          // Get the company information for this product
          let companyName = "Global Trade Partners Inc."; // Default to a realistic company name
          
          // Check multiple sources for company names
          if (location.state?.companyNames && location.state.companyNames[index]) {
            companyName = location.state.companyNames[index];
            console.log(`Using company name from location state: ${companyName}`);
          } else {
            // Try to get company names from localStorage
            try {
              const storedCompanyNames = localStorage.getItem("lastCompanyNames");
              if (storedCompanyNames) {
                const companyNamesArray = JSON.parse(storedCompanyNames);
                if (companyNamesArray[index]) {
                  companyName = companyNamesArray[index];
                  console.log(`Using company name from localStorage: ${companyName}`);
                }
              }
            } catch (err) {
              console.error("Error retrieving company names:", err);
            }
          }
          
          return {
            id: uniqueId,
            product_name: name,
            user_email: userEmail,
            quantity: quantity,
            origin_port: "Shanghai",
            destination_port: destinationPort,
            status: "pending",
            created_at: creationDate.toISOString(),
            estimated_delivery: estimatedDelivery.toISOString(),
            unit_cost: price,
            subtotal: subtotal,
            tax_rate: taxRate,
            tax_amount: taxAmount,
            total_cost: totalWithTax,
            company_name: companyName,
            isNew: true
          };
        });
        
        // Combine the new and stored shipments
        const allShipments = [...newShipments, ...storedShipments];
        
        // Store the combined shipments back to localStorage
        try {
          localStorage.setItem(userShipmentsKey, JSON.stringify(allShipments));
          console.log(`Stored ${allShipments.length} shipments for user ${userEmail}`);
        } catch (err) {
          console.error("Error storing shipments:", err);
        }
        
        setShipments(allShipments);
      } else {
        // Just use the stored ones
        console.log("Using only stored shipments, no new shipment data");
        setShipments(storedShipments);
      }
    } catch (error) {
      console.error("Error setting up data:", error);
      toast({
        title: "Error",
        description: "Failed to load shipment tracking data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Calculate progress based on status
  const calculateProgress = (status) => {
    switch(status) {
      case 'pending': return 10;
      case 'approved': return 30;
      case 'in transit': return 60;
      case 'delivered': return 100;
      case 'declined': return 0;
      default: return 0;
    }
  };
  
  // Get the current location based on status
  const getCurrentLocation = (shipment) => {
    switch(shipment.status) {
      case 'pending': 
        return "Awaiting approval from supplier";
      case 'approved': 
        return `Ready for dispatch at ${shipment.origin_port || 'origin'}`;
      case 'in transit': 
        return `In transit from ${shipment.origin_port || 'origin'} to ${shipment.destination_port || 'destination'}`;
      case 'delivered': 
        return `Delivered to ${shipment.destination_port || 'destination'}`;
      case 'declined': 
        return "Shipment declined by supplier";
      default: 
        return "Status unknown";
    }
  };
  
  // Format date with time
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  // Filter shipments based on active tab
  const getFilteredShipments = () => {
    // Debug log to see company names
    console.log("Shipments with company names:", 
      shipments.map(s => ({
        id: s.id.toString().slice(0, 8),
        product: s.product_name,
        company: s.company_name
      }))
    );
    
    if (activeTab === "all") return shipments;
    if (activeTab === "current") {
      return shipments.filter(shipment => 
        ['pending', 'approved', 'in transit'].includes(shipment.status)
      );
    }
    if (activeTab === "completed") {
      return shipments.filter(shipment => shipment.status === 'delivered');
    }
    if (activeTab === "cancelled") {
      return shipments.filter(shipment => shipment.status === 'declined');
    }
    return shipments;
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navigation isAuthenticated={true} userType="user" />
      
      <main className="flex-grow p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 flex justify-between items-center">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                className="mr-2"
                onClick={() => navigate('/user-dashboard')}
              >
                <ArrowLeft className="h-5 w-5 mr-1" />
                Back to Dashboard
              </Button>
              <h1 className="text-2xl font-bold text-gray-800">Shipment Tracker</h1>
            </div>
            
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                className="flex items-center"
                onClick={() => {
                  processed.current = false;
                  fetchShipments();
                }}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              
              <Button
                variant="default"
                className="flex items-center"
                onClick={() => navigate('/new-shipment')}
              >
                <Package className="h-4 w-4 mr-2" />
                Create Shipment
              </Button>
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : shipments.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-10 text-center">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-medium text-gray-700 mb-2">No Shipments Found</h2>
              <p className="text-gray-500 mb-6">You don't have any active shipments to track.</p>
              <Button onClick={() => navigate("/new-shipment")}>
                Create Your First Shipment
              </Button>
            </div>
          ) : (
            <>
              <Tabs 
                defaultValue="all" 
                value={activeTab}
                onValueChange={setActiveTab}
                className="mb-6"
              >
                <TabsList className="grid grid-cols-4 w-full max-w-md mx-auto">
                  <TabsTrigger value="all">All Shipments</TabsTrigger>
                  <TabsTrigger value="current">Current</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                  <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
                </TabsList>
              </Tabs>
              
              <div className="grid gap-6">
                {getFilteredShipments().map((shipment) => (
                  <div 
                    key={shipment.id} 
                    className={`bg-white rounded-lg shadow overflow-hidden transition-all duration-300 ${
                      shipment.isNew ? 'ring-2 ring-blue-500' : ''
                    }`}
                  >
                    {/* Shipment Header */}
                    <div className="bg-gray-50 border-b px-6 py-4 flex justify-between items-center">
                      <div>
                        <h3 className="font-medium text-lg text-gray-900">{shipment.product_name || 'Product'}</h3>
                        <p className="text-sm text-gray-500">
                          ID: {shipment.id ? shipment.id.toString().slice(0, 8).toUpperCase() : 'N/A'} • 
                          Ordered: {formatDateTime(shipment.created_at)}
                        </p>
                      </div>
                      <Badge className={`px-3 py-1.5 text-sm ${
                        shipment.status === 'pending' ? 'bg-yellow-500' : 
                        shipment.status === 'approved' ? 'bg-blue-500' : 
                        shipment.status === 'in transit' ? 'bg-indigo-500' : 
                        shipment.status === 'delivered' ? 'bg-green-500' : 
                        'bg-red-500'
                      }`}>
                        {shipment.status === 'pending' ? 'Pending Approval' :
                        shipment.status === 'approved' ? 'Approved' :
                        shipment.status === 'in transit' ? 'In Transit' :
                        shipment.status === 'delivered' ? 'Delivered' :
                        'Declined'}
                      </Badge>
                    </div>
                    
                    {/* Progress Tracker */}
                    <div className="px-6 py-5 border-b">
                      <div className="mb-6 px-2">
                        <Progress 
                          value={calculateProgress(shipment.status)} 
                          className="h-3"
                        />
                        
                        <div className="flex justify-between text-xs text-gray-500 mt-2">
                          <div className="flex flex-col items-center">
                            <span className={`h-5 w-5 rounded-full flex items-center justify-center mb-1 ${
                              calculateProgress(shipment.status) >= 10 ? 'bg-green-500 text-white' : 'bg-gray-200'
                            }`}>
                              {calculateProgress(shipment.status) >= 10 && <Check className="h-3 w-3" />}
                            </span>
                            <span>Ordered</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className={`h-5 w-5 rounded-full flex items-center justify-center mb-1 ${
                              calculateProgress(shipment.status) >= 30 ? 'bg-green-500 text-white' : 'bg-gray-200'
                            }`}>
                              {calculateProgress(shipment.status) >= 30 && <Check className="h-3 w-3" />}
                            </span>
                            <span>Approved</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className={`h-5 w-5 rounded-full flex items-center justify-center mb-1 ${
                              calculateProgress(shipment.status) >= 60 ? 'bg-green-500 text-white' : 'bg-gray-200'
                            }`}>
                              {calculateProgress(shipment.status) >= 60 && <Check className="h-3 w-3" />}
                            </span>
                            <span>In Transit</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className={`h-5 w-5 rounded-full flex items-center justify-center mb-1 ${
                              calculateProgress(shipment.status) >= 100 ? 'bg-green-500 text-white' : 'bg-gray-200'
                            }`}>
                              {calculateProgress(shipment.status) >= 100 && <Check className="h-3 w-3" />}
                            </span>
                            <span>Delivered</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Current Status */}
                      <div className="flex items-start bg-blue-50 p-4 rounded-md">
                        <MapPin className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-blue-700">Current Status</p>
                          <p className="text-blue-600">{getCurrentLocation(shipment)}</p>
                          {shipment.status === 'in transit' && shipment.estimated_delivery && (
                            <p className="text-blue-500 text-sm mt-1">
                              Expected delivery by {formatDateTime(shipment.estimated_delivery)}
                            </p>
                          )}
                          
                          {/* Time Elapsed */}
                          {shipment.status !== 'delivered' && shipment.status !== 'declined' && shipment.created_at && (
                            <p className="text-blue-500 text-sm mt-1 flex items-center">
                              <Clock12 className="h-3 w-3 mr-1" />
                              Time elapsed: {getTimeElapsed(shipment.created_at)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Shipment Details */}
                    <div className="px-6 py-5">
                      <h4 className="font-medium text-gray-800 mb-3">Shipment Details</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center">
                          <Package className="h-5 w-5 text-gray-400 mr-2" />
                          <div>
                            <p className="text-sm text-gray-500">Product</p>
                            <p className="font-medium">{shipment.product_name || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Truck className="h-5 w-5 text-gray-400 mr-2" />
                          <div>
                            <p className="text-sm text-gray-500">Quantity</p>
                            <p className="font-medium">{shipment.quantity || 0} units</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                          <div>
                            <p className="text-sm text-gray-500">Origin</p>
                            <p className="font-medium">{shipment.origin_port || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                          <div>
                            <p className="text-sm text-gray-500">Destination</p>
                            <p className="font-medium">{shipment.destination_port || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                          <div>
                            <p className="text-sm text-gray-500">Order Date</p>
                            <p className="font-medium">{formatDateTime(shipment.created_at)}</p>
                          </div>
                        </div>
                        {shipment.estimated_delivery && (
                          <div className="flex items-center">
                            <Clock className="h-5 w-5 text-gray-400 mr-2" />
                            <div>
                              <p className="text-sm text-gray-500">Estimated Delivery</p>
                              <p className="font-medium">{formatDateTime(shipment.estimated_delivery)}</p>
                            </div>
                          </div>
                        )}
                        
                        {/* Unit Cost */}
                        {shipment.unit_cost !== undefined && (
                          <div className="flex items-center">
                            <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
                            <div>
                              <p className="text-sm text-gray-500">Unit Cost</p>
                              <p className="font-medium">${parseFloat(shipment.unit_cost).toFixed(2)} per unit</p>
                            </div>
                          </div>
                        )}
                        
                        {/* Subtotal */}
                        {shipment.subtotal !== undefined && (
                          <div className="flex items-center">
                            <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
                            <div>
                              <p className="text-sm text-gray-500">Subtotal</p>
                              <p className="font-medium">${parseFloat(shipment.subtotal).toFixed(2)}</p>
                            </div>
                          </div>
                        )}
                        
                        {/* Tax information */}
                        {shipment.tax_rate !== undefined && (
                          <div className="flex items-center">
                            <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
                            <div>
                              <p className="text-sm text-gray-500">Import Tax ({shipment.tax_rate}%)</p>
                              <p className="font-medium">${parseFloat(shipment.tax_amount || 0).toFixed(2)}</p>
                            </div>
                          </div>
                        )}
                        
                        {/* Total Cost */}
                        {shipment.quantity !== undefined && shipment.unit_cost !== undefined && (
                          <div className="flex items-center">
                            <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
                            <div>
                              <p className="text-sm text-gray-500">Total (with tax)</p>
                              <p className="font-medium font-bold text-lg">
                                ${shipment.total_cost !== undefined 
                                  ? parseFloat(shipment.total_cost).toFixed(2) 
                                  : ((parseFloat(shipment.unit_cost) * parseInt(shipment.quantity)) + 
                                     (shipment.tax_amount || 0)).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Supplier Info */}
                      <div className="mt-4 pt-4 border-t">
                        <h4 className="font-medium text-gray-800 mb-2">Supplier Information</h4>
                        <p className="text-gray-700">
                          {shipment.company_name}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

// Helper function to calculate time elapsed since shipment creation
const getTimeElapsed = (createdAt) => {
  if (!createdAt) return 'Unknown';
  
  const created = new Date(createdAt);
  const now = new Date();
  const diffMs = now - created;
  
  // Convert to days/hours/minutes
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ${diffHours} hr${diffHours > 1 ? 's' : ''}`;
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ${diffMinutes} min${diffMinutes > 1 ? 's' : ''}`;
  } else {
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
  }
};

export default TrackShipment; 