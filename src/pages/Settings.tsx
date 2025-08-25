import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ShieldAlert } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { useState } from 'react';

const Settings = () => {
  const { user } = useAuth();
  const { settings, updateSettings } = useSettings();
  const [local, setLocal] = useState(settings);

  if (!user || user.role !== 'admin') {
    return <Navigate to="/dashboard" />;
  }

  const handleSave = () => {
    updateSettings(local);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Configure store and system preferences</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Store Information</CardTitle>
            <CardDescription>Displayed on receipts and reports</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="store-name">Store Name</Label>
              <Input id="store-name" value={local.store.name} onChange={(e) => setLocal({ ...local, store: { ...local.store, name: e.target.value } })} />
            </div>
            <div>
              <Label htmlFor="store-address">Address</Label>
              <Input id="store-address" value={local.store.addressLine1} onChange={(e) => setLocal({ ...local, store: { ...local.store, addressLine1: e.target.value } })} />
            </div>
            <div>
              <Label htmlFor="store-phone">Phone</Label>
              <Input id="store-phone" value={local.store.phone} onChange={(e) => setLocal({ ...local, store: { ...local.store, phone: e.target.value } })} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sales & Pricing</CardTitle>
            <CardDescription>Tax, discount and currency</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="currency">Currency</Label>
              <Select value={local.currency} onValueChange={(v) => setLocal({ ...local, currency: v as any })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="JPY">JPY</SelectItem>
                  <SelectItem value="AED">AED</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="tax">Tax Rate (%)</Label>
              <Input id="tax" type="number" step="0.01" value={local.taxRatePercent} onChange={(e) => setLocal({ ...local, taxRatePercent: parseFloat(e.target.value || '0') })} />
            </div>
            <div>
              <Label htmlFor="discount">Default Discount (%)</Label>
              <Input id="discount" type="number" step="0.01" value={local.discountPercent} onChange={(e) => setLocal({ ...local, discountPercent: parseFloat(e.target.value || '0') })} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inventory</CardTitle>
            <CardDescription>Alerts and thresholds</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="low-stock">Low Stock Threshold</Label>
              <Input id="low-stock" type="number" value={local.lowStockThreshold} onChange={(e) => setLocal({ ...local, lowStockThreshold: parseInt(e.target.value || '0') })} />
            </div>
            <div className="p-3 rounded-md bg-warning/10 text-warning flex items-start gap-2">
              <ShieldAlert className="h-4 w-4 mt-0.5" />
              <p className="text-sm">Items at or below this threshold appear as Low Stock across the app.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave}>Save Changes</Button>
      </div>
    </div>
  );
};

export default Settings;

