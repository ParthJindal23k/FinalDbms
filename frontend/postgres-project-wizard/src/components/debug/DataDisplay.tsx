import React, { useEffect } from 'react';

interface DataDisplayProps {
  data: any;
  label: string;
}

/**
 * A component that logs data to the console
 * This doesn't render anything visible on the page
 */
const DataDisplay: React.FC<DataDisplayProps> = ({ data, label }) => {
  useEffect(() => {
    console.log(`DEBUG DATA [${label}]:`, data);
    
    // Only log these properties if data is an object
    if (data && typeof data === 'object') {
      console.log(`DEBUG DATA [${label}] - Types:`, {
        data_type: typeof data,
        unit_cost: data.unit_cost !== undefined ? `${typeof data.unit_cost} - ${data.unit_cost}` : 'undefined',
        subtotal: data.subtotal !== undefined ? `${typeof data.subtotal} - ${data.subtotal}` : 'undefined',
        tax_amount: data.tax_amount !== undefined ? `${typeof data.tax_amount} - ${data.tax_amount}` : 'undefined',
        total_cost: data.total_cost !== undefined ? `${typeof data.total_cost} - ${data.total_cost}` : 'undefined'
      });
    }
  }, [data, label]);

  // This component doesn't render anything
  return null;
};

export default DataDisplay; 