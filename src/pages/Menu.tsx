import { useState } from 'react';
import { usePOS } from '@/contexts/POSContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  AlertTriangle
} from 'lucide-react';

const Menu = () => {
  const { user } = useAuth();
  const { menuItems, addMenuItem, updateMenuItem, deleteMenuItem } = usePOS();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    stock: ''
  });

  const categories = ['All', ...Array.from(new Set(menuItems.map(item => item.category)))];
  const uniqueCategories = Array.from(new Set(menuItems.map(item => item.category)));

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddItem = () => {
    if (!formData.name || !formData.price || !formData.category || !formData.stock) return;
    
    addMenuItem({
      name: formData.name,
      price: parseFloat(formData.price),
      category: formData.category,
      stock: parseInt(formData.stock)
    });
    
    setFormData({ name: '', price: '', category: '', stock: '' });
    setIsAddDialogOpen(false);
  };

  const handleEditItem = () => {
    if (!editingItem || !formData.name || !formData.price || !formData.category || !formData.stock) return;
    
    updateMenuItem(editingItem.id, {
      name: formData.name,
      price: parseFloat(formData.price),
      category: formData.category,
      stock: parseInt(formData.stock)
    });
    
    setEditingItem(null);
    setFormData({ name: '', price: '', category: '', stock: '' });
    setIsEditDialogOpen(false);
  };

  const openEditDialog = (item: any) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      price: item.price.toString(),
      category: item.category,
      stock: item.stock.toString()
    });
    setIsEditDialogOpen(true);
  };

  const lowStockItems = menuItems.filter(item => item.stock <= 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Menu Management</h1>
          <p className="text-muted-foreground">Manage your restaurant menu items</p>
        </div>
        {user?.role === 'admin' && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Menu Item</DialogTitle>
                <DialogDescription>
                  Create a new item for your menu.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Item name"
                  />
                </div>
                <div>
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {uniqueCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                      <SelectItem value="new">Add New Category...</SelectItem>
                    </SelectContent>
                  </Select>
                  {formData.category === 'new' && (
                    <Input
                      className="mt-2"
                      placeholder="Enter new category"
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    />
                  )}
                </div>
                <div>
                  <Label htmlFor="stock">Stock</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="0"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddItem}>Add Item</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <Card className="border-warning bg-warning/5">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-warning">
              <AlertTriangle className="h-5 w-5" />
              <span>Low Stock Alert</span>
            </CardTitle>
            <CardDescription>
              {lowStockItems.length} items are running low on stock
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {lowStockItems.map((item) => (
                <Badge key={item.id} variant="destructive">
                  {item.name} ({item.stock} left)
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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
        <div className="flex space-x-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Menu Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredItems.map((item) => (
          <Card key={item.id} className="relative">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{item.name}</CardTitle>
                  <CardDescription>{item.category}</CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">${item.price.toFixed(2)}</div>
                  <Badge 
                    variant={item.stock > 10 ? 'default' : item.stock > 0 ? 'secondary' : 'destructive'}
                    className={
                      item.stock > 10 ? 'bg-success text-success-foreground' :
                      item.stock <= 10 && item.stock > 0 ? 'bg-warning text-warning-foreground' : ''
                    }
                  >
                    {item.stock} in stock
                  </Badge>
                </div>
              </div>
            </CardHeader>
            {user?.role === 'admin' && (
              <CardContent>
                <div className="flex space-x-2">
                  <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(item)}>
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Menu Item</DialogTitle>
                        <DialogDescription>
                          Update the details of this menu item.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="edit-name">Name</Label>
                          <Input
                            id="edit-name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-price">Price</Label>
                          <Input
                            id="edit-price"
                            type="number"
                            step="0.01"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-category">Category</Label>
                          <Select
                            value={formData.category}
                            onValueChange={(value) => setFormData({ ...formData, category: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {uniqueCategories.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="edit-stock">Stock</Label>
                          <Input
                            id="edit-stock"
                            type="number"
                            value={formData.stock}
                            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleEditItem}>Update Item</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete "{item.name}" from your menu. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteMenuItem(item.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Menu;