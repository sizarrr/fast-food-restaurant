import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useSettings } from '@/contexts/SettingsContext';
import type { OrderCostBreakdown } from '@/contexts/POSContext';

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subtotal: number;
  onConfirm: (params: { costs: OrderCostBreakdown }) => void;
}

const PaymentDialog = ({ open, onOpenChange, subtotal, onConfirm }: PaymentDialogProps) => {
  const { formatCurrency } = useSettings();

  const total = subtotal; // No tax, no discount - just the subtotal

  const handleConfirm = () => {
    const costs: OrderCostBreakdown = {
      subtotal,
      discount: 0,
      tax: 0,
      total,
    };

    onConfirm({ costs });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Complete Sale</DialogTitle>
          <DialogDescription>Confirm sale and print receipt</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center justify-between border-t border-b py-6">
            <div className="text-2xl font-semibold">Total Amount</div>
            <div className="text-3xl font-bold text-primary">{formatCurrency(total)}</div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleConfirm} className="bg-green-600 hover:bg-green-700">
            Complete Sale & Print Receipt
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;

