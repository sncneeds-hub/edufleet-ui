import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Pencil, Trash2, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { categoryLabels } from '@/mock/supplierData';

// Mock initial data
const initialVehicleCategories = [
  { id: 'vc-1', name: 'School Bus', slug: 'school-bus', count: 15 },
  { id: 'vc-2', name: 'Minibus', slug: 'minibus', count: 8 },
  { id: 'vc-3', name: 'Van', slug: 'van', count: 12 },
  { id: 'vc-4', name: 'Truck', slug: 'truck', count: 3 },
  { id: 'vc-5', name: 'SUV', slug: 'suv', count: 0 },
];

const initialJobCategories = [
  { id: 'jc-1', name: 'Transport', slug: 'transport', count: 5 },
  { id: 'jc-2', name: 'Operations', slug: 'operations', count: 2 },
  { id: 'jc-3', name: 'Maintenance', slug: 'maintenance', count: 4 },
  { id: 'jc-4', name: 'Administration', slug: 'administration', count: 1 },
  { id: 'jc-5', name: 'Teaching', slug: 'teaching', count: 0 },
  { id: 'jc-6', name: 'Safety & Security', slug: 'safety', count: 1 },
];

const initialSupplierCategories = Object.entries(categoryLabels).map(([slug, name], index) => ({
  id: `sc-${index + 1}`,
  name,
  slug,
  count: Math.floor(Math.random() * 10) // Mock count
}));

type Category = {
  id: string;
  name: string;
  slug: string;
  count: number;
};

export function AdminSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Platform Settings</h2>
        <p className="text-muted-foreground">
          Manage categories and system configurations.
        </p>
      </div>

      <Tabs defaultValue="vehicles" className="space-y-4">
        <TabsList>
          <TabsTrigger value="vehicles">Vehicle Categories</TabsTrigger>
          <TabsTrigger value="jobs">Job Categories</TabsTrigger>
          <TabsTrigger value="suppliers">Supplier Categories</TabsTrigger>
        </TabsList>
        
        <TabsContent value="vehicles" className="space-y-4">
          <CategoryManager 
            title="Vehicle Categories" 
            description="Manage the types of vehicles that can be listed on the platform."
            initialData={initialVehicleCategories}
            type="vehicle"
          />
        </TabsContent>
        
        <TabsContent value="jobs" className="space-y-4">
          <CategoryManager 
            title="Job Categories" 
            description="Manage job roles and departments for recruitment."
            initialData={initialJobCategories}
            type="job"
          />
        </TabsContent>
        
        <TabsContent value="suppliers" className="space-y-4">
          <CategoryManager 
            title="Supplier Categories" 
            description="Manage service categories for vendor listings."
            initialData={initialSupplierCategories}
            type="supplier"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CategoryManager({ 
  title, 
  description, 
  initialData,
  type 
}: { 
  title: string; 
  description: string; 
  initialData: Category[];
  type: string;
}) {
  const [categories, setCategories] = useState<Category[]>(initialData);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({ name: '', slug: '' });

  const handleAdd = () => {
    const newCategory: Category = {
      id: `${type}-${Date.now()}`,
      name: formData.name,
      slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
      count: 0
    };
    
    setCategories([...categories, newCategory]);
    setIsAddOpen(false);
    setFormData({ name: '', slug: '' });
    toast.success(`${formData.name} category added successfully`);
  };

  const handleEdit = () => {
    if (!currentCategory) return;
    
    setCategories(categories.map(c => 
      c.id === currentCategory.id 
        ? { ...c, name: formData.name, slug: formData.slug } 
        : c
    ));
    setIsEditOpen(false);
    setCurrentCategory(null);
    setFormData({ name: '', slug: '' });
    toast.success('Category updated successfully');
  };

  const handleDelete = () => {
    if (!currentCategory) return;
    
    setCategories(categories.filter(c => c.id !== currentCategory.id));
    setIsDeleteOpen(false);
    setCurrentCategory(null);
    toast.success('Category deleted successfully');
  };

  const openEdit = (category: Category) => {
    setCurrentCategory(category);
    setFormData({ name: category.name, slug: category.slug });
    setIsEditOpen(true);
  };

  const openDelete = (category: Category) => {
    setCurrentCategory(category);
    setIsDeleteOpen(true);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
              <DialogDescription>
                Create a new category for {type}s.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="col-span-3"
                  placeholder="e.g. Electric Bus"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="slug" className="text-right">
                  Slug
                </Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="col-span-3"
                  placeholder="e.g. electric-bus"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
              <Button onClick={handleAdd} disabled={!formData.name}>Save Category</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Count</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell className="text-muted-foreground">{category.slug}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-secondary px-2 py-1 rounded-full">
                      {category.count} items
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(category)}>
                      <Pencil className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openDelete(category)}>
                      <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {categories.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                  No categories found. Add one to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Category</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-slug" className="text-right">
                  Slug
                </Label>
                <Input
                  id="edit-slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
              <Button onClick={handleEdit}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Category</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete <span className="font-semibold">{currentCategory?.name}</span>? 
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDelete}>Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
