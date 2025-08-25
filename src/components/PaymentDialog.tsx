import { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSettings } from '@/contexts/SettingsContext';
import type { OrderType, PaymentInfo, PaymentMethod, OrderCostBreakdown } from '@/contexts/POSContext';

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subtotal: number;
  onConfirm: (params: { type: OrderType; payment: PaymentInfo; costs: OrderCostBreakdown }) => void;
}

const PaymentDialog = ({ open, onOpenChange, subtotal, onConfirm }: PaymentDialogProps) => {
  const { settings, formatCurrency } = useSettings();
  const [orderType, setOrderType] = useState<OrderType>('takeaway');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [tendered, setTendered] = useState<string>('');
  const [reference, setReference] = useState<string>('');
  const [discountPercent, setDiscountPercent] = useState<number>(settings.discountPercent || 0);

  const amounts = useMemo(() => {
    const discount = Math.max(0, subtotal * (discountPercent / 100));
    const taxable = Math.max(0, subtotal - discount);
    const tax = Math.max(0, taxable * (settings.taxRatePercent / 100));
    const total = Math.max(0, taxable + tax);
    return { discount, tax, total };
  }, [subtotal, discountPercent, settings.taxRatePercent]);

  const tenderedNumber = parseFloat(tendered || '0');
  const change = paymentMethod === 'cash' ? Math.max(0, tenderedNumber - amounts.total) : undefined;
  const canConfirm = paymentMethod !== 'cash' || tenderedNumber >= amounts.total;

  const handleConfirm = () => {
    const payment: PaymentInfo = {
      method: paymentMethod,
      tendered: paymentMethod === 'cash' ? tenderedNumber : undefined,
      change: paymentMethod === 'cash' ? change : undefined,
      reference: paymentMethod !== 'cash' ? reference || undefined : undefined,
    };

    const costs: OrderCostBreakdown = {
      subtotal,
      discount: amounts.discount,
      tax: amounts.tax,
      total: amounts.total,
    };

    onConfirm({ type: orderType, payment, costs });
    onOpenChange(false);
    setTendered('');
    setReference('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Complete Payment</DialogTitle>
          <DialogDescription>Review order details and accept payment</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Order Type</Label>
              <Select value={orderType} onValueChange={(v) => setOrderType(v as OrderType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dine-in">Dine-in</SelectItem>
                  <SelectItem value="takeaway">Takeaway</SelectItem>
                  <SelectItem value="delivery">Delivery</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Payment Method</Label>
              <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="mobile">Mobile</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label>Subtotal</Label>
              <div className="font-medium">{formatCurrency(subtotal)}</div>
            </div>
            <div>
              <Label>Discount (%)</Label>
              <Input type="number" step="0.01" value={discountPercent} onChange={(e) => setDiscountPercent(parseFloat(e.target.value || '0'))} />
              <div className="text-xs text-muted-foreground">-{formatCurrency(amounts.discount)}</div>
            </div>
            <div>
              <Label>Tax ({settings.taxRatePercent}%)</Label>
              <div className="font-medium">{formatCurrency(amounts.tax)}</div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t pt-4">
            <div className="text-lg font-semibold">Total</div>
            <div className="text-2xl font-bold">{formatCurrency(amounts.total)}</div>
          </div>

          {paymentMethod === 'cash' ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <Label>Cash Tendered</Label>
                <Input type="number" step="0.01" value={tendered} onChange={(e) => setTendered(e.target.value)} />
              </div>
              <div>
                <Label>Change</Label>
                <div className="font-medium">{formatCurrency(change || 0)}</div>
              </div>
            </div>
          ) : (
            <div>
              <Label>Reference (optional)</Label>
              <Input placeholder="Txn ID / last 4 / mobile ref" value={reference} onChange={(e) => setReference(e.target.value)} />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleConfirm} disabled={!canConfirm}>Confirm Payment</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;

