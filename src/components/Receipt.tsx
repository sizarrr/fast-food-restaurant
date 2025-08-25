import { useEffect } from 'react';
import { Order } from '@/contexts/POSContext';
import { format } from 'date-fns';
import { useSettings } from '@/contexts/SettingsContext';

interface ReceiptProps {
  order: Order;
  onClose: () => void;
}

const Receipt = ({ order, onClose }: ReceiptProps) => {
  const { settings, formatCurrency } = useSettings();

  const handlePrint = () => {
    window.print();
  };

  // Auto-print when receipt opens
  useEffect(() => {
    const timer = setTimeout(() => {
      handlePrint();
    }, 500); // Small delay to ensure DOM is fully rendered

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-background border rounded-lg p-6 max-w-md w-full mx-4 print:shadow-none print:border-none print:max-w-none">
        <div id="receipt-content" className="space-y-4">
          {/* Header */}
          <div className="text-center border-b pb-4">
            <h1 className="text-2xl font-bold">{settings.store.name}</h1>
            <p className="text-sm text-muted-foreground">{settings.store.addressLine1}</p>
            <p className="text-sm text-muted-foreground">Phone: {settings.store.phone}</p>
          </div>

          {/* Order Info */}
          <div className="border-b pb-4">
            <div className="flex justify-between">
              <span>Order #:</span>
              <span className="font-mono">{order.id}</span>
            </div>
            <div className="flex justify-between">
              <span>Date:</span>
              <span>{format(order.timestamp, 'MMM dd, yyyy')}</span>
            </div>
            <div className="flex justify-between">
              <span>Time:</span>
              <span>{format(order.timestamp, 'HH:mm:ss')}</span>
            </div>
          </div>

          {/* Items */}
          <div className="space-y-2">
            <h3 className="font-semibold">Items:</h3>
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <div className="flex-1">
                  <div>{item.menuItem.name}</div>
                  <div className="text-muted-foreground">
                    {formatCurrency(item.menuItem.price)} x {item.quantity}
                  </div>
                </div>
                <div className="font-medium">
                  {formatCurrency(item.menuItem.price * item.quantity)}
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="border-t pt-4">
            <div className="flex justify-between text-xl font-bold">
              <span>Total:</span>
              <span>{formatCurrency(order.costs.total)}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-muted-foreground border-t pt-4">
            <p>Thank you for your order!</p>
            <p>Have a great day!</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 mt-6 print:hidden">
          <button
            onClick={handlePrint}
            className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
          >
            Print Receipt
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-secondary text-secondary-foreground px-4 py-2 rounded-md hover:bg-secondary/90 transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          @media print {
            body * {
              visibility: hidden;
            }
            #receipt-content,
            #receipt-content * {
              visibility: visible;
            }
            #receipt-content {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
          }
        `
      }} />
    </div>
  );
};

export default Receipt;