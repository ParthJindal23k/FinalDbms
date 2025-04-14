
import React from 'react';
import { 
  Anchor, 
  Navigation, 
  Package, 
  ShieldCheck, 
  Clock,
  MapPin
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';

interface ShipmentStatusCardProps {
  shipment: {
    id: string;
    productName: string;
    quantity: number;
    originPort: string;
    destinationPort: string;
    status: string;
    estimatedDelivery: string | null;
    progressPercentage: number;
  };
}

const ShipmentStatusCard: React.FC<ShipmentStatusCardProps> = ({ shipment }) => {
  const getStatusBadgeClass = () => {
    switch (shipment.status.toLowerCase()) {
      case 'in transit':
        return 'status-badge status-transit';
      case 'delivered':
        return 'status-badge status-delivered';
      case 'pending':
        return 'status-badge status-pending';
      case 'rejected':
        return 'status-badge status-rejected';
      default:
        return 'status-badge status-pending';
    }
  };

  const getStatusIcon = () => {
    switch (shipment.status.toLowerCase()) {
      case 'in transit':
        return <Navigation className="h-4 w-4" />;
      case 'delivered':
        return <ShieldCheck className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{shipment.productName}</CardTitle>
            <CardDescription>Shipment ID: {shipment.id.substring(0, 8)}</CardDescription>
          </div>
          <div className={getStatusBadgeClass()}>
            <div className="flex items-center">
              {getStatusIcon()}
              <span className="ml-1">{shipment.status}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center">
              <Anchor className="h-4 w-4 mr-2 text-trade-blue" />
              <div>
                <p className="text-xs text-muted-foreground">Origin</p>
                <p className="text-sm font-medium">{shipment.originPort}</p>
              </div>
            </div>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-trade-teal" />
              <div>
                <p className="text-xs text-muted-foreground">Destination</p>
                <p className="text-sm font-medium">{shipment.destinationPort}</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>Progress</span>
              <span>{shipment.progressPercentage}%</span>
            </div>
            <Progress value={shipment.progressPercentage} className="h-2" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Quantity</p>
              <p className="text-sm font-medium">{shipment.quantity} units</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Delivery Date</p>
              <p className="text-sm font-medium">{shipment.estimatedDelivery || 'Not scheduled'}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ShipmentStatusCard;
