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
import DataDisplay from "../components/debug/DataDisplay";

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
      
      // Try to get real data from multiple sources with better error handling
      let apiSuccess = false;
      let apiData = [];
      let apiErrors = [];
      
      // First try the dedicated user shipments endpoint (trying multiple times)
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          if (token) {
            console.log(`Attempting to fetch shipments from primary endpoint (attempt ${attempt + 1})`);
            const response = await fetch("http://localhost:5001/api/shipments/user", {
              headers: {
                Authorization: `Bearer ${token}`
              }
            });
            
            if (response.ok) {
              apiData = await response.json();
              console.log("Successfully fetched user shipment data:", apiData);
              apiSuccess = true;
              break; // Exit the retry loop on success
            } else {
              const errorText = await response.text();
              apiErrors.push(`Primary endpoint failed (attempt ${attempt + 1}): ${response.status} - ${errorText}`);
              console.log(`Primary endpoint failed (attempt ${attempt + 1}) with status:`, response.status, errorText);
              // Wait 1 second before retrying
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }
        } catch (apiError) {
          apiErrors.push(`Error with primary API endpoint (attempt ${attempt + 1}): ${apiError.message}`);
          console.error(`Error with primary API endpoint (attempt ${attempt + 1}):`, apiError);
          // Wait 1 second before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      // If first endpoint failed after all retries, try the second endpoint
      if (!apiSuccess && token) {
        for (let attempt = 0; attempt < 2; attempt++) {
          try {
            console.log(`Attempting to fetch from secondary endpoint (attempt ${attempt + 1})`);
            const response = await fetch("http://localhost:5001/api/shipments", {
              headers: {
                Authorization: `Bearer ${token}`
              }
            });
            
            if (response.ok) {
              const allShipments = await response.json();
              // Filter by user email
              apiData = allShipments.filter(shipment => 
                shipment.user_email === userEmail || 
                shipment.userEmail === userEmail
              );
              
              if (apiData.length > 0) {
                console.log(`Successfully filtered ${apiData.length} shipments from secondary endpoint`);
                apiSuccess = true;
                break; // Exit the retry loop on success
              } else {
                apiErrors.push(`Secondary endpoint returned no shipments for user ${userEmail}`);
                console.log("Secondary endpoint returned no shipments for this user");
              }
            } else {
              const errorText = await response.text();
              apiErrors.push(`Secondary endpoint failed (attempt ${attempt + 1}): ${response.status} - ${errorText}`);
              console.log(`Secondary endpoint failed (attempt ${attempt + 1}) with status:`, response.status, errorText);
            }
          } catch (secondaryError) {
            apiErrors.push(`Error with secondary API endpoint (attempt ${attempt + 1}): ${secondaryError.message}`);
            console.error(`Error with secondary API endpoint (attempt ${attempt + 1}):`, secondaryError);
          }
          // Wait 1 second before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      // If we have API data, enhance it with company information
      if (apiSuccess && apiData.length > 0) {
        try {
          console.log("Found API data, enhancing with company information");
          const enhancedShipments = await Promise.all(apiData.map(async (shipment) => {
            try {
              // Try to get the company information if we have a company ID
              if (shipment.company_id && token) {
                const companyResponse = await fetch(`http://localhost:5001/api/companies/${shipment.company_id}`, {
                  headers: {
                    Authorization: `Bearer ${token}`
                  }
                });
                
                if (companyResponse.ok) {
                  const companyData = await companyResponse.json();
                  return {
                    ...shipment,
                    company_name: companyData.name || 'Unknown Company'
                  };
                }
              }
            } catch (error) {
              console.error("Error fetching company details:", error);
            }
            return shipment;
          }));
          
          console.log("Enhanced shipments with company data:", enhancedShipments);
          
          // Fix missing cost fields in the API data
          const enhancedShipmentsWithCosts = await Promise.all(enhancedShipments.map(async (shipment) => {
            // If cost data is missing, attempt to calculate it
            if (shipment.unit_cost === undefined || shipment.subtotal === undefined || 
                shipment.tax_amount === undefined || shipment.total_cost === undefined) {
              
              console.log(`Adding missing cost data to shipment ${shipment.id}`);
              
              // Get tax rate
              const taxRate = Number(localStorage.getItem("lastTaxRate") || "0");
              
              // Try to get product price from API if we have product_id
              let unitCost = shipment.product_price || shipment.price || 0;
              
              if ((!unitCost || unitCost === 0) && shipment.product_id && token) {
                try {
                  console.log(`Fetching product data for shipment ${shipment.id} (product ${shipment.product_id})`);
                  const productResponse = await fetch(`http://localhost:5001/api/products/${shipment.product_id}`, {
                    headers: {
                      Authorization: `Bearer ${token}`
                    }
                  });
                  
                  if (productResponse.ok) {
                    const productData = await productResponse.json();
                    console.log(`Got product data:`, productData);
                    
                    // Use the product price if available
                    if (productData.price) {
                      unitCost = Number(productData.price);
                    } else if (productData.unit_cost) {
                      unitCost = Number(productData.unit_cost);
                    } else {
                      unitCost = 25; // Default to $25 if no price found
                    }
                  } else {
                    console.log(`Failed to get product data, using default price`);
                    unitCost = 25; // Default to $25 if API call fails
                  }
                } catch (error) {
                  console.error(`Error fetching product data:`, error);
                  unitCost = 25; // Default to $25 if API call errors
                }
              } else if (!unitCost || unitCost === 0) {
                // If we still don't have a unit cost, use default
                unitCost = 25; // Default to $25
              }
              
              // Calculate subtotal
              const quantity = shipment.quantity || 1;
              const subtotal = unitCost * quantity;
              
              // Calculate tax amount
              const taxAmount = (subtotal * taxRate) / 100;
              
              // Calculate total with tax
              const totalWithTax = subtotal + taxAmount;
              
              console.log(`Added cost data: unit_cost=${unitCost}, subtotal=${subtotal}, tax_amount=${taxAmount}, total_cost=${totalWithTax}`);
              
              return {
                ...shipment,
                unit_cost: unitCost,
                subtotal: subtotal,
                tax_rate: taxRate,
                tax_amount: taxAmount,
                total_cost: totalWithTax
              };
            }
            
            return shipment;
          }));
          
          // Check if any shipments have approval data in localStorage
          const companyApprovalsKey = 'companyApprovals';
          const companyApprovals = localStorage.getItem(companyApprovalsKey);
          
          if (companyApprovals) {
            try {
              const approvals = JSON.parse(companyApprovals);
              // Update any shipments that might have more recent approval/rejection data in localStorage
              const finalShipments = enhancedShipmentsWithCosts.map(shipment => {
                const approvalData = approvals[shipment.id];
                
                // Check both pending and other states - approval data in localStorage should override API data
                if (approvalData) {
                  if (approvalData.status === 'approved') {
                    console.log(`Found approval data for shipment ${shipment.id} from localStorage - updating status`);
                    return {
                      ...shipment,
                      status: 'approved',
                      origin_port: approvalData.originPort || shipment.origin_port,
                      approved_at: approvalData.approvedAt || new Date().toISOString()
                    };
                  } else if (approvalData.status === 'rejected') {
                    console.log(`Found rejection data for shipment ${shipment.id} from localStorage - updating status`);
                    return {
                      ...shipment,
                      status: 'declined',
                      rejected_at: approvalData.rejectedAt || new Date().toISOString()
                    };
                  }
                }
                return shipment;
              });
              
              setShipments(finalShipments);
            } catch (approvalErr) {
              console.error("Error processing approval data:", approvalErr);
              setShipments(enhancedShipmentsWithCosts);
            }
          } else {
            setShipments(enhancedShipmentsWithCosts);
          }
          
          setLoading(false);
          return;
        } catch (enhanceError) {
          console.error("Error enhancing shipments with company data:", enhanceError);
        }
      }
      
      // If API failed or returned no data with detailed logging
      console.log("API requests failed after all attempts, see errors:", apiErrors);
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
          
          // Check if we need to update any shipments with company approval information
          const companyApprovalsKey = 'companyApprovals';
          const companyApprovals = localStorage.getItem(companyApprovalsKey);
          
          if (companyApprovals) {
            try {
              const approvals = JSON.parse(companyApprovals);
              
              // Update shipments with approval data - be more verbose about this
              let approvalUpdatesCount = 0;
              storedShipments = storedShipments.map(shipment => {
                const approvalData = approvals[shipment.id];
                if (approvalData) {
                  approvalUpdatesCount++;
                  
                  if (approvalData.status === 'approved') {
                    console.log(`Found approval data for shipment ${shipment.id} - setting status to approved with origin port ${approvalData.originPort}`);
                    return {
                      ...shipment,
                      status: 'approved',
                      origin_port: approvalData.originPort || shipment.origin_port,
                      approved_at: approvalData.approvedAt || new Date().toISOString()
                    };
                  } else if (approvalData.status === 'rejected') {
                    console.log(`Found rejection data for shipment ${shipment.id} - setting status to declined`);
                    return {
                      ...shipment,
                      status: 'declined',
                      rejected_at: approvalData.rejectedAt || new Date().toISOString()
                    };
                  }
                }
                return shipment;
              });
              
              if (approvalUpdatesCount > 0) {
                console.log(`Applied ${approvalUpdatesCount} approval/rejection updates from localStorage`);
                
                // Save the updated shipments back to localStorage
                localStorage.setItem(userShipmentsKey, JSON.stringify(storedShipments));
              } else {
                console.log("No approval updates found in localStorage");
              }
            } catch (err) {
              console.error("Error updating shipments with approval data:", err);
            }
          }
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
        
        // Debug logging for new shipment data
        console.log("DEBUG NEW SHIPMENT DATA:", {
          productNames,
          productPrices,
          productQuantities,
          taxRate
        });
        
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
      case 'pending': return 20;
      case 'approved': return 60;
      case 'in transit': return 80;
      case 'delivered': return 100;
      case 'declined': 
      case 'rejected': return 0;
      default: return 0;
    }
  };
  
  // Get the current location based on status
  const getCurrentLocation = (shipment) => {
    switch(shipment.status) {
      case 'pending': 
        return "Awaiting approval from supplier";
      case 'approved': 
        return `Ready for dispatch at ${shipment.origin_port || 'origin'} (approved by supplier)`;
      case 'in transit': 
        return `In transit from ${shipment.origin_port || 'origin'} to ${shipment.destination_port || 'destination'}`;
      case 'delivered': 
        return `Delivered to ${shipment.destination_port || 'destination'}`;
      case 'declined': 
        return "Shipment declined by supplier";
      case 'rejected': 
        return "Shipment rejected by supplier";
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
    
    if (activeTab === "all") {
      // Only show pending shipments in "All" tab, exclude approved/completed/cancelled
      return shipments.filter(shipment => 
        shipment.status === 'pending'
      );
    }
    
    if (activeTab === "completed") {
      return shipments.filter(shipment => 
        ['approved', 'delivered', 'in transit'].includes(shipment.status)
      );
    }
    
    if (activeTab === "cancelled") {
      return shipments.filter(shipment => 
        ['declined', 'rejected'].includes(shipment.status)
      );
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
                <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto">
                  <TabsTrigger value="all">Pending Shipments</TabsTrigger>
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
                    {/* Debug component to log data */}
                    <DataDisplay data={shipment} label={`Shipment-${shipment.id?.slice(0, 8)}`} />
                    
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
                        shipment.status === 'approved' ? 'bg-green-500' : 
                        shipment.status === 'in transit' ? 'bg-indigo-500' : 
                        shipment.status === 'delivered' ? 'bg-green-500' : 
                        'bg-red-500'
                      }`}>
                        {shipment.status === 'pending' ? 'Pending Approval' :
                        shipment.status === 'approved' ? 'Approved' :
                        shipment.status === 'in transit' ? 'In Transit' :
                        shipment.status === 'delivered' ? 'Delivered' :
                        shipment.status === 'rejected' ? 'Rejected' :
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
                            <span className="h-5 w-5 rounded-full flex items-center justify-center mb-1 bg-green-500 text-white">
                              <Check className="h-3 w-3" />
                            </span>
                            <span>Ordered</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className={`h-5 w-5 rounded-full flex items-center justify-center mb-1 ${
                              shipment.status === 'approved' || shipment.status === 'in transit' || shipment.status === 'delivered' ? 'bg-green-500 text-white' : 
                              shipment.status === 'declined' || shipment.status === 'rejected' ? 'bg-red-500 text-white' : 
                              'bg-gray-200'
                            }`}>
                              {(shipment.status === 'approved' || shipment.status === 'in transit' || shipment.status === 'delivered') && <Check className="h-3 w-3" />}
                              {(shipment.status === 'declined' || shipment.status === 'rejected') && <X className="h-3 w-3" />}
                            </span>
                            <span>Approved</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Current Status */}
                      <div className="flex items-start bg-blue-50 p-4 rounded-md">
                        <MapPin className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-blue-700">Current Status</p>
                          <p className={`${(shipment.status === 'declined' || shipment.status === 'rejected') ? 'text-red-600' : 'text-blue-600'}`}>
                            {getCurrentLocation(shipment)}
                          </p>
                          {shipment.status === 'approved' && shipment.origin_port && (
                            <p className="text-blue-500 text-sm mt-1">
                              Ready to ship from {shipment.origin_port}
                            </p>
                          )}
                          {shipment.status === 'in transit' && shipment.estimated_delivery && (
                            <p className="text-blue-500 text-sm mt-1">
                              Expected delivery by {formatDateTime(shipment.estimated_delivery)}
                            </p>
                          )}
                          
                          {/* Time Elapsed */}
                          {shipment.status !== 'delivered' && shipment.status !== 'declined' && shipment.status !== 'rejected' && shipment.created_at && (
                            <p className="text-blue-500 text-sm mt-1 flex items-center">
                              <Clock12 className="h-3 w-3 mr-1" />
                              Time elapsed: {getTimeElapsed(shipment.created_at)}
                            </p>
                          )}
                          
                          {/* Rejection/Decline Date */}
                          {(shipment.status === 'declined' || shipment.status === 'rejected') && (shipment.rejected_at || shipment.declined_at) && (
                            <p className="text-red-500 text-sm mt-1 flex items-center">
                              <Clock12 className="h-3 w-3 mr-1" />
                              Rejected on: {formatDateTime(shipment.rejected_at || shipment.declined_at)}
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
                            <p className="font-medium">
                              {shipment.status === 'pending' ? 
                                'Awaiting company approval' : 
                                shipment.origin_port || 'Not specified yet'}
                            </p>
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
                        
                        <div className="flex items-center">
                          <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
                          <div>
                            <p className="text-sm text-gray-500">Unit Cost</p>
                            <p className="font-medium">${typeof shipment.unit_cost === 'number' ? shipment.unit_cost.toFixed(2) : "0.00"} per unit</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
                          <div>
                            <p className="text-sm text-gray-500">Subtotal</p>
                            <p className="font-medium">
                              ${typeof shipment.subtotal === 'number' ? shipment.subtotal.toFixed(2) : 
                                 ((typeof shipment.unit_cost === 'number' ? shipment.unit_cost : 0) * 
                                  (typeof shipment.quantity === 'number' ? shipment.quantity : 1)).toFixed(2)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
                          <div>
                            <p className="text-sm text-gray-500">Import Tax ({shipment.tax_rate || 0}%)</p>
                            <p className="font-medium">${typeof shipment.tax_amount === 'number' ? shipment.tax_amount.toFixed(2) : "0.00"}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
                          <div>
                            <p className="text-sm text-gray-500">Total (with tax)</p>
                            <p className="font-medium font-bold text-lg">
                              ${typeof shipment.total_cost === 'number' ? shipment.total_cost.toFixed(2) : 
                                ((typeof shipment.subtotal === 'number' ? shipment.subtotal : 
                                  ((typeof shipment.unit_cost === 'number' ? shipment.unit_cost : 0) * 
                                   (typeof shipment.quantity === 'number' ? shipment.quantity : 1))) + 
                                 (typeof shipment.tax_amount === 'number' ? shipment.tax_amount : 0)).toFixed(2)}
                            </p>
                          </div>
                        </div>
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
  const diffMs = now.getTime() - created.getTime(); // Use getTime() to get timestamps in milliseconds
  
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