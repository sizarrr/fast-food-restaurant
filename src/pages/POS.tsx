import { useState } from 'react';
import { usePOS } from '@/contexts/POSContext';
import { Button } from '@/components/ui/button';
import Receipt from '@/components/Receipt';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Plus,
  Minus,
  ShoppingCart,
  Trash2,
  Search,
  Grid,
  List
} from 'lucide-react';
import { cn } from '@/lib/utils';

const POS = () => {
  const { menuItems, cart, addToCart, removeFromCart, updateCartQuantity, createOrder, currentReceipt, setCurrentReceipt } = usePOS();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const categories = ['All', ...Array.from(new Set(menuItems.map(item => item.category)))];

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const cartTotal = cart.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0);

  const handleQuantityChange = (itemId: string, change: number) => {
    const cartItem = cart.find(item => item.menuItem.id === itemId);
    if (cartItem) {
      updateCartQuantity(itemId, cartItem.quantity + change);
    }
  };

  return (
    <>
      {currentReceipt && (
        <Receipt 
          order={currentReceipt} 
          onClose={() => setCurrentReceipt(null)} 
        />
      )}
      <div className="h-full flex gap-6">
      {/* Menu Section */}
      <div className="flex-1 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Point of Sale</h1>
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search menu items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="whitespace-nowrap"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Menu Items */}
        <div className={cn(
          viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' 
            : 'space-y-3'
        )}>
          {filteredItems.map((item) => (
            <Card 
              key={item.id} 
              className={cn(
                "cursor-pointer transition-shadow hover:shadow-md",
                viewMode === 'list' && 'flex-row'
              )}
              onClick={() => addToCart(item)}
            >
              <CardHeader className={cn(
                "pb-3",
                viewMode === 'list' && 'pb-2 pr-2'
              )}>
                <div className={cn(
                  "flex justify-between items-start",
                  viewMode === 'list' && 'flex-1'
                )}>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                    <CardDescription>{item.category}</CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">${item.price.toFixed(2)}</div>
                    <Badge 
                      variant={item.stock > 10 ? 'default' : item.stock > 0 ? 'secondary' : 'destructive'}
                      className={cn(
                        item.stock > 10 ? 'bg-success text-success-foreground' : '',
                        item.stock <= 10 && item.stock > 0 ? 'bg-warning text-warning-foreground' : ''
                      )}
                    >
                      {item.stock} in stock
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              {viewMode === 'grid' && (
                <CardContent>
                  <Button 
                    className="w-full" 
                    disabled={item.stock === 0}
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(item);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* Cart Section */}
      <div className="w-96 space-y-4">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ShoppingCart className="h-5 w-5" />
              <span>Current Order</span>
            </CardTitle>
            <CardDescription>
              {cart.length} {cart.length === 1 ? 'item' : 'items'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {cart.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Cart is empty. Add items to start an order.
              </p>
            ) : (
              <>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.menuItem.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{item.menuItem.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          ${item.menuItem.price.toFixed(2)} each
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuantityChange(item.menuItem.id, -1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuantityChange(item.menuItem.id, 1)}
                          disabled={item.quantity >= item.menuItem.stock}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeFromCart(item.menuItem.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border pt-4">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total:</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  size="lg" 
                  onClick={createOrder}
                  disabled={cart.length === 0}
                >
                  Place Order
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
};

export default POS;