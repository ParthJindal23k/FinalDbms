import React from 'react';
import { 
  Package,
  Edit,
  Trash2
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '../ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Button } from '../ui/button';

interface Product {
  id: string;
  name: string;
  hsCode: string;
  category?: string;
  stock: number;
  unitCost: number;
}

interface ProductsListProps {
  products: Product[];
  onEdit?: (product: Product) => void;
  onDelete?: (productId: string) => void;
}

const ProductsList: React.FC<ProductsListProps> = ({ 
  products, 
  onEdit = () => {}, 
  onDelete = () => {}
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl flex items-center">
            <Package className="mr-2 h-5 w-5 text-trade-blue" />
            Products
          </CardTitle>
          <CardDescription>
            Manage your inventory and product catalog
          </CardDescription>
        </div>
        <Button size="sm" className="bg-trade-blue hover:bg-blue-700">
          Add Product
        </Button>
      </CardHeader>
      <CardContent>
        {products.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product Name</TableHead>
                  <TableHead>HS Code</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead className="text-right">Unit Cost</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.hsCode}</TableCell>
                    <TableCell className="text-right">{product.stock}</TableCell>
                    <TableCell className="text-right">
                      {typeof product.unitCost === 'number' && !isNaN(product.unitCost) 
                        ? formatCurrency(product.unitCost) 
                        : '$0.00'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onEdit(product)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onDelete(product.id)}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No products added yet</p>
            <Button className="bg-trade-blue hover:bg-blue-700">Add Your First Product</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductsList;
