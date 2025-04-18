// src/pages/CompanyDashboard.tsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Download,
  Upload,
  Users,
  FileText,
  Activity,
  Package,
  ShoppingCart,
  Check,
  X
} from "lucide-react";
import { Button } from "../components/ui/button";
import { useToast } from "../components/ui/use-toast";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import ShipmentStatusCard from "../components/dashboard/ShipmentStatusCard";
import TransactionsList from "../components/dashboard/TransactionsList";
import ProductsList from "../components/dashboard/ProductsList";
import StatsCards from "../components/dashboard/StatsCards";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { get } from "../lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { AddProductModal } from "./AddProduct";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { DialogFooter } from "../components/ui/dialog";

interface ApiShipment {
  id?: string;
  product?: string;
  product_name?: string;
  quantity?: number;
  originPort?: string;
  origin_port?: string;
  destinationPort?: string;
  destination_port?: string;
  status?: string;
  estimatedDelivery?: string | null;
  estimated_delivery?: string | null;
  progressPercentage?: number;
  progress_percentage?: number;
  [key: string]: any; // For any other properties that might exist
}

interface FormattedShipment {
  id: string;
  productName: string;
  quantity: number;
  originPort: string;
  destinationPort: string;
  status: string;
  estimatedDelivery: string | null;
  progressPercentage: number;
}

// Interface for product requests
interface ProductRequest {
  id: string;
  productName: string;
  quantity: number;
  userEmail: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected';
}

const fetchCompanyProfile = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    // Extract companyId from token with better error handling
    let companyId;
    try {
      const tokenParts = token.split('.');
      if (tokenParts.length === 3) {
        const payload = JSON.parse(atob(tokenParts[1]));
        // Try multiple possible fields for company ID
        companyId = payload.companyId || payload.company_id || payload.id || payload.userId;
        
        if (!companyId) {
          console.warn("Token payload:", payload);
          throw new Error("No company ID found in token payload");
        }
      } else {
        throw new Error("Invalid token format");
      }
    } catch (error) {
      console.error("Error parsing token:", error);
      throw new Error("Failed to parse authentication token");
    }

    const response = await fetch(`http://localhost:5001/api/companies/${companyId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch company profile: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching company profile:", error);
    throw error;
  }
};

const fetchCompanyStats = async () => {
  // Mock stats data instead of API call
  return {
    totalTransactions: 45,
    transactionValue: 12500,
    activeShipments: 8,
    pendingCustoms: 3
  };
};

const fetchCompanyShipments = async () => {
  // Mock shipments data instead of API call
  return [
    {
      id: "shp-001",
      productName: "Laptop Computer",
      quantity: 50,
      originPort: "Shanghai",
      destinationPort: "Los Angeles",
      status: "in transit",
      estimatedDelivery: "2023-12-15",
      progressPercentage: 65
    },
    {
      id: "shp-002",
      productName: "Wireless Headphones",
      quantity: 200,
      originPort: "Shenzhen",
      destinationPort: "Rotterdam",
      status: "pending",
      estimatedDelivery: "2023-12-30",
      progressPercentage: 20
    }
  ];
};

const fetchCompanyTransactions = async () => {
  // Mock transactions data instead of API call
  return [
    {
      id: "tr-001",
      companyName: "Global Electronics Ltd",
      invoiceNumber: "INV-2023-001",
      amount: 5420,
      status: "completed",
      currency: "USD",
      date: "2023-10-15"
    },
    {
      id: "tr-002",
      companyName: "Tech Distributors Inc",
      invoiceNumber: "INV-2023-002",
      amount: -1200,
      status: "pending",
      currency: "USD",
      date: "2023-11-05"
    }
  ];
};

const fetchCompanyProducts = async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No authentication token found");
  }
  
  // Extract companyId from token with improved error handling
  let companyId;
  let tokenPayload = null;
  try {
    const tokenParts = token.split('.');
    if (tokenParts.length === 3) {
      tokenPayload = JSON.parse(atob(tokenParts[1]));
      console.log("Token payload:", JSON.stringify(tokenPayload, null, 2));
      
      // Try multiple possible fields for company ID
      companyId = tokenPayload.companyId || tokenPayload.company_id || tokenPayload.id || tokenPayload.userId;
      
      if (!companyId) {
        console.warn("No company ID found in token payload. Available fields:", Object.keys(tokenPayload));
        throw new Error("No company ID found in token payload");
      }
      
      console.log("Using company ID:", companyId, "from field:", 
        tokenPayload.companyId ? "companyId" : 
        tokenPayload.company_id ? "company_id" : 
        tokenPayload.id ? "id" : 
        tokenPayload.userId ? "userId" : "unknown");
    } else {
      throw new Error("Invalid token format");
    }
  } catch (error) {
    console.error("Error parsing token:", error);
    throw new Error("Failed to extract company ID from token");
  }
  
  // Always include companyId in the URL, never fall back to fetching all products
  const url = `http://localhost:5001/api/products?companyId=${companyId}`;
  console.log(`Fetching products for company ${companyId} from: ${url}`);
    
  const response = await fetch(url, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    console.error(`Failed to fetch products: ${response.status} ${response.statusText}`);
    throw new Error(`Failed to fetch products: ${response.statusText}`);
  }
  
  const products = await response.json();
  console.log(`Retrieved ${products.length} products for company ${companyId}`);
  
  if (products.length > 0) {
    console.log("Sample product data:", JSON.stringify(products[0], null, 2));
    
    // Check if all products belong to the requested company
    const mismatchedProducts = products.filter(product => 
      product.company_id && product.company_id !== companyId
    );
    
    if (mismatchedProducts.length > 0) {
      console.warn(`Found ${mismatchedProducts.length} products that don't match company ID ${companyId}:`, 
        mismatchedProducts.map(p => ({ id: p.id, name: p.name, company_id: p.company_id })));
    }
  }
  
  return products;
};

