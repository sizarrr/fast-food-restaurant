import { Order } from '@/contexts/POSContext';
import { format } from 'date-fns';
import { useSettings } from '@/contexts/SettingsContext';

interface ReceiptProps {
  order: Order;
  onClose: () => void;
}

const Receipt = ({ order, onClose }: ReceiptProps) => {
  const handlePrint = () => {
    window.print();
  };
  const { settings, formatCurrency } = useSettings();

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
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(order.costs.subtotal)}</span>
              </div>
              {order.costs.discount > 0 && (
                <div className="flex justify-between">
                  <span>Discount:</span>
                  <span>-{formatCurrency(order.costs.discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Tax:</span>
                <span>{formatCurrency(order.costs.tax)}</span>
              </div>
            </div>
            <div className="flex justify-between text-lg font-bold mt-2">
              <span>Total:</span>
              <span>{formatCurrency(order.costs.total)}</span>
            </div>
          </div>

          {/* Payment */}
          {order.payment && (
            <div className="border-t pt-4 text-sm space-y-1">
              <div className="flex justify-between">
                <span>Payment:</span>
                <span className="capitalize">{order.payment.method}</span>
              </div>
              {order.payment.tendered !== undefined && (
                <div className="flex justify-between">
                  <span>Tendered:</span>
                  <span>{formatCurrency(order.payment.tendered)}</span>
                </div>
              )}
              {order.payment.change !== undefined && (
                <div className="flex justify-between">
                  <span>Change:</span>
                  <span>{formatCurrency(order.payment.change)}</span>
                </div>
              )}
              {order.payment.reference && (
                <div className="flex justify-between">
                  <span>Reference:</span>
                  <span>{order.payment.reference}</span>
                </div>
              )}
            </div>
          )}

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