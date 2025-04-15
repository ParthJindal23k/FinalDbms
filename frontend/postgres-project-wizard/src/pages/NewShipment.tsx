import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Search, Package, DollarSign, Barcode, PackageCheck, ArrowRight, Check, ShoppingCart, Minus, Plus, AlertCircle, Loader2, MapPin } from "lucide-react";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Card, CardContent } from "../components/ui/card";
import { useToast } from "../components/ui/use-toast";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Label } from "../components/ui/label";

const NewShipment = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isCreatingShipment, setIsCreatingShipment] = useState(false);
  
  const [destinationPort, setDestinationPort] = useState("");
  const [customDestination, setCustomDestination] = useState("");
  
  const [importTaxRate, setImportTaxRate] = useState(0);
  const [importTaxLoading, setImportTaxLoading] = useState(false);
  const [countryName, setCountryName] = useState("");
  
  const portOptions = [
    "Los Angeles",
    "New York",
    "Rotterdam",
    "Singapore",
    "Shanghai",
    "Hamburg",
    "Dubai",
    "Mumbai",
    "Sydney",
    "Other"
  ];
  
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const response = await axios.get("/api/products", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log("All products fetched:", response.data);
        setAllProducts(response.data);
        setResults(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setError("Failed to load products. Please try again.");
        setLoading(false);
      }
    };

    fetchAllProducts();
  }, []);

  useEffect(() => {
    const fetchImportTaxRate = async () => {
      if (!destinationPort) {
        console.log("No destination selected, setting tax rate to 0");
        setImportTaxRate(0);
        setCountryName("");
        return;
      }

      // For custom destinations, we also need to fetch from the API
      const cityToQuery = destinationPort === "Other" ? 
        (customDestination.trim() || "Unknown") : 
        destinationPort;

      try {
        setImportTaxLoading(true);
        
        console.log("Fetching tax rate for:", cityToQuery);
        const apiUrl = `http://localhost:6253/tax-by-city?city=${encodeURIComponent(cityToQuery)}`;
        
        const response = await axios.get(apiUrl);
        
        // Logging for debugging
        console.log("Tax API response data:", response.data);
        
        // This is the critical part - get the tax rate from the API
        if (response.data && response.data.import !== undefined) {
          const importRate = parseFloat(response.data.import);
          if (!isNaN(importRate)) {
            console.log("Setting import tax rate from API:", importRate);
            // This line is crucial - we must set the rate from the API
            setImportTaxRate(importRate);
            setCountryName(response.data.country || cityToQuery);
          } else {
            console.warn("API returned invalid import tax rate:", response.data.import);
            // Do not use a fallback rate, this is causing the issue
            setImportTaxRate(0);
          }
        } else {
          console.warn("API response missing import tax data:", response.data);
          // Do not use a fallback rate, this is causing the issue
          setImportTaxRate(0);
        }
      } catch (err) {
        console.error("Failed to fetch import tax rate:", err);
        // Do not use a fallback rate, this is causing the issue
        setImportTaxRate(0);
      } finally {
        setImportTaxLoading(false);
      }
    };

    fetchImportTaxRate();
  }, [destinationPort, customDestination]);

  const updateQuantity = (productId, newQuantity) => {
    const product = selectedProducts.find(p => p.id === productId);
    if (!product) return;
    
    let quantity = parseInt(newQuantity);
    if (isNaN(quantity) || quantity < 1) {
      quantity = 1;
    }
    
    const stock = parseInt(product.stock || 0);
    
    if (quantity > stock) {
      setErrorMessage(`You cannot add more than ${stock} units of "${product.name}" (available stock)`);
      setShowErrorDialog(true);
      
      quantity = stock;
    }
    
    setSelectedProducts(
      selectedProducts.map(p => {
        if (p.id === productId) {
          return { ...p, quantity };
        }
        return p;
      })
    );
  };

  const createShipment = async () => {
    if (selectedProducts.length === 0) {
      toast({
        title: "No products selected",
        description: "Please select at least one product for your shipment.",
        variant: "destructive",
      });
      return;
    }
    
    let finalDestination = destinationPort;
    if (destinationPort === "Other") {
      if (!customDestination.trim()) {
        toast({
          title: "Destination Required",
          description: "Please enter a destination port for your shipment.",
          variant: "destructive",
        });
        return;
      }
      finalDestination = customDestination.trim();
    }

    if (!finalDestination) {
      toast({
        title: "Destination Required",
        description: "Please select a destination port for your shipment.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCreatingShipment(true);
      
      const token = localStorage.getItem("token");
      if (!token) {
        toast({
          title: "Authentication required",
          description: "Please log in to create a shipment.",
          variant: "destructive",
        });
        setIsCreatingShipment(false);
        return;
      }

      // Create shipments one by one to match backend expectations
      const shipmentPromises = selectedProducts.map(async (product) => {
        const companyId = product.company_id || "00000000-0000-0000-0000-000000000000";
        
        console.log(`Creating shipment for product: ${product.name} (ID: ${product.id}) for company: ${companyId}`);
        
        // Send individual shipment requests directly as expected by the backend
        const response = await axios.post(
          "http://localhost:5001/api/shipments",
          {
            productId: product.id,
            companyId: companyId,
            quantity: product.quantity || 1,
            originPort: "Shanghai",
            destinationPort: finalDestination,
            status: "pending",
            estimatedDelivery: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json"
            }
          }
        );
        
        console.log(`Shipment created for product ${product.name}:`, response.data);
        return response.data;
      });
      
      // Wait for all shipment requests to complete
      const results = await Promise.all(shipmentPromises);
      console.log("All shipments created successfully:", results);
      
      toast({
        title: "Shipments Created",
        description: `${selectedProducts.length} shipment(s) have been created successfully.`,
        duration: 3000,
      });

      setTimeout(() => {
        navigate("/user-dashboard");
      }, 1000);
    } catch (error) {
      console.error("Error creating shipments:", error);
      
      const errorMsg = error.response?.data?.error || 
                      "An unexpected error occurred. Please try again.";
      
      toast({
        title: "Failed to Create Shipments",
        description: errorMsg,
        variant: "destructive",
        duration: 5000,
      });
      
      setIsCreatingShipment(false);
    }
  };

  const handleSelectProduct = (product) => {
    const isSelected = selectedProducts.some(p => p.id === product.id);
    
    if (isSelected) {
      setSelectedProducts(selectedProducts.filter(p => p.id !== product.id));
    } else {
      const price = parseFloat(product.price || product.unitcost || product.unit_cost) || 0;
      
      setSelectedProducts([...selectedProducts, { 
        ...product, 
        price: price,
        quantity: 1 
      }]);
      
      toast({
        title: "Product Added",
        description: `${product.name} has been added to your selection.`,
        duration: 3000,
      });
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim() === "") {
      setResults(allProducts);
      return;
    }

    const searchTerm = query.toLowerCase().trim();
    const filteredResults = allProducts.filter((product) => {
      const nameMatch = product.name && 
        product.name.toLowerCase().includes(searchTerm);
      
      const hsCode = product.hscode || product.hs_code || "";
      const hsCodeMatch = hsCode.toString().toLowerCase().includes(searchTerm);
      
      return nameMatch || hsCodeMatch;
    });
    
    setResults(filteredResults);
  };

  const calculateSubtotal = () => {
    console.log("Calculating subtotal with products:", selectedProducts);
    return selectedProducts.reduce((total, product) => {
      const price = parseFloat(product.price) || 0;
      const quantity = parseInt(product.quantity) || 1;
      const itemTotal = price * quantity;
      console.log(`Product ${product.name}: price=${price}, quantity=${quantity}, total=${itemTotal}`);
      return total + itemTotal;
    }, 0);
  };

  const calculateImportTax = (subtotal) => {
    console.log(`Calculating import tax: subtotal=${subtotal}, importTaxRate=${importTaxRate}%`);
    const taxRate = parseFloat(importTaxRate);
    if (isNaN(taxRate)) {
      console.warn("Tax rate is not a number:", importTaxRate);
      return 0;
    }
    return (subtotal * taxRate) / 100;
  };

  const calculateTotal = (subtotal, importTax) => {
    return subtotal + importTax;
  };

  const subtotal = calculateSubtotal();
  const importTaxAmount = calculateImportTax(subtotal);
  const totalWithTax = calculateTotal(subtotal, importTaxAmount);

  console.log("Final calculated values:", {
    subtotal,
    importTaxRate,
    importTaxAmount,
    totalWithTax
  });

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navigation isAuthenticated={true} userType="user" />
      
      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2 text-gray-800">Create New Shipment</h1>
              <p className="text-gray-600">
                Select products and specify quantities for your shipment.
              </p>
            </div>
            
            {selectedProducts.length > 0 && (
              <div className="bg-trade-blue text-white rounded-full px-4 py-2 flex items-center">
                <ShoppingCart className="mr-2 h-5 w-5" />
                <span>{selectedProducts.length} selected</span>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Search className="mr-2 h-5 w-5 text-trade-blue" />
              Find Products
            </h2>
            
            <form onSubmit={handleSearch} className="flex gap-3 mb-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by product name or HS code..."
                  className="pl-10 h-12"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <Button 
                type="submit" 
                className="bg-trade-blue hover:bg-blue-700 h-12 px-5"
              >
                Search
              </Button>
            </form>
            
            <p className="text-sm text-gray-500">
              {results.length} products available
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-trade-blue mx-auto mb-4"></div>
              <p className="text-gray-600">Loading products...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg text-center">
              {error}
            </div>
          ) : results.length > 0 ? (
            <div>
              <h2 className="text-xl font-semibold mb-5 flex items-center">
                <Package className="mr-2 h-5 w-5 text-trade-blue" />
                {query ? "Search Results" : "Available Products"}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((product) => {
                  const name = product.name || "";
                  const hsCode = product.hscode || product.hs_code || "N/A";
                  const unitCost = product.unitcost || product.unit_cost || 0;
                  const stock = product.stock || 0;
                  
                  const selectedProduct = selectedProducts.find(p => p.id === product.id);
                  const isSelected = !!selectedProduct;
                  
                  return (
                    <Card 
                      key={product.id}
                      className={`overflow-hidden transition-all duration-200 hover:shadow-lg ${
                        isSelected ? 'ring-2 ring-trade-blue' : ''
                      }`}
                    >
                      <CardContent className="p-0">
                        <div className="p-5">
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="font-semibold text-lg text-gray-800 flex-1">
                              {name}
                            </h3>
                            <Badge className={stock > 10 ? 'bg-green-500' : stock > 0 ? 'bg-amber-500' : 'bg-red-500'}>
                              {stock > 10 ? 'In Stock' : stock > 0 ? 'Low Stock' : 'Out of Stock'}
                            </Badge>
                          </div>
                          
                          <div className="space-y-2 mb-4">
                            <div className="flex items-center text-gray-700">
                              <DollarSign className="h-4 w-4 mr-2 text-gray-500" />
                              <span className="font-medium">${unitCost}</span>
                            </div>
                            
                            <div className="flex items-center text-gray-700">
                              <Barcode className="h-4 w-4 mr-2 text-gray-500" />
                              <span>HS: {hsCode}</span>
                            </div>
                            
                            <div className="flex items-center text-gray-700">
                              <PackageCheck className="h-4 w-4 mr-2 text-gray-500" />
                              <span>Stock: {stock} units</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="border-t border-gray-100">
                          <Button 
                            onClick={() => handleSelectProduct(product)}
                            className={`w-full rounded-none h-12 flex items-center justify-center ${
                              isSelected
                                ? 'bg-trade-blue hover:bg-blue-600' 
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                            }`}
                            disabled={stock === 0}
                          >
                            {isSelected ? (
                              <>
                                <Check className="mr-2 h-4 w-4" />
                                Selected
                              </>
                            ) : stock === 0 ? (
                              <>Out of Stock</>
                            ) : (
                              <>Select Product</>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              
              {selectedProducts.length > 0 && (
                <div className="mt-8 bg-white rounded-lg shadow p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold mb-3">Selected Products ({selectedProducts.length})</h3>
                  
                  <div className="mb-4 max-h-60 overflow-y-auto">
                    <table className="w-full">
                      <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                          <th scope="col" className="px-4 py-3 text-left">Product</th>
                          <th scope="col" className="px-4 py-3 text-center">Quantity</th>
                          <th scope="col" className="px-4 py-3 text-right">Unit Price</th>
                          <th scope="col" className="px-4 py-3 text-right">Total</th>
                          <th scope="col" className="px-4 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {selectedProducts.map(product => {
                          const unitCost = parseFloat(product.unitcost || product.unit_cost) || 0;
                          const quantity = product.quantity || 1;
                          
                          return (
                            <tr key={product.id} className="bg-white">
                              <td className="px-4 py-3 text-sm text-gray-900">
                                <div className="font-medium">{product.name}</div>
                                <div className="text-xs text-gray-500">HS: {product.hscode || product.hs_code}</div>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-500 text-center">
                                <div className="flex items-center justify-center">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="h-7 w-7 p-0 rounded-full"
                                    onClick={() => updateQuantity(product.id, quantity - 1)}
                                    disabled={quantity <= 1}
                                  >
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  
                                  <span className="w-16 text-center mx-1">
                                    {quantity}
                                  </span>
                                  
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="h-7 w-7 p-0 rounded-full"
                                    onClick={() => updateQuantity(product.id, quantity + 1)}
                                    disabled={quantity >= (product.stock || 1)}
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-500 text-right">
                                ${unitCost.toFixed(2)}
                              </td>
                              <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                                ${(unitCost * quantity).toFixed(2)}
                              </td>
                              <td className="px-4 py-3 text-right">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="h-8 px-2 text-red-500 hover:bg-red-50 hover:text-red-600"
                                  onClick={() => handleSelectProduct(product)}
                                >
                                  Remove
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                        <tr className="border-t border-gray-200">
                          <td colSpan={3} className="py-2 px-2 text-right font-semibold">
                            Subtotal:
                          </td>
                          <td className="py-2 px-2 text-right font-bold">
                            ${isNaN(subtotal) ? "0.00" : subtotal.toFixed(2)}
                          </td>
                        </tr>
                        {importTaxRate > 0 && (
                          <>
                            <tr>
                              <td colSpan={3} className="py-2 px-2 text-right text-amber-700">
                                {importTaxLoading ? (
                                  <>
                                    <Loader2 className="inline mr-2 h-3 w-3 animate-spin" />
                                    Fetching import tax rate...
                                  </>
                                ) : (
                                  <>
                                    Import Tax for {destinationPort === "Other" ? customDestination : destinationPort} ({importTaxRate.toFixed(1)}%):
                                  </>
                                )}
                              </td>
                              <td className="py-2 px-2 text-right text-amber-700">
                                ${isNaN(importTaxAmount) ? "0.00" : importTaxAmount.toFixed(2)}
                              </td>
                            </tr>
                            <tr className="border-t border-gray-200">
                              <td colSpan={3} className="py-2 px-2 text-right font-bold">
                                Total with Import Tax:
                              </td>
                              <td className="py-2 px-2 text-right font-bold text-trade-blue">
                                ${isNaN(totalWithTax) ? "0.00" : totalWithTax.toFixed(2)}
                              </td>
                            </tr>
                          </>
                        )}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <div>
                      <p className="text-gray-600">
                        Total Products: <span className="font-semibold">{selectedProducts.length}</span>
                      </p>
                      <p className="text-gray-600">
                        Total Items: <span className="font-semibold">
                          {selectedProducts.reduce((sum, product) => sum + (parseInt(product.quantity) || 1), 0)}
                        </span>
                      </p>
                      <p className="text-gray-700 font-medium mt-1">
                        Total Value (with Import Tax): <span className="font-bold text-lg ml-1 text-trade-blue">
                          ${isNaN(totalWithTax) ? "0.00" : totalWithTax.toFixed(2)}
                        </span>
                      </p>
                    </div>
                    
                    <div className="flex flex-col items-end">
                      <div className="mb-4 w-64">
                        <Label htmlFor="destination-port" className="text-sm font-medium mb-2 block text-left">
                          Destination Port
                        </Label>
                        <Select value={destinationPort} onValueChange={setDestinationPort}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select destination port" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Major Ports</SelectLabel>
                              {portOptions.map(port => (
                                <SelectItem key={port} value={port}>{port}</SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        
                        {destinationPort === "Other" && (
                          <div className="mt-2">
                            <Input
                              id="custom-destination"
                              value={customDestination}
                              onChange={(e) => setCustomDestination(e.target.value)}
                              placeholder="Enter destination port"
                              className="w-full"
                            />
                          </div>
                        )}
                      </div>
                      
                      <Button 
                        className="bg-amber-600 hover:bg-amber-700 px-6 py-2"
                        onClick={createShipment}
                        disabled={isCreatingShipment || !destinationPort || (destinationPort === "Other" && !customDestination)}
                      >
                        {isCreatingShipment ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <ArrowRight className="mr-2 h-4 w-4" />
                            Create Shipment
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No products match your search.</p>
              <p className="text-gray-400 mt-2">Try using different keywords or check for typos.</p>
              {query && (
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => {
                    setQuery('');
                    setResults(allProducts);
                  }}
                >
                  Clear Search
                </Button>
              )}
            </div>
          )}
        </div>
      </main>
      
      <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center text-red-600">
              <AlertCircle className="h-5 w-5 mr-2" /> 
              Quantity Exceeds Stock
            </AlertDialogTitle>
            <AlertDialogDescription>
              {errorMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <Footer />
    </div>
  );
};

export default NewShipment;