// Try to fetch actual shipment data when product-requests endpoint fails
const fetchAlternateProductRequests = async (companyId) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    console.log("Attempting to fetch shipment data from main endpoint");
    
    // Try to get all shipments and filter for the ones related to the company's products
    const response = await fetch(`http://localhost:5001/api/shipments`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      console.error("Alternative endpoint also failed:", response.status);
      return [];
    }

    const shipments = await response.json();
    console.log(`Successfully fetched all shipments: ${shipments.length}`);
    
    if (!Array.isArray(shipments) || shipments.length === 0) {
      console.warn("No shipments found");
      return [];
    }
    
    // First try to fetch company's products to know which product IDs belong to this company
    let companyProducts = [];
    try {
      const productsResponse = await fetch(`http://localhost:5001/api/products?companyId=${companyId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (productsResponse.ok) {
        const allProducts = await productsResponse.json();
        // Only use products that explicitly belong to this company
        companyProducts = allProducts.filter(product => 
          product.company_id === companyId
        );
        console.log(`Retrieved ${companyProducts.length} verified products for company ${companyId}`);
      }
    } catch (error) {
      console.error("Error fetching company products:", error);
    }
    
    // Create set of product IDs or names for faster lookup
    const companyProductIds = new Set();
    const companyProductNames = new Set();
    
    companyProducts.forEach(product => {
      if (product.id) companyProductIds.add(product.id);
      if (product.name) companyProductNames.add(product.name.toLowerCase());
    });
    
    console.log(`Company product IDs: ${Array.from(companyProductIds).join(', ')}`);
    console.log(`Company product names: ${Array.from(companyProductNames).join(', ')}`);
    
    // Filter shipments that are related to this company's products
    const companyShipments = shipments.filter(shipment => {
      // Direct company ID match is the most reliable
      if (shipment.company_id && shipment.company_id === companyId) {
        return true;
      }
      
      // Match by product ID if available
      if (shipment.product_id && companyProductIds.has(shipment.product_id)) {
        return true;
      }
      
      // Match by product name as a fallback
      if (shipment.product_name && 
          companyProductNames.size > 0 &&
          companyProductNames.has(shipment.product_name.toLowerCase())) {
        return true;
      }
      
      // If none of the above conditions match, this shipment is not for this company
      return false;
    });
    
    console.log(`Filtered to ${companyShipments.length} shipments related to company ${companyId}`);
    
    // For debugging - log a few sample shipments that were included and excluded
    if (companyShipments.length > 0) {
      console.log("Sample included shipment:", {
        id: companyShipments[0].id,
        product_name: companyShipments[0].product_name,
        company_id: companyShipments[0].company_id
      });
    }
    
    if (shipments.length > companyShipments.length) {
      const excludedShipment = shipments.find(s => !companyShipments.includes(s));
      if (excludedShipment) {
        console.log("Sample excluded shipment:", {
          id: excludedShipment.id,
          product_name: excludedShipment.product_name,
          company_id: excludedShipment.company_id
        });
      }
    }
    
    // Convert shipments to product requests format
    // Filter for pending shipments and format them as product requests
    const pendingRequests = companyShipments
      .filter(shipment => shipment.status === 'pending')
      .map(shipment => ({
        id: shipment.id,
        product_name: shipment.product_name || 'Unknown Product',
        quantity: shipment.quantity || 1,
        user_email: shipment.user_email || 'customer@example.com',
        request_date: shipment.created_at || new Date().toISOString(),
        status: 'pending'
      }));
    
    console.log(`Processed ${pendingRequests.length} pending requests for company ${companyId}`);
    return pendingRequests;
    
  } catch (error) {
    console.error("Error fetching alternate product data:", error);
    return [];
  }
};

const fetchProductRequests = async () => {
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000;
  let retryCount = 0;
  let currentCompanyId = null;

  const attemptFetch = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      try {
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          currentCompanyId = payload.companyId || payload.company_id || payload.id || payload.userId;
        }
      } catch (error) {
        console.error("Error parsing token:", error);
        throw new Error("Failed to parse authentication token");
      }

      if (!currentCompanyId) {
        throw new Error("Company ID not found in token");
      }

      console.log(`Fetching product requests for company: ${currentCompanyId} (Attempt ${retryCount + 1}/${MAX_RETRIES})`);

      const response = await fetch(`http://localhost:5001/api/shipments/product-requests?companyId=${currentCompanyId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        let errorMessage = `Failed to fetch product requests: ${response.statusText}`;
        let errorDetails = null;
        
        try {
          const errorData = await response.json();
          errorDetails = errorData;
          
          if (errorData.error === 'Failed to fetch shipment') {
            console.warn("Backend shipment fetch error - this may indicate a database or connection issue");
            errorMessage = "Unable to retrieve shipment information. The system is experiencing issues.";
          } else if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          }
          
          console.error("API Error Details:", {
            status: response.status,
            statusText: response.statusText,
            error: errorData,
            companyId: currentCompanyId,
            attempt: retryCount + 1,
            timestamp: new Date().toISOString()
          });
        } catch (e) {
          console.error("Failed to parse error response:", e);
        }
        
        if (response.status === 500) {
          console.warn("Server error encountered:", {
            status: response.status,
            companyId: currentCompanyId,
            attempt: retryCount + 1,
            timestamp: new Date().toISOString()
          });
          
          if (retryCount < MAX_RETRIES - 1) {
            console.log(`Retrying in ${RETRY_DELAY}ms...`);
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            retryCount++;
            return attemptFetch();
          }
          
          // After all retries failed, try to get real data from alternative endpoint
          console.log("All retries failed, attempting to fetch from alternative endpoint");
          const alternateData = await fetchAlternateProductRequests(currentCompanyId);
          
          if (alternateData.length > 0) {
            console.log("Successfully retrieved data from alternative endpoint");
            return alternateData;
          }
          
          console.log("No data available from any endpoint");
          return [];
        }
        
        return [];
      }

      const data = await response.json();
      console.log("Successfully fetched product requests:", {
        count: data.length,
        companyId: currentCompanyId,
        timestamp: new Date().toISOString()
      });
      return data;
    } catch (error) {
      console.error("Error fetching product requests:", {
        error: error,
        companyId: currentCompanyId,
        attempt: retryCount + 1,
        timestamp: new Date().toISOString()
      });
      
      if (retryCount < MAX_RETRIES - 1) {
        console.log(`Retrying in ${RETRY_DELAY}ms...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        retryCount++;
        return attemptFetch();
      }
      
      // Try alternative data source instead of mock data
      console.log("All retries failed, attempting to fetch from alternative endpoint");
      const alternateData = await fetchAlternateProductRequests(currentCompanyId);
      
      if (alternateData.length > 0) {
        console.log("Successfully retrieved data from alternative endpoint");
        return alternateData;
      }
      
      console.log("No data available from any endpoint");
      return [];
    }
  };

  return attemptFetch();
};

const fetchPorts = async () => {
  try {
    const token = localStorage.getItem("token");
    // First try to fetch from API
    try {
      const response = await fetch("http://localhost:5001/api/ports", {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("Successfully fetched ports from API:", data.length);
        return data;
      }
    } catch (apiError) {
      console.error("Error fetching ports from API:", apiError);
    }
    
    // Fallback to default ports list if API fails
  return [
      { id: "1", name: "Shanghai", country: "China" },
      { id: "2", name: "Singapore", country: "Singapore" },
      { id: "3", name: "Busan", country: "South Korea" },
      { id: "4", name: "Ningbo-Zhoushan", country: "China" },
      { id: "5", name: "Guangzhou Harbor", country: "China" },
      { id: "6", name: "Rotterdam", country: "Netherlands" },
      { id: "7", name: "Antwerp", country: "Belgium" },
      { id: "8", name: "Qingdao", country: "China" },
      { id: "9", name: "Los Angeles", country: "USA" },
      { id: "10", name: "Tianjin", country: "China" },
      { id: "11", name: "Dubai", country: "UAE" },
      { id: "12", name: "New York", country: "USA" },
      { id: "13", name: "Hamburg", country: "Germany" }
    ];
  } catch (error) {
    console.error("Error in fetchPorts:", error);
    return [];
  }
};

const CompanyDashboard = () => {
  const { toast } = useToast();
  const [companyName, setCompanyName] = useState("Company");
  const [currentTab, setCurrentTab] = useState("overview");
  const [newProductData, setNewProductData] = useState({
    name: "",
    stock: "",
    hsCode: "",
    unitCost: "",
  });

  const { data: profileData, error: profileError } = useQuery({
    queryKey: ["companyProfile"],
    queryFn: fetchCompanyProfile,
  });

  const {
    data: statsData,
    error: statsError,
    isLoading: statsLoading,
  } = useQuery({
    queryKey: ["companyStats"],
    queryFn: fetchCompanyStats,
  });

  const {
    data: shipments,
    error: shipmentsError,
    isLoading: shipmentsLoading,
  } = useQuery({
    queryKey: ["companyShipments"],
    queryFn: fetchCompanyShipments,
  });

  const {
    data: transactions,
    error: transactionsError,
    isLoading: transactionsLoading,
  } = useQuery({
    queryKey: ["companyTransactions"],
    queryFn: fetchCompanyTransactions,
  });

  const queryClient = useQueryClient();

  const {
    data: products,
    error: productsError,
    isLoading: productsLoading,
    refetch: refetchProducts,
  } = useQuery({
    queryKey: ["companyProducts"],
    queryFn: fetchCompanyProducts,
  });

  // Add this state for formatted shipments
  const [formattedShipments, setFormattedShipments] = useState<FormattedShipment[]>([]);

  // Add this state for dialog control
  const [dialogOpen, setDialogOpen] = useState(false);

  // Add these new state variables for edit modal
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    stock: "",
    hsCode: "",
    unitCost: ""
  });

  // Add this new query for product requests
  const {
    data: productRequests,
    error: productRequestsError,
    isLoading: productRequestsLoading,
  } = useQuery({
    queryKey: ["productRequests"],
    queryFn: fetchProductRequests
  });

  // Check for saved approvals/rejections whenever product requests data changes
  useEffect(() => {
    // When product requests are fetched successfully, check localStorage for any saved approval/rejection status
    if (productRequests && productRequests.length > 0) {
      // Check companyApprovals in localStorage
      const companyApprovalsKey = 'companyApprovals';
      const savedApprovalsJSON = localStorage.getItem(companyApprovalsKey);
      
      if (savedApprovalsJSON) {
        try {
          const savedApprovals = JSON.parse(savedApprovalsJSON);
          const updatedRequests = productRequests.map(request => {
            const savedStatus = savedApprovals[request.id];
            if (savedStatus) {
              return {
                ...request,
                status: savedStatus.status === 'approved' ? 'approved' : 
                        savedStatus.status === 'rejected' ? 'rejected' : request.status,
                origin_port: savedStatus.originPort || request.origin_port
              };
            }
            return request;
          });
          
          // Update the cache with localStorage data
          queryClient.setQueryData(["productRequests"], updatedRequests);
          console.log("Updated product requests with saved approval statuses from localStorage");
        } catch (error) {
          console.error("Error processing saved approvals:", error);
        }
      }
      
      // Also check company-specific requestStatus
      const localStatusKey = `requestStatus_${profileData?.company_id || 'unknown'}`;
      const localStatusJSON = localStorage.getItem(localStatusKey);
      
      if (localStatusJSON) {
        try {
          const localStatus = JSON.parse(localStatusJSON);
          // Set the local request status from localStorage
          setLocalRequestStatus(localStatus);
          console.log("Loaded local request status from localStorage");
        } catch (error) {
          console.error("Error processing local status:", error);
        }
      }
    }
  }, [productRequests, profileData?.company_id, queryClient]);

  // Add these new state variables after other state declarations in the CompanyDashboard component
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [currentRequestId, setCurrentRequestId] = useState<string | null>(null);
  const [selectedOriginPort, setSelectedOriginPort] = useState<string>("Shanghai");
  const [processingRequest, setProcessingRequest] = useState(false);

  // Add this new query near your other useQuery hooks
  const {
    data: ports,
    error: portsError,
    isLoading: portsLoading,
  } = useQuery({
    queryKey: ["ports"],
    queryFn: fetchPorts,
  });

  // Add a new state variable to store locally approved/rejected requests
  const [localRequestStatus, setLocalRequestStatus] = useState<Record<string, {status: string, originPort?: string}>>({});

  useEffect(() => {
    if (profileData) {
      // If profile data includes a name property, use it
      if (profileData.name) {
        console.log("Setting company name from profile data:", profileData.name);
        setCompanyName(profileData.name);
      }
      // If it has email but no name (unlikely but just in case)
      else if (profileData.email) {
        console.log("Setting company name from email:", profileData.email);
        setCompanyName(profileData.email);
      }
    }

    if (
      profileError ||
      statsError ||
      shipmentsError ||
      transactionsError ||
      productsError
    ) {
      toast({
        title: "Error loading dashboard data",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    }
  }, [
    profileData,
    profileError,
    statsError,
    shipmentsError,
    transactionsError,
    productsError,
    toast,
  ]);

  useEffect(() => {
    // Format shipments data if needed
    if (shipments && Array.isArray(shipments)) {
      // Explicitly type the shipment parameter as ApiShipment
      const formatted = shipments.map((shipment: ApiShipment): FormattedShipment => ({
        id: shipment.id || '',
        productName: shipment.product || shipment.product_name || '',
        quantity: shipment.quantity || 0,
        originPort: shipment.originPort || shipment.origin_port || '',
        destinationPort: shipment.destinationPort || shipment.destination_port || '',
        status: shipment.status || 'pending',
        estimatedDelivery: shipment.estimatedDelivery || shipment.estimated_delivery || null,
        progressPercentage: shipment.progressPercentage || shipment.progress_percentage || 0
      }));
      setFormattedShipments(formatted);
    }
  }, [shipments]);

  const handleEditProduct = (product: any) => {
    // Set the product to be edited and initialize form data
    setEditingProduct(product);
    setEditFormData({
      name: product.name || "",
      stock: product.stock?.toString() || "0",
      hsCode: product.hsCode || "",
      unitCost: product.unitCost?.toString() || "0"
    });
    
    // Open the edit dialog
    setEditDialogOpen(true);
  };

  const handleEditSubmit = async () => {
    const token = localStorage.getItem("token");
    if (!token || !editingProduct) {
      toast({ 
        title: "Error", 
        description: "Missing authentication or product data", 
        variant: "destructive" 
      });
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:5001/api/products/${editingProduct.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editFormData.name,
          stock: Number(editFormData.stock),
          hsCode: editFormData.hsCode,
          unitCost: Number(editFormData.unitCost)
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server responded with status ${response.status}`);
      }
      
      // Close the dialog
      setEditDialogOpen(false);
      
      toast({ 
        title: "Product Updated", 
        description: `${editFormData.name} has been updated successfully.` 
      });
      
      // Refresh the products list
      queryClient.invalidateQueries({ queryKey: ["companyProducts"] });
      
    } catch (error: any) {
      console.error("Error updating product:", error);
      toast({ 
        title: "Failed to Update Product", 
        description: error.message || "An unknown error occurred", 
        variant: "destructive" 
      });
    }
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDeleteProduct = (productId: string) => {
    console.log("Delete product:", productId);
  };

  const handleAddProduct = async () => {
    console.log("Add new product:", newProductData);
    
    const token = localStorage.getItem("token");
    if (!token) {
      toast({ 
        title: "Authentication Error", 
        description: "You must be logged in to add products", 
        variant: "destructive" 
      });
      return;
    }

    try {
      // Extract companyId from token with better error handling
      let companyId;
      try {
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          // Try multiple possible fields for company ID
          companyId = payload.companyId || payload.company_id || payload.id || payload.userId;
          
          if (!companyId) {
            console.warn("Token payload:", payload);
            throw new Error("No company ID found in token payload");
          }
        } else {
          throw new Error("Invalid token format");
        }
      } catch (error) {
        console.error("Error parsing token:", error);
        throw new Error("Failed to extract company ID from token");
      }

      console.log("Sending product data to API:", {
        name: newProductData.name,
        stock: Number(newProductData.stock),
        hsCode: newProductData.hsCode,
        unitCost: Number(newProductData.unitCost),
        companyId
      });

      const res = await fetch(`http://localhost:5001/api/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newProductData.name,
          stock: Number(newProductData.stock),
          hsCode: newProductData.hsCode,
          unitCost: Number(newProductData.unitCost),
          companyId
        })
      });

      console.log("API Response status:", res.status);
      
      const data = await res.json();
      console.log("API Response data:", data);

      if (!res.ok) {
        throw new Error(data.error || `Server responded with status ${res.status}`);
      }

      toast({ 
        title: "Product Added Successfully", 
        description: `${newProductData.name} has been added to your products.` 
      });
      
      // Reset form
      setNewProductData({ name: "", stock: "", hsCode: "", unitCost: "" });
      
      // Close the dialog
      setDialogOpen(false);
      
      // Refresh the products list - this is the key line for updating the UI
      queryClient.invalidateQueries({ queryKey: ["companyProducts"] });
      
    } catch (error: any) {
      console.error("Error adding product:", error);
      
      toast({ 
        title: "Failed to Add Product", 
        description: error.message || "An unknown error occurred", 
        variant: "destructive" 
      });
    }
  };

  // Replace the handleApproveRequest function with this enhanced version
  const handleApproveRequest = async (requestId: string) => {
    setCurrentRequestId(requestId);
    setApprovalDialogOpen(true);
  };

  // Update the confirmApprovalWithOriginPort function to ensure the approval is saved properly to both the database and localStorage
  const confirmApprovalWithOriginPort = async () => {
    try {
      setProcessingRequest(true);
      console.log(`Approving shipment ${currentRequestId} with origin port: ${selectedOriginPort}`);
      
      if (!currentRequestId) {
        throw new Error("No request ID found for approval");
      }

      // Create a unique key for storing approval data
      const companyApprovalsKey = 'companyApprovals';
      
      // Get existing approvals or initialize empty object
      const existingApprovalsJSON = localStorage.getItem(companyApprovalsKey) || '{}';
      let existingApprovals = {};
      try {
        existingApprovals = JSON.parse(existingApprovalsJSON);
      } catch (error) {
        console.error("Error parsing existing approvals:", error);
      }
      
      // Create the approval data
      const approvalData = {
        status: 'approved',
        originPort: selectedOriginPort,
        approvedAt: new Date().toISOString(),
        approvedBy: companyName || 'Company'
      };
      
      // Save to localStorage FIRST to ensure data is available even if API call fails
      existingApprovals[currentRequestId] = approvalData;
      localStorage.setItem(companyApprovalsKey, JSON.stringify(existingApprovals));
      console.log(`Saved approval data to localStorage for shipment ${currentRequestId}`);
      
      // Store approval in memory for UI updates
      let approvalUpdateSuccess = false;
      
      // Then try to update the shipment directly in the database
      try {
        const token = localStorage.getItem('token');
        if (token) {
          console.log(`Attempting to update shipment ${currentRequestId} status in database`);
          
          const updateResponse = await fetch(`http://localhost:5001/api/shipments/${currentRequestId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              status: 'approved',
              origin_port: selectedOriginPort
            })
          });
          
          if (updateResponse.ok) {
            console.log(`Successfully updated shipment ${currentRequestId} in database`);
            approvalUpdateSuccess = true;
          } else {
            const errorText = await updateResponse.text();
            console.error(`Error updating shipment in database: ${updateResponse.status} - ${errorText}`);
            
            // If direct update fails, try the shipment approval endpoint as fallback
            console.log("Trying shipment approval endpoint as fallback");
            const approvalResponse = await fetch(`http://localhost:5001/api/shipments/approve/${currentRequestId}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                origin_port: selectedOriginPort
              })
            });
            
            if (approvalResponse.ok) {
              console.log(`Successfully approved shipment ${currentRequestId} via approval endpoint`);
              approvalUpdateSuccess = true;
            } else {
              const approvalErrorText = await approvalResponse.text();
              console.error(`Error approving shipment via approval endpoint: ${approvalResponse.status} - ${approvalErrorText}`);
            }
          }
        }
      } catch (dbError) {
        console.error("Error updating shipment in database:", dbError);
      }
      
      // Update local state for immediate UI feedback
      if (productRequests) {
        const updatedRequests = productRequests.map(request => {
          if (request.id === currentRequestId) {
            return {
              ...request,
              status: 'approved',
              origin_port: selectedOriginPort
            };
          }
          return request;
        });
        
        queryClient.setQueryData(["productRequests"], updatedRequests);
        console.log(`Updated local shipment requests state for shipment ${currentRequestId}`);
      }
      
      // Update local request status for persistence between component mounts
      const localStatusKey = `requestStatus_${profileData?.company_id || 'unknown'}`;
      const existingStatusJSON = localStorage.getItem(localStatusKey) || '{}';
      let existingStatus = {};
      
      try {
        existingStatus = JSON.parse(existingStatusJSON);
      } catch (e) {
        console.error("Error parsing existing status:", e);
      }
      
      existingStatus[currentRequestId] = {
        status: 'approved',
        originPort: selectedOriginPort,
        timestamp: new Date().toISOString() // Add timestamp to track when this was approved
      };
      
      localStorage.setItem(localStatusKey, JSON.stringify(existingStatus));
      console.log(`Updated local request status for company ${profileData?.company_id || 'unknown'}`);
      
      // Close modal and complete the process
      setApprovalDialogOpen(false);
      setProcessingRequest(false);
      
      // Show success message
    toast({
        title: "Shipment Approved",
        description: "The shipment has been approved and saved successfully!"
      });
      
      // Refresh the data after a short delay to reflect changes
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["productRequests"] });
      }, 500);
      
      console.log("Approval process completed");
    } catch (error) {
      console.error("Error in approval process:", error);
      setProcessingRequest(false);
      setApprovalDialogOpen(false);
      
      // Show error message
      toast({
        title: "Error",
        description: "Failed to approve the shipment. Please try again."
      });
    }
  };

  // Update the handleRejectRequest function to prioritize database update
  const handleRejectRequest = async (requestId: string) => {
    try {
      setProcessingRequest(true);
      
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }
      
      // Get the request data
      const request = productRequests?.find(req => req.id === requestId);
      if (!request) {
        throw new Error("Request not found");
      }

      console.log("Rejecting product request:", {
        id: requestId,
        product: request.product_name
      });

      // Create a unique key for storing rejection data in localStorage FIRST
      const companyApprovalsKey = 'companyApprovals';
      const existingApprovalsJSON = localStorage.getItem(companyApprovalsKey) || '{}';
      let existingApprovals = {};
      
      try {
        existingApprovals = JSON.parse(existingApprovalsJSON);
      } catch (error) {
        console.error("Error parsing existing approvals:", error);
      }
      
      // Create the rejection data
      const rejectionData = {
        status: 'rejected',
        rejectedAt: new Date().toISOString(),
        rejectedBy: companyName || 'Company'
      };
      
      // Save to localStorage first
      existingApprovals[requestId] = rejectionData;
      localStorage.setItem(companyApprovalsKey, JSON.stringify(existingApprovals));
      console.log(`Saved rejection data to localStorage for shipment ${requestId}`);

      // Try to update the status in the database
      let apiSuccess = false;
      let errorMessage = "Failed to reject request";

      try {
        const response = await fetch(`http://localhost:5001/api/shipments/${requestId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            status: "rejected"
          })
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Successfully rejected shipment in database:", data);
          apiSuccess = true;
        } else {
          // Try to extract error details
          try {
            const errorData = await response.json();
            console.error("API error details:", errorData);
            errorMessage = errorData.message || errorData.error || `Server responded with status ${response.status}`;
          } catch (e) {
            console.error("Could not parse error response:", e);
            errorMessage = `Server responded with status ${response.status}`;
          }
          console.log("Rejection endpoint failed:", errorMessage);
        }
      } catch (apiError) {
        console.error("Error with rejection API call:", apiError);
      }

      // Store the rejected status locally for immediate UI feedback
      setLocalRequestStatus(prev => ({
        ...prev,
        [requestId]: {
          status: 'rejected',
          timestamp: new Date().toISOString()
        }
      }));

      // Update local request status for persistence between component mounts
      const localStatusKey = `requestStatus_${profileData?.company_id || 'unknown'}`;
      const existingStatusJSON = localStorage.getItem(localStatusKey) || '{}';
      let existingStatus = {};
      
      try {
        existingStatus = JSON.parse(existingStatusJSON);
      } catch (e) {
        console.error("Error parsing existing status:", e);
      }
      
      existingStatus[requestId] = {
        status: 'rejected',
        timestamp: new Date().toISOString()
      };
      
      localStorage.setItem(localStatusKey, JSON.stringify(existingStatus));
      console.log(`Updated local request status for company ${profileData?.company_id || 'unknown'}`);

      // Optimistically update the UI
      const updatedRequests = productRequests?.map(req => 
        req.id === requestId 
          ? { ...req, status: 'rejected' as const } 
          : req
      ) || [];
      
      // Update the cache directly
      queryClient.setQueryData(["productRequests"], updatedRequests);

    toast({
        title: apiSuccess ? "Request Rejected" : "Request Marked as Rejected",
        description: `The ${request.product_name} request has been rejected.`,
      });
      
      // Refresh the data after a short delay
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["productRequests"] });
      }, 500);
      
    } catch (error) {
      console.error("Error rejecting request:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to reject the request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingRequest(false);
    }
  };

  const stats = statsData || {
    totalTransactions: 0,
    transactionValue: 0,
    activeShipments: 0,
    pendingCustoms: 0,
  };

  const formatProductsData = (productsData: any[]) => {
    if (!productsData || !Array.isArray(productsData)) {
      return [];
    }
    
    // Get the current company ID from token
    let currentCompanyId;
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          currentCompanyId = payload.companyId || payload.company_id || payload.id || payload.userId;
        }
      }
    } catch (error) {
      console.error("Error extracting company ID:", error);
    }
    
    // Filter out products that don't belong to the current company
    const filteredProducts = currentCompanyId ? 
      productsData.filter(product => 
        !product.company_id || product.company_id === currentCompanyId
      ) : 
      productsData;
    
    if (currentCompanyId && filteredProducts.length < productsData.length) {
      console.log(`Filtered out ${productsData.length - filteredProducts.length} products that don't belong to company ${currentCompanyId}`);
    }
    
    return filteredProducts.map(product => {
      // Parse unit_cost as a number, handling both string and number inputs
      let parsedUnitCost = 0;
      try {
        if (typeof product.unit_cost === 'string') {
          parsedUnitCost = parseFloat(product.unit_cost);
        } else if (typeof product.unit_cost === 'number') {
          parsedUnitCost = product.unit_cost;
        }
        
        if (isNaN(parsedUnitCost)) {
          parsedUnitCost = 0;
        }
      } catch (e) {
        parsedUnitCost = 0;
      }
      
      // Parse stock as an integer
      let parsedStock = 0;
      try {
        parsedStock = parseInt(product.stock);
        if (isNaN(parsedStock)) {
          parsedStock = 0;
        }
      } catch (e) {
        parsedStock = 0;
      }
      
      return {
        id: product.id,
        name: product.name || 'Unnamed Product',
        hsCode: product.hs_code || product.hsCode || 'N/A',
        stock: parsedStock,
        unitCost: parsedUnitCost
      };
    });
  };

  // Add this effect to load saved request statuses when the component mounts
  useEffect(() => {
    // Load local request status from localStorage
    if (profileData?.company_id) {
      const localStatusKey = `requestStatus_${profileData.company_id}`;
      const localStatusJSON = localStorage.getItem(localStatusKey);
      
      if (localStatusJSON) {
        try {
          const savedStatus = JSON.parse(localStatusJSON);
          setLocalRequestStatus(savedStatus);
          console.log("Loaded saved request statuses from localStorage");
        } catch (error) {
          console.error("Error loading saved request statuses:", error);
        }
      }
    }
  }, [profileData?.company_id]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation isAuthenticated={true} userType="company" />

      <main className="flex-1 bg-gray-50">
        <div className="trade-container py-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold mb-2">
                Welcome back {companyName}
              </h1>
              <p className="text-gray-600">Here's what's happening with your business today.</p>
            </div>
            <div className="flex mt-4 md:mt-0 space-x-2">
              <Button variant="outline" size="sm" className="flex items-center">
                <Download className="mr-1 h-4 w-4" />
                Export Data
              </Button>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    size="sm" 
                    className="bg-trade-blue hover:bg-blue-700 flex items-center"
                    onClick={() => setDialogOpen(true)}
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    New Product
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Product</DialogTitle>
                    <DialogDescription>
                      Fill in the product details below to add a new product to your inventory.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input placeholder="Product Name" value={newProductData.name} onChange={(e) => setNewProductData({ ...newProductData, name: e.target.value })} />
                    <Input placeholder="Stock" value={newProductData.stock} onChange={(e) => setNewProductData({ ...newProductData, stock: e.target.value })} />
                    <Input placeholder="HS Code" value={newProductData.hsCode} onChange={(e) => setNewProductData({ ...newProductData, hsCode: e.target.value })} />
                    <Input placeholder="Unit Cost" value={newProductData.unitCost} onChange={(e) => setNewProductData({ ...newProductData, unitCost: e.target.value })} />
                    <Button 
                      className="w-full bg-trade-blue hover:bg-blue-700" 
                      onClick={handleAddProduct}
                    >
                      Submit
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="shipments">Shipments</TabsTrigger>
              <TabsTrigger value="requests">Product Requests</TabsTrigger>
            </TabsList>
            <TabsContent value="overview">
              {statsLoading ? (
                <div className="text-center py-4">Loading stats...</div>
              ) : (
                <StatsCards stats={stats} userType="company" />
              )}
            </TabsContent>
            <TabsContent value="products">
              {productsLoading ? (
                <div className="text-center py-4">Loading products...</div>
              ) : productsError ? (
                <div className="text-center py-4 text-red-500">
                  Error loading products: {productsError.message}
                </div>
              ) : products && products.length > 0 ? (
                <>
                  {/* For debugging - you can remove this in production */}
                  <div className="hidden">
                    Raw data: {JSON.stringify(products)}
                  </div>
                  <ProductsList
                    products={formatProductsData(products)}
                    onEdit={handleEditProduct}
                    onDelete={handleDeleteProduct}
                  />
                </>
              ) : (
                <div className="text-center py-8 bg-white rounded-lg shadow">
                  <div className="mb-4">
                    <Package className="h-12 w-12 mx-auto text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No Products Found</h3>
                  <p className="text-gray-500 mb-4">
                    You haven't added any products yet. Get started by adding your first product.
                  </p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="bg-trade-blue hover:bg-blue-700">
                        <Plus className="mr-1 h-4 w-4" />
                        Add Your First Product
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Product</DialogTitle>
                        <DialogDescription>
                          Fill in the product details below to add a new product to your inventory.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Input placeholder="Product Name" value={newProductData.name} onChange={(e) => setNewProductData({ ...newProductData, name: e.target.value })} />
                        <Input placeholder="Stock" value={newProductData.stock} onChange={(e) => setNewProductData({ ...newProductData, stock: e.target.value })} />
                        <Input placeholder="HS Code" value={newProductData.hsCode} onChange={(e) => setNewProductData({ ...newProductData, hsCode: e.target.value })} />
                        <Input placeholder="Unit Cost" value={newProductData.unitCost} onChange={(e) => setNewProductData({ ...newProductData, unitCost: e.target.value })} />
                        <Button 
                          className="w-full bg-trade-blue hover:bg-blue-700" 
                          onClick={handleAddProduct}
                        >
                          Submit
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </TabsContent>
            <TabsContent value="transactions">
              {transactionsLoading ? (
                <div className="text-center py-4">Loading transactions...</div>
              ) : (
                <TransactionsList transactions={transactions || []} />
              )}
            </TabsContent>
            <TabsContent value="shipments">
              {shipmentsLoading ? (
                <div className="text-center py-4">Loading shipments...</div>
              ) : formattedShipments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {formattedShipments.map((shipment) => (
                    <ShipmentStatusCard key={shipment.id} shipment={shipment} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 bg-white rounded-lg shadow-sm">
                  <p className="text-gray-500">No shipments found</p>
                </div>
              )}
            </TabsContent>
            <TabsContent value="requests">
              {productRequestsLoading ? (
                <div className="text-center py-4">Loading product requests...</div>
              ) : productRequestsError ? (
                <div className="text-center py-4 text-red-500">
                  Error loading product requests
                </div>
              ) : productRequests && productRequests.length > 0 ? (
                <div className="grid gap-6">
                  {productRequests.map((request) => {
                    // Get local status if available
                    const localStatus = localRequestStatus[request.id];
                    const effectiveStatus = localStatus ? localStatus.status : request.status;
                    
                    return (
                    <Card key={request.id} className="shadow-sm">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-lg">{request.product_name}</CardTitle>
                          <Badge 
                              className={`px-2 py-1.5 ${
                                effectiveStatus === 'pending' 
                                ? 'bg-yellow-500' 
                                  : effectiveStatus === 'approved' 
                                  ? 'bg-green-500' 
                                  : 'bg-red-500'
                            }`}
                          >
                              {effectiveStatus === 'pending' ? 'Pending' : 
                               effectiveStatus === 'approved' ? 'Approved' : 'Rejected'}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-500">Quantity</p>
                            <p className="font-medium">{request.quantity} units</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">User</p>
                              <p className="font-medium">{request.user_email}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Date Requested</p>
                              <p className="font-medium">{new Date(request.request_date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}</p>
                          </div>
                            {localStatus && localStatus.status === 'approved' && localStatus.originPort && (
                              <div>
                                <p className="text-sm text-gray-500">Origin Port</p>
                                <p className="font-medium">{localStatus.originPort}</p>
                              </div>
                            )}
                        </div>
                        
                          {effectiveStatus === 'pending' && (
                          <div className="flex justify-end space-x-2 mt-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="border-red-500 text-red-500 hover:bg-red-50"
                              onClick={() => handleRejectRequest(request.id)}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                            <Button 
                              size="sm" 
                              className="bg-green-500 hover:bg-green-600"
                              onClick={() => handleApproveRequest(request.id)}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 bg-white rounded-lg shadow">
                  <div className="mb-4">
                    <ShoppingCart className="h-12 w-12 mx-auto text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No Product Requests</h3>
                  <p className="text-gray-500 mb-4">
                    You don't have any product requests from users at the moment.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Make changes to your product details here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                name="name"
                value={editFormData.name}
                onChange={handleEditFormChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="stock" className="text-right">
                Stock
              </Label>
              <Input
                id="stock"
                name="stock"
                type="number"
                value={editFormData.stock}
                onChange={handleEditFormChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="hsCode" className="text-right">
                HS Code
              </Label>
              <Input
                id="hsCode"
                name="hsCode"
                value={editFormData.hsCode}
                onChange={handleEditFormChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="unitCost" className="text-right">
                Unit Cost
              </Label>
              <Input
                id="unitCost"
                name="unitCost"
                type="number"
                step="0.01"
                value={editFormData.unitCost}
                onChange={handleEditFormChange}
                className="col-span-3"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSubmit}>
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Approve Product Request</DialogTitle>
            <DialogDescription>
              Select the origin port for the approved product request.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="originPort" className="text-right">
                Origin Port
              </Label>
              <Select
                value={selectedOriginPort}
                onValueChange={setSelectedOriginPort}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select origin port" />
                </SelectTrigger>
                <SelectContent>
                  {portsLoading ? (
                    <SelectItem value="loading" disabled>Loading ports...</SelectItem>
                  ) : ports && ports.length > 0 ? (
                    ports.map((port) => (
                      <SelectItem key={port.id} value={port.name}>
                        {port.name}, {port.country}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>No ports available</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setApprovalDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmApprovalWithOriginPort}>
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CompanyDashboard;