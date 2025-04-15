// src/pages/AddProduct.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";

// --- Interfaces ---
interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DecodedToken {
  companyId?: string;
  exp?: number;
  iat?: number;
  [key: string]: any;
}

// --- Decode JWT Function ---
function decodeToken(token: string): DecodedToken {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return {}; // Handle invalid token format
    
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64).split('').map((c) =>
        '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      ).join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Token decode error:", error);
    return {};
  }
}

// --- Shared Submit Handler ---
const submitProduct = async ({
  name,
  stock,
  hsCode,
  unitCost,
  onSuccess,
}: {
  name: string;
  stock: number;
  hsCode: string;
  unitCost: number;
  onSuccess: () => void;
}) => {
  const token = localStorage.getItem("token");
  if (!token) {
    toast({ title: "Error", description: "No authentication token found" });
    return;
  }

  try {
    // For testing, we'll use a mock companyId if not available in token
    const decodedToken = decodeToken(token);
    const companyId = decodedToken.companyId || "00000000-0000-0000-0000-000000000000";

    console.log("Sending product data:", { name, stock, hsCode, unitCost, companyId });

    const res = await fetch(`http://localhost:5001/api/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, stock, hsCode, unitCost, companyId }),
    });

    // Log response status for debugging
    console.log("Response status:", res.status);

    let data;
    try {
      data = await res.json();
      console.log("Response data:", data);
    } catch (e) {
      console.error("Failed to parse JSON response:", e);
      throw new Error("Invalid response from server");
    }

    if (!res.ok) throw new Error(data.error || `Request failed with status ${res.status}`);

    toast({ title: "Product added successfully!" });
    onSuccess();
  } catch (err: any) {
    console.error("Fetch error:", err);
    
    // More helpful error messages
    if (err.message.includes("Failed to fetch") || err.message.includes("NetworkError")) {
      toast({ 
        title: "Connection Error", 
        description: "Could not connect to the server. Please check if the backend is running." 
      });
    } else {
      toast({ title: "Error", description: err.message || "Unknown error occurred" });
    }
  }
};

// --- Product Form ---
const ProductForm = ({
  onSubmit,
  onCancel,
  initialValues = { name: "", stock: 0, hsCode: "", unitCost: 0 }
}: {
  onSubmit: (data: { name: string; stock: number; hsCode: string; unitCost: number }) => void;
  onCancel: () => void;
  initialValues?: { name: string; stock: number; hsCode: string; unitCost: number };
}) => {
  const [name, setName] = useState(initialValues.name);
  const [stock, setStock] = useState(initialValues.stock);
  const [hsCode, setHsCode] = useState(initialValues.hsCode);
  const [unitCost, setUnitCost] = useState(initialValues.unitCost);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, stock, hsCode, unitCost });
  };

  // Prevent NaN values in number inputs
  const handleNumberChange = (
    setter: React.Dispatch<React.SetStateAction<number>>,
    value: string
  ) => {
    const numValue = Number(value);
    setter(isNaN(numValue) ? 0 : numValue);
  };

  return (
    <div className="bg-white max-w-md w-full p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Add New Product</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Product Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          required
        />
        <input
          type="number"
          placeholder="Stock Quantity"
          value={stock}
          onChange={(e) => handleNumberChange(setStock, e.target.value)}
          className="w-full border px-3 py-2 rounded"
          required
          min="0"
        />
        <input
          type="text"
          placeholder="HS Code"
          value={hsCode}
          onChange={(e) => setHsCode(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          required
        />
        <input
          type="number"
          placeholder="Unit Cost"
          value={unitCost}
          onChange={(e) => handleNumberChange(setUnitCost, e.target.value)}
          className="w-full border px-3 py-2 rounded"
          required
          min="0"
          step="0.01"
        />
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Add Product
          </button>
        </div>
      </form>
    </div>
  );
};

// --- Modal Component ---
export const AddProductModal = ({ isOpen, onClose }: AddProductModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <ProductForm
        onSubmit={(data) =>
          submitProduct({
            ...data,
            onSuccess: onClose,
          })
        }
        onCancel={onClose}
      />
    </div>
  );
};

// --- Main Add Product Page ---
const AddProduct = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation isAuthenticated={true} userType="company" />
      <main className="flex-1 bg-gray-50 flex items-center justify-center py-12">
        <ProductForm
          onSubmit={(data) =>
            submitProduct({
              ...data,
              onSuccess: () => navigate("/company-dashboard"),
            })
          }
          onCancel={() => navigate("/company-dashboard")}
        />
      </main>
      <Footer />
    </div>
  );
};

export default AddProduct;
