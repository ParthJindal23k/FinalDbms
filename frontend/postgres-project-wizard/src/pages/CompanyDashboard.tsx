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

const fetchCompanyProfile = async () => {
  try {
    // Call the backend API to get the company profile
    const result = await get('/dashboard/user-profile');
    console.log("Company profile data:", result);
    return result;
  } catch (error) {
    console.error("Error fetching company profile:", error);
    // If there's an error, fall back to a default but log the error
    return { name: "!", id: "", email: "" };
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
  
  // Extract companyId from token
  let companyId;
  try {
    const tokenParts = token.split('.');
    if (tokenParts.length === 3) {
      const payload = JSON.parse(atob(tokenParts[1]));
      companyId = payload.companyId;
    }
  } catch (error) {
    console.error("Error parsing token:", error);
  }
  
  // If we couldn't get the companyId, try to fetch without it
  const url = companyId 
    ? `http://localhost:5001/api/products?companyId=${companyId}` 
    : 'http://localhost:5001/api/products';
    
  const response = await fetch(url, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.statusText}`);
  }
  
  return response.json();
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
    console.log("Edit product:", product);
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
      // Extract companyId from token
      let companyId;
      try {
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          companyId = payload.companyId;
        }
      } catch (error) {
        console.error("Error parsing token:", error);
      }
      
      if (!companyId) {
        companyId = "00000000-0000-0000-0000-000000000000"; // Fallback
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
      const closeDialogButton = document.querySelector('[data-state="open"] button[aria-label="Close"]');
      if (closeDialogButton instanceof HTMLElement) {
        closeDialogButton.click();
      }
      
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

  const stats = statsData || {
    totalTransactions: 0,
    transactionValue: 0,
    activeShipments: 0,
    pendingCustoms: 0,
  };

  const formatProductsData = (productsData: any[]) => {
    if (!productsData || !Array.isArray(productsData)) {
      console.log("Products data is not an array:", productsData);
      return [];
    }
    
    console.log("Raw products data:", JSON.stringify(productsData));
    
    return productsData.map(product => {
      // Log each product to help debug
      console.log("Processing product:", product);
      console.log("unitCost type:", typeof product.unit_cost, "value:", product.unit_cost);
      
      // Try to parse the unitCost if it's a string
      let parsedUnitCost = 0;
      try {
        if (product.unit_cost !== undefined) {
          parsedUnitCost = parseFloat(product.unit_cost);
        } else if (product.unitCost !== undefined) {
          parsedUnitCost = parseFloat(product.unitCost);
        }
      } catch (e) {
        console.error("Error parsing unitCost:", e);
      }
      
      return {
        id: product.id,
        name: product.name || 'Unnamed Product',
        hsCode: product.hs_code || product.hsCode || 'N/A',
        stock: parseInt(product.stock) || 0,
        unitCost: parsedUnitCost || 0
      };
    });
  };

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
                      onClick={async () => {
                        await handleAddProduct();
                        // Close dialog after successful submission
                        setDialogOpen(false);
                      }}
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
                          onClick={async () => {
                            await handleAddProduct();
                            // Close dialog after successful submission
                            setDialogOpen(false);
                          }}
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
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CompanyDashboard;