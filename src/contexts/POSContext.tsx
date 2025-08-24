import { createContext, useContext, useState, ReactNode } from 'react';
import { toast } from '@/hooks/use-toast';

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  image?: string;
}

export interface OrderItem {
  menuItem: MenuItem;
  quantity: number;
}

export interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'preparing' | 'completed';
  timestamp: Date;
}

interface POSContextType {
  menuItems: MenuItem[];
  cart: OrderItem[];
  orders: Order[];
  currentReceipt: Order | null;
  addToCart: (item: MenuItem) => void;
  removeFromCart: (itemId: string) => void;
  updateCartQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  createOrder: () => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  addMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  updateMenuItem: (id: string, item: Partial<MenuItem>) => void;
  deleteMenuItem: (id: string) => void;
  setCurrentReceipt: (order: Order | null) => void;
}

const POSContext = createContext<POSContextType | undefined>(undefined);

// Mock menu items
const initialMenuItems: MenuItem[] = [
  { id: '1', name: 'Big Burger', price: 12.99, category: 'Burgers', stock: 25 },
  { id: '2', name: 'Cheese Burger', price: 10.99, category: 'Burgers', stock: 30 },
  { id: '3', name: 'Chicken Wings', price: 8.99, category: 'Chicken', stock: 40 },
  { id: '4', name: 'French Fries', price: 4.99, category: 'Sides', stock: 50 },
  { id: '5', name: 'Coca Cola', price: 2.99, category: 'Drinks', stock: 60 },
  { id: '6', name: 'Chicken Sandwich', price: 9.99, category: 'Chicken', stock: 20 },
  { id: '7', name: 'Fish Burger', price: 11.99, category: 'Burgers', stock: 15 },
  { id: '8', name: 'Onion Rings', price: 5.99, category: 'Sides', stock: 35 },
];

export const POSProvider = ({ children }: { children: ReactNode }) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems);
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentReceipt, setCurrentReceipt] = useState<Order | null>(null);

  const addToCart = (item: MenuItem) => {
    if (item.stock <= 0) {
      toast({ title: "Out of stock", description: `${item.name} is out of stock`, variant: "destructive" });
      return;
    }

    setCart(prev => {
      const existing = prev.find(cartItem => cartItem.menuItem.id === item.id);
      if (existing) {
        if (existing.quantity >= item.stock) {
          toast({ title: "Stock limit reached", description: `Only ${item.stock} ${item.name} available`, variant: "destructive" });
          return prev;
        }
        return prev.map(cartItem =>
          cartItem.menuItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prev, { menuItem: item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(item => item.menuItem.id !== itemId));
  };

  const updateCartQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    
    setCart(prev =>
      prev.map(item =>
        item.menuItem.id === itemId
          ? { ...item, quantity: Math.min(quantity, item.menuItem.stock) }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const createOrder = () => {
    if (cart.length === 0) {
      toast({ title: "Empty cart", description: "Please add items to cart first", variant: "destructive" });
      return;
    }

    const total = cart.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0);
    const newOrder: Order = {
      id: Date.now().toString(),
      items: [...cart],
      total,
      status: 'pending',
      timestamp: new Date(),
    };

    // Update stock
    setMenuItems(prev =>
      prev.map(menuItem => {
        const cartItem = cart.find(item => item.menuItem.id === menuItem.id);
        if (cartItem) {
          return { ...menuItem, stock: menuItem.stock - cartItem.quantity };
        }
        return menuItem;
      })
    );

    setOrders(prev => [newOrder, ...prev]);
    clearCart();
    setCurrentReceipt(newOrder);
    toast({ title: "Order created", description: `Order #${newOrder.id} created successfully` });
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(prev =>
      prev.map(order =>
        order.id === orderId ? { ...order, status } : order
      )
    );
    toast({ title: "Order updated", description: `Order #${orderId} marked as ${status}` });
  };

  const addMenuItem = (item: Omit<MenuItem, 'id'>) => {
    const newItem: MenuItem = { ...item, id: Date.now().toString() };
    setMenuItems(prev => [...prev, newItem]);
    toast({ title: "Item added", description: `${item.name} added to menu` });
  };

  const updateMenuItem = (id: string, item: Partial<MenuItem>) => {
    setMenuItems(prev =>
      prev.map(menuItem =>
        menuItem.id === id ? { ...menuItem, ...item } : menuItem
      )
    );
    toast({ title: "Item updated", description: "Menu item updated successfully" });
  };

  const deleteMenuItem = (id: string) => {
    setMenuItems(prev => prev.filter(item => item.id !== id));
    toast({ title: "Item deleted", description: "Menu item deleted successfully" });
  };

  return (
    <POSContext.Provider value={{
      menuItems,
      cart,
      orders,
      currentReceipt,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      createOrder,
      updateOrderStatus,
      addMenuItem,
      updateMenuItem,
      deleteMenuItem,
      setCurrentReceipt,
    }}>
      {children}
    </POSContext.Provider>
  );
};

export const usePOS = () => {
  const context = useContext(POSContext);
  if (context === undefined) {
    throw new Error('usePOS must be used within a POSProvider');
  }
  return context;
};