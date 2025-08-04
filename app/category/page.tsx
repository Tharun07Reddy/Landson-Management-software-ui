'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/components/ui/hover-card';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Plus, Pencil, Trash2, Filter, ArrowUpDown, Search, RefreshCw, Upload, Edit, AlertTriangle, ImageIcon, ChevronDown, ChevronRight, TreePine } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ImageUpload } from '@/components/ui/image-upload';
import { uploadSingleImage } from '@/lib/api/upload';
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  Category as ApiCategory,
  GetCategoriesParams,
  CategoriesResponse,
  getCategoryDashboardActivity,
  CategoryDashboardActivity
} from '@/lib/api/categories';
// Removed mock data - using real API data instead

// Animation classes for elements
const fadeIn = "animate-in fade-in-50 duration-500";
const slideUp = "animate-in slide-in-from-bottom-5 duration-500 delay-100";
const slideRight = "animate-in slide-in-from-left-5 duration-500 delay-200";
const zoomIn = "animate-in zoom-in-95 duration-500 delay-300";

const COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)'];

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string | null;
  parentId: string | null;
  level: number;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  parent?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  children: {
    id: string;
    name: string;
    slug: string;
  }[];
  productCount: number;
};

export default function CategoryPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [viewCategory, setViewCategory] = useState<Category | null>(null);
  const [isLoadingCategory, setIsLoadingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState<Partial<Category>>({
    name: '',
    slug: '',
    description: '',
    isActive: true,
    image: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // Dashboard state
  const [activityData, setActivityData] = useState<CategoryDashboardActivity | null>(null);
  const [isActivityLoading, setIsActivityLoading] = useState(false);
  
  // Expandable categories state
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Function to generate slug from name
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  };

  // Handle name change and auto-generate slug
  const handleNameChange = (name: string) => {
    const slug = generateSlug(name);
    setNewCategory({ ...newCategory, name, slug });
  };

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Fetching categories from API...', {
        currentPage,
        itemsPerPage,
        searchTerm,
        sortField,
        sortDirection
      });
      
      const params: GetCategoriesParams = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        sortBy: sortField,
        sortOrder: sortDirection as 'asc' | 'desc',
        status: 'all'
      };
      
      const response: CategoriesResponse = await getCategories(params);
      
      console.log('✅ Categories fetched successfully:', {
        categoriesCount: response.data.length,
        pagination: response.pagination,
        currentState: {
          currentPage,
          itemsPerPage,
          totalItems: response.pagination?.total,
          totalPages: response.pagination?.totalPages
        }
      });
      
      setCategories(response.data);
      
      if (response.pagination) {
        setTotalItems(response.pagination.total);
        setTotalPages(response.pagination.totalPages);
        console.log('📊 Pagination updated:', {
          total: response.pagination.total,
          totalPages: response.pagination.totalPages,
          currentPage: response.pagination.page,
          limit: response.pagination.limit
        });
      } else {
        console.warn('⚠️ No pagination data received from API, using fallback values');
        // Fallback: if we have categories but no pagination, assume there might be more
        const fallbackTotal = response.data.length;
        setTotalItems(fallbackTotal);
        setTotalPages(fallbackTotal > 0 ? Math.ceil(fallbackTotal / itemsPerPage) : 1);
      }
      
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
      // Fallback to empty array on error
      setCategories([]);
      setTotalItems(0);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Removed fetchDashboardData - using activity data instead
  
  // Fetch dashboard activity data
  const fetchActivityData = async () => {
    setIsActivityLoading(true);
    try {
      console.log('📊 Fetching activity data...');
      const data = await getCategoryDashboardActivity('week');
      setActivityData(data);
      console.log('✅ Activity data fetched successfully:', {
        totalCategories: data.totalCategories,
        recentActivityCount: data.recentActivity?.length || 0,
        productsByCategoryCount: data.productsByCategory?.length || 0
      });
    } catch (error) {
      console.error('❌ Error fetching activity data:', error);
    } finally {
      setIsActivityLoading(false);
    }
  };
  
  // Load categories on component mount and when dependencies change
  useEffect(() => {
    fetchCategories();
  }, [currentPage, itemsPerPage, searchTerm, sortField, sortDirection]);
  
  // Load dashboard data on component mount
  useEffect(() => {
    fetchActivityData();
  }, []);

  // Handle sort toggle
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    // Reset to first page when sorting changes
    setCurrentPage(1);
  };

  // Total statistics from activity data or fallback to local data
  const totalCategories = activityData?.totalCategories || totalItems || categories.length;
  const activeCategories = activityData?.activeCategories || categories.filter(cat => cat.isActive).length;
  const totalProducts = activityData?.totalProducts || categories.reduce((sum, cat) => sum + cat.productCount, 0);

  // Handle viewing a single category
  const handleViewCategory = async (categoryId: string) => {
    try {
      setIsLoadingCategory(true);
      console.log('👁️ Viewing category with ID:', categoryId);
      
      const category = await getCategoryById(categoryId);
      setViewCategory(category);
      setIsViewDialogOpen(true);
      
      console.log('✅ Category loaded for viewing:', category.name);
    } catch (error) {
      console.error('❌ Error loading category:', error);
    } finally {
      setIsLoadingCategory(false);
    }
  };

  // Handlers for CRUD operations
  const handleAddCategory = async () => {
    try {
      const categoryToAdd = {
        name: newCategory.name || '',
        slug: newCategory.slug || generateSlug(newCategory.name || ''),
        description: newCategory.description || '',
        isActive: newCategory.isActive ?? true,
        image: newCategory.image || null,
      };
      
      console.log('📝 Creating new category:', {
        name: categoryToAdd.name,
        slug: categoryToAdd.slug,
        description: categoryToAdd.description,
        isActive: categoryToAdd.isActive,
        imageUrl: categoryToAdd.image
      });
      
      await createCategory(categoryToAdd);
      
      // Refresh the categories list
      await fetchCategories();
      
      setNewCategory({ name: '', slug: '', description: '', isActive: true, image: '' });
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('❌ Error creating category:', error);
    }
  };
  
  const handleImageChange = (url: string) => {
    console.log('🔄 Category image changed:', url);
    setNewCategory({ ...newCategory, image: url });
  };
  
  const handleImageRemove = () => {
    console.log('🗑️ Category image removed');
    setNewCategory({ ...newCategory, image: null });
  };
  
  const handleEditImageChange = (url: string) => {
    console.log('🔄 Category edit image changed:', url);
    if (currentCategory) {
      setCurrentCategory({ ...currentCategory, image: url });
    }
  };
  
  const handleEditImageRemove = () => {
    console.log('🗑️ Category edit image removed');
    if (currentCategory) {
      setCurrentCategory({ ...currentCategory, image: '' });
    }
  };


  const handleEditCategory = async () => {
    if (!currentCategory) return;
    
    try {
      console.log('✏️ Updating category:', currentCategory.name);
      
      await updateCategory(currentCategory.id, {
        name: currentCategory.name,
        description: currentCategory.description,
        isActive: currentCategory.isActive,
        image: currentCategory.image
      });
      
      // Refresh the categories list
      await fetchCategories();
      
      setIsEditDialogOpen(false);
      setCurrentCategory(null);
      
      console.log('✅ Category updated successfully');
    } catch (error) {
      console.error('❌ Error updating category:', error);
    }
  };

  const handleDeleteCategory = async () => {
    if (!currentCategory) return;
    
    try {
      console.log('🗑️ Deleting category:', currentCategory.name);
      
      await deleteCategory(currentCategory.id);
      
      // Refresh the categories list
      await fetchCategories();
      
      setIsDeleteDialogOpen(false);
      setCurrentCategory(null);
      
      console.log('✅ Category deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting category:', error);
    }
  };

  // Search is handled by the API, reset to first page when search changes
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // Toggle category expansion
  const toggleCategoryExpansion = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  // Render category row with children
  const renderCategoryRow = (category: Category, index: number, level: number = 0): React.ReactNode => {
    const isExpanded = expandedCategories.has(category.id);
    const hasChildren = category.children && category.children.length > 0;
    
    return (
      <>
        <HoverCard key={category.id}>
          <HoverCardTrigger asChild>
            <TableRow 
              className="cursor-pointer hover:bg-muted/50 transition-colors duration-200"
              onClick={() => handleViewCategory(category.id)}
            >
              <TableCell>{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
              <TableCell>
                {category.image ? (
                  <div className="relative h-10 w-10 overflow-hidden rounded-md transition-all duration-300 hover:scale-105 hover:shadow-md">
                    <img 
                      src={category.image} 
                      alt={category.name} 
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">No img</span>
                  </div>
                )}
              </TableCell>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <div style={{ marginLeft: `${level * 20}px` }} className="flex items-center gap-1">
                    {hasChildren && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-muted"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCategoryExpansion(category.id);
                        }}
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-3 w-3" />
                        ) : (
                          <ChevronRight className="h-3 w-3" />
                        )}
                      </Button>
                    )}
                    {level > 0 && (
                      <div className="w-4 h-4 flex items-center justify-center">
                        <TreePine className="h-3 w-3 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <span className="hover:text-primary transition-colors duration-200">{category.name}</span>
                </div>
              </TableCell>
              <TableCell>{category.description}</TableCell>
              <TableCell className="text-center">
                <div className="flex justify-center">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-muted/50 transition-all duration-200 hover:bg-muted">
                    {category.productCount}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-center">
                <div className="flex justify-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-all duration-300 hover:scale-105 ${category.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {category.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-center">
                <div className="text-sm text-muted-foreground">
                  {new Date(category.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                     variant="ghost"
                     size="icon"
                     onClick={(e) => {
                       e.stopPropagation();
                       setCurrentCategory(category);
                       setIsEditDialogOpen(true);
                     }}
                     className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-200"
                   >
                     <Pencil className="h-4 w-4" />
                   </Button>
                   <Button
                     variant="ghost"
                     size="icon"
                     onClick={(e) => {
                       e.stopPropagation();
                       setCurrentCategory(category);
                       setIsDeleteDialogOpen(true);
                     }}
                     className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
                   >
                     <Trash2 className="h-4 w-4" />
                   </Button>
                </div>
              </TableCell>
            </TableRow>
          </HoverCardTrigger>
          <HoverCardContent className="w-80">
            <div className="space-y-4">
              {category.image && (
                <div className="aspect-video overflow-hidden rounded-md">
                  <img 
                    src={category.image} 
                    alt={category.name} 
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className={`h-3 w-3 rounded-full ${category.isActive ? 'bg-green-500' : 'bg-gray-500'}`} />
                  <h4 className="text-sm font-semibold">{category.name}</h4>
                </div>
                <p className="text-sm text-muted-foreground">{category.description || "No description available"}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-muted/50 p-2 rounded-md">
                  <div className="text-xs text-muted-foreground">Products</div>
                  <div className="font-medium">{category.productCount}</div>
                </div>
                <div className="bg-muted/50 p-2 rounded-md">
                  <div className="text-xs text-muted-foreground">Status</div>
                  <div className="font-medium">{category.isActive ? 'Active' : 'Inactive'}</div>
                </div>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
        {/* Render children if expanded */}
        {hasChildren && isExpanded && category.children.map((child, childIndex) => {
          // Create a full category object for the child
          const childCategory: Category = {
            id: child.id,
            name: child.name,
            slug: child.slug,
            description: '',
            image: null,
            parentId: category.id,
            level: category.level + 1,
            isActive: true,
            sortOrder: 0,
            createdAt: '',
            updatedAt: '',
            deletedAt: null,
            parent: {
              id: category.id,
              name: category.name,
              slug: category.slug
            },
            children: [],
            productCount: 0
          };
          return renderCategoryRow(childCategory, childIndex, level + 1);
        })}
      </>
    );
  };

  return (
    <div className="container mx-auto py-6 space-y-8">
      {/* Header with title and add button */}
      <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${fadeIn}`}>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Category Management</h1>
          <p className="text-muted-foreground mt-1">Manage product categories and their details</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="group transition-all duration-300 hover:shadow-md">
          <Plus className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform duration-200" /> 
          Add Category
        </Button>
      </div>

      {/* Dashboard Analytics */}
      {activityData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Categories</p>
                  <p className="text-2xl font-bold">{activityData.totalCategories}</p>
                </div>
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-sm font-bold">T</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Categories</p>
                  <p className="text-2xl font-bold text-green-600">{activityData.activeCategories}</p>
                </div>
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-sm font-bold">A</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Inactive Categories</p>
                  <p className="text-2xl font-bold text-red-600">{activityData.inactiveCategories}</p>
                </div>
                <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 text-sm font-bold">I</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Products</p>
                  <p className="text-2xl font-bold">{activityData.totalProducts}</p>
                </div>
                <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 text-sm font-bold">P</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Statistics Cards */}
      <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${slideUp}`}>
        <Card className="overflow-hidden border-l-4 border-l-primary transition-all duration-300 hover:shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Categories</CardTitle>
            <CardDescription>All product categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline">
              <span className="text-3xl font-bold">{totalCategories}</span>
              <span className="ml-2 text-muted-foreground text-sm">categories</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden border-l-4 border-l-green-500 transition-all duration-300 hover:shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Active Categories</CardTitle>
            <CardDescription>Currently active categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline">
              <span className="text-3xl font-bold">{activeCategories}</span>
              <span className="ml-2 text-muted-foreground text-sm">active</span>
              <span className="ml-auto text-sm text-muted-foreground">{Math.round((activeCategories / totalCategories) * 100)}%</span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full mt-2 overflow-hidden">
              <div 
                className="h-full bg-green-500 transition-all duration-500 ease-out"
                style={{ width: `${(activeCategories / totalCategories) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden border-l-4 border-l-blue-500 transition-all duration-300 hover:shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Products</CardTitle>
            <CardDescription>Products across all categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline">
              <span className="text-3xl font-bold">{totalProducts}</span>
              <span className="ml-2 text-muted-foreground text-sm">products</span>
              <span className="ml-auto text-sm text-muted-foreground">{Math.round(totalProducts / totalCategories)} avg/category</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${slideRight}`}>
        <Card className="transition-all duration-300 hover:shadow-md overflow-hidden">
          <CardHeader>
            <CardTitle>Products by Category</CardTitle>
            <CardDescription>Distribution of products across categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={activityData?.productsByCategory?.slice(0, 8).map(cat => ({
                    name: cat.name,
                    products: cat.product_count
                  })) || []}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="products" fill="var(--chart-1)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
          <CardFooter className="text-sm text-muted-foreground">
            Updated today
          </CardFooter>
        </Card>

        <Card className="transition-all duration-300 hover:shadow-md overflow-hidden">
          <CardHeader>
            <CardTitle>Category Status</CardTitle>
            <CardDescription>Active vs Inactive categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={activityData?.categoryStatus?.breakdown?.map(item => ({
                      name: item.isActive ? 'Active' : 'Inactive',
                      value: item.count
                    })) || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent || 0) * 100}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {(activityData?.categoryStatus?.breakdown || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={({ payload }) => {
                    if (payload && payload.length) {
                      return (
                        <div className="bg-white p-2 border rounded shadow">
                          <p>{`${payload[0].name}: ${payload[0].value}`}</p>
                        </div>
                      );
                    }
                    return null;
                  }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between text-sm text-muted-foreground">
            <span>Active: {activeCategories}</span>
            <span>Inactive: {totalCategories - activeCategories}</span>
          </CardFooter>
        </Card>
      </div>

      {/* Recent Activity Timeline - Tree Structure */}
      {activityData?.recentActivity && activityData.recentActivity.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Activity Tree - Center */}
          <Card className={`lg:col-span-2 ${slideRight}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TreePine className="h-5 w-5" />
                Recent Activity Tree
              </CardTitle>
              <CardDescription>Hierarchical view of category updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {activityData.recentActivity.slice(0, 8).map((activity, index) => {
                  const isLastInLevel = index === activityData.recentActivity.length - 1 || 
                    (index < activityData.recentActivity.length - 1 && 
                     activityData.recentActivity[index + 1].level <= activity.level);
                  
                  return (
                    <div key={activity.id} className="relative">
                      {/* Tree Lines */}
                      <div className="flex items-start">
                        {/* Indentation based on level */}
                        <div className="flex items-center" style={{ marginLeft: `${(activity.level - 1) * 24}px` }}>
                          {activity.level > 1 && (
                            <div className="flex items-center">
                              <div className="w-6 h-px bg-border"></div>
                              <div className={`w-px bg-border ${isLastInLevel ? 'h-4' : 'h-8'}`}></div>
                            </div>
                          )}
                          
                          {/* Tree Node */}
                          <div className="flex items-center gap-3 p-2 rounded-lg border bg-card hover:bg-muted/50 transition-colors min-w-0 flex-1">
                            <div className="flex-shrink-0">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                activity.level === 1 
                                  ? 'bg-primary text-primary-foreground' 
                                  : activity.level === 2 
                                  ? 'bg-secondary text-secondary-foreground'
                                  : 'bg-muted text-muted-foreground'
                              }`}>
                                <span className="text-xs font-bold">{activity.level}</span>
                              </div>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-sm font-medium truncate">
                                  {activity.name}
                                </p>
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  activity.isActive 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {activity.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {activity.productCount} products • Updated {new Date(activity.updatedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Vertical line for children */}
                      {!isLastInLevel && activity.level < 3 && (
                        <div 
                          className="absolute w-px bg-border" 
                          style={{ 
                            left: `${(activity.level - 1) * 24 + 12}px`, 
                            top: '32px', 
                            height: '16px' 
                          }}
                        ></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
          
          {/* Side Activities */}
          <Card className={`${slideRight} delay-100`}>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
              <CardDescription>Recent activity summary</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Updates</span>
                    <span className="text-lg font-bold text-primary">{activityData.recentActivity.length}</span>
                  </div>
                </div>
                
                <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Active Categories</span>
                    <span className="text-lg font-bold text-green-600">
                      {activityData.recentActivity.filter(a => a.isActive).length}
                    </span>
                  </div>
                </div>
                
                <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Avg Level</span>
                    <span className="text-lg font-bold text-blue-600">
                      {(activityData.recentActivity.reduce((sum, a) => sum + a.level, 0) / activityData.recentActivity.length).toFixed(1)}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Recent Changes</h4>
                  {activityData.recentActivity.slice(0, 3).map((activity) => (
                    <div key={activity.id} className="p-2 rounded border bg-muted/20">
                      <p className="text-xs font-medium truncate">{activity.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Category Table */}
      <Card className={`${zoomIn}`}>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardDescription>Manage your product categories</CardDescription>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Input
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-8"
                />
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => {
                  setSearchTerm('');
                  setSortField('name');
                  setSortDirection('asc');
                }}
                className="h-9 w-9 transition-all duration-200 hover:bg-muted"
                title="Reset filters"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  S.No
                </TableHead>
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead>
                  <Button variant="ghost" className="p-0 font-medium" onClick={() => handleSort('name')}>
                    Name
                    {sortField === 'name' && (
                      <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === 'desc' ? 'rotate-180' : ''} transition-transform duration-200`} />
                    )}
                  </Button>
                </TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-center">
                  <Button variant="ghost" className="p-0 font-medium" onClick={() => handleSort('products')}>
                    Products
                    {sortField === 'products' && (
                      <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === 'desc' ? 'rotate-180' : ''} transition-transform duration-200`} />
                    )}
                  </Button>
                </TableHead>
                <TableHead className="text-center">
                  <Button variant="ghost" className="p-0 font-medium" onClick={() => handleSort('status')}>
                    Status
                    {sortField === 'status' && (
                      <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === 'desc' ? 'rotate-180' : ''} transition-transform duration-200`} />
                    )}
                  </Button>
                </TableHead>
                <TableHead className="text-center">
                  <Button variant="ghost" className="p-0 font-medium" onClick={() => handleSort('createdAt')}>
                    Created At
                    {sortField === 'createdAt' && (
                      <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === 'desc' ? 'rotate-180' : ''} transition-transform duration-200`} />
                    )}
                  </Button>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array(5).fill(0).map((_, index) => (
                  <TableRow key={`skeleton-${index}`} className="animate-pulse">
                    <TableCell><div className="h-4 bg-muted rounded w-8"></div></TableCell>
                    <TableCell><div className="h-10 w-10 bg-muted rounded"></div></TableCell>
                    <TableCell><div className="h-4 bg-muted rounded w-24"></div></TableCell>
                    <TableCell><div className="h-4 bg-muted rounded w-40"></div></TableCell>
                    <TableCell className="text-center"><div className="h-4 bg-muted rounded w-8 mx-auto"></div></TableCell>
                    <TableCell className="text-center"><div className="h-6 bg-muted rounded w-16 mx-auto"></div></TableCell>
                    <TableCell className="text-center"><div className="h-4 bg-muted rounded w-20 mx-auto"></div></TableCell>
                    <TableCell className="text-right"><div className="h-8 bg-muted rounded w-20 ml-auto"></div></TableCell>
                  </TableRow>
                ))
              ) : categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Filter className="h-8 w-8 text-muted-foreground/60" />
                      <p>No categories found</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          setSearchTerm('');
                          setSortField('name');
                          setSortDirection('asc');
                        }}
                        className="mt-2"
                      >
                        <RefreshCw className="mr-2 h-3 w-3" />
                        Reset filters
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((category, index) => (
                  <React.Fragment key={category.id}>
                    {renderCategoryRow(category, index)}
                  </React.Fragment>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <div className="text-sm text-muted-foreground">
              {categories.length > 0 ? (
                `Showing ${Math.max(1, ((currentPage - 1) * itemsPerPage) + 1)} to ${Math.min(currentPage * itemsPerPage, Math.max(totalItems, categories.length))} of ${Math.max(totalItems, categories.length)} categories`
              ) : (
                'No categories found'
              )}
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="items-per-page" className="text-sm text-muted-foreground whitespace-nowrap">
                Show:
              </Label>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(value) => {
                  setItemsPerPage(Number(value));
                  setCurrentPage(1); // Reset to first page when changing items per page
                }}
              >
                <SelectTrigger className="w-20 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1 && !isLoading) {
                        setCurrentPage(prev => prev - 1);
                      }
                    }}
                    className={currentPage === 1 || isLoading ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
                
                {/* First page */}
                {currentPage > 3 && (
                  <>
                    <PaginationItem>
                      <PaginationLink 
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (!isLoading) setCurrentPage(1);
                        }}
                        className="cursor-pointer"
                      >
                        1
                      </PaginationLink>
                    </PaginationItem>
                    {currentPage > 4 && (
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )}
                  </>
                )}
                
                {/* Page numbers around current page */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                  if (pageNum > totalPages) return null;
                  
                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (!isLoading) setCurrentPage(pageNum);
                        }}
                        isActive={currentPage === pageNum}
                        className="cursor-pointer"
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                
                {/* Last page */}
                {currentPage < totalPages - 2 && (
                  <>
                    {currentPage < totalPages - 3 && (
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )}
                    <PaginationItem>
                      <PaginationLink 
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (!isLoading) setCurrentPage(totalPages);
                        }}
                        className="cursor-pointer"
                      >
                        {totalPages}
                      </PaginationLink>
                    </PaginationItem>
                  </>
                )}
                
                <PaginationItem>
                  <PaginationNext 
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < totalPages && !isLoading) {
                        setCurrentPage(prev => prev + 1);
                      }
                    }}
                    className={currentPage === totalPages || isLoading ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </CardFooter>
      </Card>

      {/* Add Category Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Add New Category</DialogTitle>
            <DialogDescription>
              Create a new product category. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-5 py-4">
            <div className="grid gap-2">
              <Label htmlFor="image" className="text-sm font-medium">Category Image</Label>
              <div className="border border-dashed border-input rounded-lg p-4 transition-all hover:border-primary/50">
                <ImageUpload
                  value={newCategory.image || "N/A"}
                  onChange={handleImageChange}
                  onRemove={handleImageRemove}
                  maxSizeMB={2}
                  acceptedTypes={['image/jpeg', 'image/png', 'image/webp']}
                  buttonText="Upload category image"
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground mt-2">Recommended: 800x600px. Max 2MB.</p>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-sm font-medium">Name</Label>
              <Input
                id="name"
                value={newCategory.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Category name"
                className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="slug" className="text-sm font-medium">Slug</Label>
              <Input
                id="slug"
                value={newCategory.slug}
                onChange={(e) => setNewCategory({ ...newCategory, slug: e.target.value })}
                placeholder="category-slug"
                className="transition-all duration-200 focus:ring-2 focus:ring-primary/20 font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">Auto-generated from name. You can edit if needed.</p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description" className="text-sm font-medium">Description</Label>
              <Textarea
                id="description"
                value={newCategory.description}
                onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                placeholder="Category description"
                className="transition-all duration-200 focus:ring-2 focus:ring-primary/20 min-h-[80px]"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status" className="text-sm font-medium">Status</Label>
              <Select
                value={newCategory.isActive ? "active" : "inactive"}
                onValueChange={(value) => setNewCategory({ ...newCategory, isActive: value === "active" })}
              >
                <SelectTrigger id="status" className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">Active categories will be visible in your store.</p>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="transition-all duration-200 hover:bg-muted">Cancel</Button>
            <Button onClick={handleAddCategory} className="transition-all duration-200 hover:shadow-md gap-2">
              <Plus className="h-4 w-4" />
              Save Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Edit Category</DialogTitle>
            <DialogDescription>
              Update the category details. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          {currentCategory && (
            <div className="grid gap-5 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-image" className="text-sm font-medium">Category Image</Label>
                <div className="border border-dashed border-input rounded-lg p-4 transition-all hover:border-primary/50">
                  <ImageUpload
                    value={currentCategory.image || "N/A"}
                    onChange={handleEditImageChange}
                    onRemove={handleEditImageRemove}
                    maxSizeMB={2}
                    acceptedTypes={['image/jpeg', 'image/png', 'image/webp']}
                    buttonText="Upload category image"
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground mt-2">Recommended: 800x600px. Max 2MB.</p>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-name" className="text-sm font-medium">Name</Label>
                <Input
                  id="edit-name"
                  value={currentCategory.name}
                  onChange={(e) => setCurrentCategory({ ...currentCategory, name: e.target.value })}
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description" className="text-sm font-medium">Description</Label>
                <Textarea
                  id="edit-description"
                  value={currentCategory.description}
                  onChange={(e) => setCurrentCategory({ ...currentCategory, description: e.target.value })}
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary/20 min-h-[80px]"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-status" className="text-sm font-medium">Status</Label>
                <Select
                  value={currentCategory.isActive ? "active" : "inactive"}
                  onValueChange={(value) => setCurrentCategory({ ...currentCategory, isActive: value === "active" })}
                >
                  <SelectTrigger id="edit-status" className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">Active categories will be visible in your store.</p>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="transition-all duration-200 hover:bg-muted">Cancel</Button>
            <Button onClick={handleEditCategory} className="transition-all duration-200 hover:shadow-md gap-2">
              <Pencil className="h-4 w-4" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Category Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl text-destructive font-bold">Delete Category</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the category and remove it from our servers.
            </DialogDescription>
          </DialogHeader>
          {currentCategory && (
            <div className="my-4 p-4 border border-destructive/20 bg-destructive/5 rounded-md space-y-4">
              <div className="flex items-center gap-3">
                {currentCategory.image && (
                  <div className="relative h-12 w-12 rounded-md overflow-hidden border border-input">
                    <img
                      src={currentCategory.image}
                      alt={currentCategory.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <div>
                  <h3 className="font-medium">{currentCategory.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-1">{currentCategory.description}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <p className="font-medium">{currentCategory.isActive ? 'Active' : 'Inactive'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Products</p>
                  <p className="font-medium">{currentCategory.productCount} products</p>
                </div>
              </div>
              
              <div className="bg-destructive/10 p-3 rounded-md border border-destructive/20">
                <p className="text-sm text-destructive flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Warning: Deleting this category will remove it from all associated products.
                </p>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
              className="transition-all duration-200 hover:bg-muted"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteCategory}
              className="transition-all duration-200 hover:shadow-md gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Category Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Category Details</DialogTitle>
            <DialogDescription>
              View detailed information about this category.
            </DialogDescription>
          </DialogHeader>
          {isLoadingCategory ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading category details...</span>
            </div>
          ) : viewCategory && (
            <div className="space-y-6 py-4">
              {/* Category Header */}
              <div className="flex items-start gap-4 p-4 border rounded-lg bg-muted/30">
                {viewCategory.image && (
                  <div className="relative h-16 w-16 rounded-lg overflow-hidden border border-input flex-shrink-0">
                    <img
                      src={viewCategory.image}
                      alt={viewCategory.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold">{viewCategory.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{viewCategory.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={viewCategory.isActive ? "default" : "secondary"}>
                      {viewCategory.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">Level {viewCategory.level}</span>
                  </div>
                </div>
              </div>

              {/* Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Basic Information */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Slug</p>
                      <p className="text-sm font-mono bg-muted px-2 py-1 rounded">{viewCategory.slug}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Sort Order</p>
                      <p className="text-sm">{viewCategory.sortOrder}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Product Count</p>
                      <p className="text-sm font-medium">{viewCategory.productCount} products</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Parent Category */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Parent Category</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {viewCategory.parent ? (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">{viewCategory.parent.name}</p>
                        <p className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded">{viewCategory.parent.slug}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No parent category (Root level)</p>
                    )}
                  </CardContent>
                </Card>

                {/* Timestamps */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Timestamps</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Created</p>
                      <p className="text-sm">{new Date(viewCategory.createdAt).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Updated</p>
                      <p className="text-sm">{new Date(viewCategory.updatedAt).toLocaleString()}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Child Categories */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Child Categories</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {viewCategory.children && viewCategory.children.length > 0 ? (
                      <div className="space-y-2">
                        {viewCategory.children.map((child) => (
                          <div key={child.id} className="flex items-center justify-between p-2 border rounded">
                            <div>
                              <p className="text-sm font-medium">{child.name}</p>
                              <p className="text-xs text-muted-foreground">{child.slug}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No child categories</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Products Section */}
              {viewCategory.productCount > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Associated Products</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-3 rounded-md bg-muted/50">
                      <p className="text-sm font-medium">{viewCategory.productCount} products associated with this category</p>
                      <p className="text-xs text-muted-foreground mt-1">View the Products page to see all products in this category</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={() => setIsViewDialogOpen(false)}
              className="transition-all duration-200 hover:bg-muted"
            >
              Close
            </Button>
            {viewCategory && (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setCurrentCategory(viewCategory);
                    setIsViewDialogOpen(false);
                    setIsEditDialogOpen(true);
                  }}
                  className="transition-all duration-200 hover:bg-muted gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => {
                    setCurrentCategory(viewCategory);
                    setIsViewDialogOpen(false);
                    setIsDeleteDialogOpen(true);
                  }}
                  className="transition-all duration-200 hover:shadow-md gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}