import React from 'react';
import { 
  Package,
  Navigation, 
  ShieldCheck, 
  Clock,
  Anchor,
  MapPin,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';

interface Shipment {
  id: string;
  productName: string;
  quantity: number;
  originPort: string;
  destinationPort: string;
  status: string;
  estimatedDelivery: string | null;
  progressPercentage: number;
}

interface ShipmentListProps {
  shipments: Shipment[];
}

const ShipmentList: React.FC<ShipmentListProps> = ({ shipments }) => {
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'in transit':
        return <Navigation className="h-4 w-4 text-blue-500" />;
      case 'delivered':
        return <ShieldCheck className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Package className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'in transit':
        return 'text-blue-500 bg-blue-50';
      case 'delivered':
        return 'text-green-500 bg-green-50';
      case 'pending':
        return 'text-yellow-500 bg-yellow-50';
      case 'rejected':
        return 'text-red-500 bg-red-50';
      default:
        return 'text-gray-500 bg-gray-50';
    }
  };

  if (shipments.length === 0) {
    return (
      <div className="text-center py-6">
        <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-gray-800 mb-2">No Shipments Found</h3>
        <p className="text-gray-500 mb-4">You don't have any shipments yet.</p>
        <Button 
          size="sm" 
          className="bg-trade-blue hover:bg-blue-700"
          asChild
        >
          <Link to="/new-shipment">
            <Package className="mr-2 h-4 w-4" />
            Create New Shipment
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {shipments.map((shipment) => (
        <div key={shipment.id} className="py-4 first:pt-0 last:pb-0">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center">
              <div className="mr-3 p-2 rounded-md bg-gray-50">
                <Package className="h-5 w-5 text-trade-blue" />
              </div>
              <div>
                <h4 className="text-sm font-medium">{shipment.productName}</h4>
                <p className="text-xs text-gray-500">ID: {shipment.id.substring(0, 8)}</p>
              </div>
            </div>
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(shipment.status)}`}>
              <div className="flex items-center">
                {getStatusIcon(shipment.status)}
                <span className="ml-1">{shipment.status}</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
            <div className="flex items-center">
              <Anchor className="h-3 w-3 mr-1 text-gray-400" />
              <span className="truncate">{shipment.originPort}</span>
            </div>
            <div className="flex items-center justify-center">
              <ArrowRight className="h-3 w-3 text-gray-400" />
            </div>
            <div className="flex items-center">
              <MapPin className="h-3 w-3 mr-1 text-gray-400" />
              <span className="truncate">{shipment.destinationPort}</span>
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-2">
            <div className="text-xs text-gray-500">
              {shipment.estimatedDelivery 
                ? `Expected: ${shipment.estimatedDelivery}` 
                : 'Delivery date not set'}
            </div>
            <Button variant="link" size="sm" asChild className="h-auto p-0">
              <Link to={`/shipment/${shipment.id}`}>
                View Details
              </Link>
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ShipmentList; 