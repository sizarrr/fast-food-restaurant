import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { toast } from '@/hooks/use-toast';
import { useSettings } from './SettingsContext';

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

export type OrderType = 'dine-in' | 'takeaway' | 'delivery';
export type PaymentMethod = 'cash' | 'card' | 'mobile';

export interface OrderCostBreakdown {
  subtotal: number;
  discount: number; // absolute amount applied
  tax: number; // absolute amount applied
  total: number; // subtotal - discount + tax
}

export interface PaymentInfo {
  method: PaymentMethod;
  tendered?: number; // for cash
  change?: number; // for cash
  reference?: string; // transaction id for card/mobile
}

export interface Order {
  id: string;
  items: OrderItem[];
  costs: OrderCostBreakdown;
  status: 'pending' | 'preparing' | 'completed';
  type: OrderType;
  payment?: PaymentInfo;
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
  createOrder: (options?: { type?: OrderType; payment?: PaymentInfo; costs?: Partial<OrderCostBreakdown> }) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  addMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  updateMenuItem: (id: string, item: Partial<MenuItem>) => void;
  deleteMenuItem: (id: string) => void;
  setCurrentReceipt: (order: Order | null) => void;
}

const POSContext = createContext<POSContextType | undefined>(undefined);

// Mock menu items
const initialMenuItems: MenuItem[] = [
  { id: '1', name: 'Big Burger', price: 12.99, category: 'Burgers', stock: 25, image: '/src/assets/big-burger.jpg' },
  { id: '2', name: 'Cheese Burger', price: 10.99, category: 'Burgers', stock: 30, image: '/src/assets/cheese-burger.jpg' },
  { id: '3', name: 'Chicken Wings', price: 8.99, category: 'Chicken', stock: 40, image: '/src/assets/chicken-wings.jpg' },
  { id: '4', name: 'French Fries', price: 4.99, category: 'Sides', stock: 50, image: '/src/assets/french-fries.jpg' },
  { id: '5', name: 'Coca Cola', price: 2.99, category: 'Drinks', stock: 60, image: '/src/assets/coca-cola.jpg' },
  { id: '6', name: 'Chicken Sandwich', price: 9.99, category: 'Chicken', stock: 20, image: '/src/assets/chicken-sandwich.jpg' },
  { id: '7', name: 'Fish Burger', price: 11.99, category: 'Burgers', stock: 15, image: '/src/assets/fish-burger.jpg' },
  { id: '8', name: 'Onion Rings', price: 5.99, category: 'Sides', stock: 35, image: '/src/assets/onion-rings.jpg' },
];

export const POSProvider = ({ children }: { children: ReactNode }) => {
  const { settings } = useSettings();

  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    try {
      const raw = localStorage.getItem('ffpos_menu_v1');
      if (raw) return JSON.parse(raw);
      return initialMenuItems;
    } catch {
      return initialMenuItems;
    }
  });
  const [cart, setCart] = useState<OrderItem[]>(() => {
    try {
      const raw = localStorage.getItem('ffpos_cart_v1');
      if (raw) return JSON.parse(raw);
      return [];
    } catch {
      return [];
    }
  });
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const raw = localStorage.getItem('ffpos_orders_v1');
      if (!raw) return [];
      const parsed = JSON.parse(raw) as Order[];
      return parsed.map(o => ({ ...o, timestamp: new Date(o.timestamp) }));
    } catch {
      return [];
    }
  });
  const [currentReceipt, setCurrentReceipt] = useState<Order | null>(null);

  useEffect(() => {
    try { localStorage.setItem('ffpos_menu_v1', JSON.stringify(menuItems)); } catch {}
  }, [menuItems]);
  useEffect(() => {
    try { localStorage.setItem('ffpos_cart_v1', JSON.stringify(cart)); } catch {}
  }, [cart]);
  useEffect(() => {
    try { localStorage.setItem('ffpos_orders_v1', JSON.stringify(orders)); } catch {}
  }, [orders]);

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

  const createOrder = (options?: { type?: OrderType; payment?: PaymentInfo; costs?: Partial<OrderCostBreakdown> }) => {
    if (cart.length === 0) {
      toast({ title: "Empty cart", description: "Please add items to cart first", variant: "destructive" });
      return;
    }
    const subtotal = cart.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0);
    const discount = options?.costs?.discount ?? 0;
    const tax = options?.costs?.tax ?? (Math.max(0, subtotal - discount) * (settings.taxRatePercent / 100));
    const total = Math.max(0, subtotal - discount + tax);
    const newOrder: Order = {
      id: Date.now().toString(),
      items: [...cart],
      costs: { subtotal, discount, tax, total },
      status: 'pending',
      type: options?.type ?? 'takeaway',
      payment: options?.payment,
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