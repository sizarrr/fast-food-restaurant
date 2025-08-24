import { useState } from 'react';
import { usePOS } from '@/contexts/POSContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Clock,
  CheckCircle,
  ChefHat,
  Search,
  Calendar,
  DollarSign
} from 'lucide-react';
import { cn } from '@/lib/utils';

const Orders = () => {
  const { orders, updateOrderStatus } = usePOS();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('today');

  const getFilteredOrders = () => {
    let filtered = orders;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.id.includes(searchTerm) ||
        order.items.some(item => item.menuItem.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Filter by date
    if (dateFilter === 'today') {
      const today = new Date();
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.timestamp);
        return orderDate.toDateString() === today.toDateString();
      });
    }

    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  const filteredOrders = getFilteredOrders();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'preparing':
        return <ChefHat className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-warning text-warning-foreground';
      case 'preparing':
        return 'bg-primary text-primary-foreground';
      case 'completed':
        return 'bg-success text-success-foreground';
      default:
        return '';
    }
  };

  const orderStats = {
    total: filteredOrders.length,
    pending: filteredOrders.filter(o => o.status === 'pending').length,
    preparing: filteredOrders.filter(o => o.status === 'preparing').length,
    completed: filteredOrders.filter(o => o.status === 'completed').length,
    revenue: filteredOrders.reduce((sum, order) => sum + order.total, 0)
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Order Management</h1>
        <p className="text-muted-foreground">Track and manage customer orders</p>
      </div>

      {/* Order Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orderStats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Clock className="h-4 w-4 mr-1 text-warning" />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orderStats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <ChefHat className="h-4 w-4 mr-1 text-primary" />
              Preparing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orderStats.preparing}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <CheckCircle className="h-4 w-4 mr-1 text-success" />
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orderStats.completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <DollarSign className="h-4 w-4 mr-1" />
              Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${orderStats.revenue.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="preparing">Preparing</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">No orders found</p>
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <span>Order #{order.id}</span>
                        <Badge className={getStatusColor(order.status)}>
                          {getStatusIcon(order.status)}
                          <span className="ml-1 capitalize">{order.status}</span>
                        </Badge>
                      </CardTitle>
                      <CardDescription className="flex items-center space-x-4 mt-1">
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {order.timestamp.toLocaleDateString()}
                        </span>
                        <span>{order.timestamp.toLocaleTimeString()}</span>
                        <span className="font-medium">${order.total.toFixed(2)}</span>
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {order.status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => updateOrderStatus(order.id, 'preparing')}
                        className="bg-primary text-primary-foreground"
                      >
                        Start Preparing
                      </Button>
                    )}
                    {order.status === 'preparing' && (
                      <Button
                        size="sm"
                        onClick={() => updateOrderStatus(order.id, 'completed')}
                        className="bg-success text-success-foreground"
                      >
                        Mark Complete
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <h4 className="font-medium">Order Items:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                        <span className="text-sm">{item.menuItem.name}</span>
                        <div className="text-sm text-muted-foreground">
                          {item.quantity}x ${item.menuItem.price.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Orders;