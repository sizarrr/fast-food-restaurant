import { usePOS } from '@/contexts/POSContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import {
  DollarSign,
  ShoppingBag,
  Package,
  AlertTriangle,
  TrendingUp,
  Clock
} from 'lucide-react';

import { useSettings } from '@/contexts/SettingsContext';

const Dashboard = () => {
  const { orders, menuItems } = usePOS();
  const { settings, formatCurrency } = useSettings();

  // Calculate statistics
  const todayOrders = orders.filter(order => {
    const today = new Date();
    const orderDate = new Date(order.timestamp);
    return orderDate.toDateString() === today.toDateString();
  });

  // Calculate monthly sales
  const currentMonth = new Date();
  const monthlyOrders = orders.filter(order => {
    const orderDate = new Date(order.timestamp);
    return orderDate.getMonth() === currentMonth.getMonth() &&
           orderDate.getFullYear() === currentMonth.getFullYear();
  });
  const monthlyRevenue = monthlyOrders.reduce((sum, order) => sum + order.costs.total, 0);

  const totalRevenue = todayOrders.reduce((sum, order) => sum + order.costs.total, 0);
  const pendingOrders = orders.filter(order => order.status === 'pending');
  const lowStockItems = menuItems.filter(item => item.stock <= settings.lowStockThreshold);

  const stats = [
    {
      title: "Today's Revenue",
      value: `${formatCurrency(totalRevenue)}`,
      description: `${todayOrders.length} orders today`,
      icon: DollarSign,
      color: 'text-success'
    },
    {
      title: "Monthly Sales",
      value: `${formatCurrency(monthlyRevenue)}`,
      description: `${monthlyOrders.length} orders this month`,
      icon: TrendingUp,
      color: 'text-primary'
    },
    {
      title: "Pending Orders",
      value: pendingOrders.length.toString(),
      description: "Orders awaiting preparation",
      icon: Clock,
      color: 'text-warning'
    },
    {
      title: "Low Stock Alerts",
      value: lowStockItems.length.toString(),
      description: "Items below 5 units",
      icon: AlertTriangle,
      color: 'text-destructive'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your restaurant operations</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ShoppingBag className="h-5 w-5" />
              <span>Recent Orders</span>
            </CardTitle>
            <CardDescription>Latest orders from today</CardDescription>
          </CardHeader>
          <CardContent>
            {todayOrders.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No orders today yet</p>
            ) : (
              <div className="space-y-3">
                {todayOrders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">Order #{order.id}</span>
                        <Badge 
                          variant={
                            order.status === 'completed' ? 'default' : 
                            order.status === 'preparing' ? 'secondary' : 'outline'
                          }
                          className={
                            order.status === 'completed' ? 'bg-success text-success-foreground' :
                            order.status === 'preparing' ? 'bg-warning text-warning-foreground' : ''
                          }
                        >
                          {order.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {order.items.length} items • {order.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-medium">{formatCurrency(order.costs.total)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <span>Low Stock Alert</span>
            </CardTitle>
            <CardDescription>Items that need restocking</CardDescription>
          </CardHeader>
          <CardContent>
            {lowStockItems.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">All items well stocked</p>
            ) : (
              <div className="space-y-3">
                {lowStockItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <span className="font-medium">{item.name}</span>
                      <p className="text-sm text-muted-foreground">{item.category}</p>
                    </div>
                    <Badge variant="destructive">
                      {item.stock} left
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;