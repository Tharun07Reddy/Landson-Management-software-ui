'use client';

import { useState, useEffect } from 'react';
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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Plus, Pencil, Trash2, Filter, ArrowUpDown, Search, RefreshCw, Upload, Edit, AlertTriangle, ImageIcon, Mail, Phone, Shield, ShieldCheck, ShieldX, User, UserPlus, UserCheck, UserX, Eye, EyeOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ImageUpload } from '@/components/ui/image-upload';
import { Skeleton } from '@/components/ui/skeleton';
import {
  getUsers,
  User as ApiUser,
  GetUsersParams,
  UsersResponse
} from '@/lib/api/users';

// Animation classes for elements
const fadeIn = "animate-in fade-in-50 duration-500";
const slideUp = "animate-in slide-in-from-bottom-5 duration-500 delay-100";
const slideRight = "animate-in slide-in-from-left-5 duration-500 delay-200";
const zoomIn = "animate-in zoom-in-95 duration-500 delay-300";

// Mock data for charts
const roleData = [
  { name: 'Admin', value: 2 },
  { name: 'Manager', value: 3 },
  { name: 'Staff', value: 3 },
];

const statusData = [
  { name: 'Active', value: 6 },
  { name: 'Inactive', value: 2 },
];

const COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)'];

// Map API User to display format
type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  lastLogin: string | null;
  createdAt: string;
  image?: string | null;
};

// Helper function to map API user to display user
const mapApiUserToDisplayUser = (apiUser: ApiUser): User => {
  return {
    id: apiUser.id,
    name: apiUser.fullName,
    email: apiUser.email,
    phone: apiUser.phoneNumber,
    role: 'User', // API doesn't have role, using default
    status: apiUser.status.toLowerCase(),
    lastLogin: apiUser.lastLoginAt,
    createdAt: apiUser.createdAt,
    image: apiUser.profileImage
  };
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState<Partial<User>>({
    name: '',
    email: '',
    phone: '',
    role: 'Staff',
    status: 'active',
    image: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const params: GetUsersParams = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm || undefined,
        status: statusFilter !== 'all' ? statusFilter.toUpperCase() as 'ACTIVE' | 'INACTIVE' : undefined,
        sortBy: sortField === 'createdAt' ? 'createdAt' : 'fullName',
        sortOrder: sortDirection.toLowerCase() as 'asc' | 'desc'
      };
      
      const response: UsersResponse = await getUsers(params);
      const mappedUsers = response.data.map(mapApiUserToDisplayUser);
      
      setUsers(mappedUsers);
      if (response.pagination) {
        setTotalItems(response.pagination.total);
        setTotalPages(response.pagination.totalPages);
      } else {
        setTotalItems(mappedUsers.length);
        setTotalPages(Math.ceil(mappedUsers.length / itemsPerPage));
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      // Handle error - could show toast notification
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch users on component mount and when dependencies change
  useEffect(() => {
    fetchUsers();
  }, [currentPage, itemsPerPage, searchTerm, statusFilter, sortField, sortDirection]);

  // Since we're using server-side pagination and filtering, 
  // we just use the users directly from the API
  const filteredUsers = users.filter(user => 
    roleFilter === 'all' || user.role === roleFilter
  );

  // Handle sort toggle
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1); // Reset to first page when sorting
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setRoleFilter('all');
    setStatusFilter('all');
    setSortField('createdAt');
    setSortDirection('desc');
    setCurrentPage(1);
  };

  // Handle search with debounce
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Handle filter changes
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleRoleFilterChange = (value: string) => {
    setRoleFilter(value);
    setCurrentPage(1);
  };

  // Total statistics - use totalItems from API for accurate count
  const totalUsers = totalItems;
  const activeUsers = users.filter(user => user.status === 'active').length;
  const inactiveUsers = users.filter(user => user.status === 'inactive').length;

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  // Format time for display
  const formatTime = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Handlers for CRUD operations
  const handleAddUser = () => {
    const newId = Math.max(...users.map(user => parseInt(user.id) || 0), 0) + 1;
    const userToAdd = {
      id: String(newId),
      name: newUser.name || '',
      email: newUser.email || '',
      phone: newUser.phone || '',
      role: newUser.role || 'Staff',
      status: newUser.status || 'active',
      lastLogin: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      image: newUser.image || '',
    };
    
    setUsers([...users, userToAdd]);
    setNewUser({ name: '', email: '', phone: '', role: 'Staff', status: 'active', image: '' });
    setIsAddDialogOpen(false);
  };
  
  const handleImageUpload = async (file: File): Promise<string> => {
    // In a real app, you would upload the file to a server here
    // and return the URL of the uploaded image
    const imageUrl = URL.createObjectURL(file);
    setNewUser({ ...newUser, image: imageUrl });
    return imageUrl;
  };
  
  const handleImageRemove = () => {
    setNewUser({ ...newUser, image: '' });
  };
  
  const handleEditImageUpload = async (file: File): Promise<string> => {
    const imageUrl = URL.createObjectURL(file);
    if (currentUser) {
      setCurrentUser({ ...currentUser, image: imageUrl });
    }
    return imageUrl;
  };
  
  const handleEditImageRemove = () => {
    if (currentUser) {
      setCurrentUser({ ...currentUser, image: '' });
    }
  };

  const handleEditUser = () => {
    if (!currentUser) return;
    
    const updatedUsers = users.map(user => 
      user.id === currentUser.id ? currentUser : user
    );
    
    setUsers(updatedUsers);
    setIsEditDialogOpen(false);
  };

  const handleDeleteUser = () => {
    if (!currentUser) return;
    
    const filteredUsers = users.filter(user => user.id !== currentUser.id);
    setUsers(filteredUsers);
    setIsDeleteDialogOpen(false);
  };

  return (
    <div className="container py-6 space-y-8">
      {/* Page Header */}
      <div className={`flex justify-between items-center ${fadeIn}`}>
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <Button onClick={() => setIsAddDialogOpen(true)} className="gap-1">
          <UserPlus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${slideUp}`}>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalUsers}</div>
          </CardContent>
          <CardFooter className="text-xs text-muted-foreground">Updated today</CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{activeUsers}</div>
          </CardContent>
          <CardFooter className="text-xs text-muted-foreground">Updated today</CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Inactive Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">{inactiveUsers}</div>
          </CardContent>
          <CardFooter className="text-xs text-muted-foreground">Updated today</CardFooter>
        </Card>
      </div>

      {/* Charts */}
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${slideRight}`}>
        <Card>
          <CardHeader>
            <CardTitle>Users by Role</CardTitle>
            <CardDescription>Distribution of users across different roles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={roleData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent || 0) * 100}%`}
                  >
                    {roleData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value, name) => [`${value} users`, `${name}`]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>User Status</CardTitle>
            <CardDescription>Active vs. Inactive users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent  || 0 * 100).toFixed(0)}%`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value, name) => [`${value} users`, `${name}`]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card className={zoomIn}>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>Manage your users and their access</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search and Filter Controls */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search users..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={roleFilter} onValueChange={handleRoleFilterChange}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Manager">Manager</SelectItem>
                  <SelectItem value="Staff">Staff</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" size="icon" onClick={resetFilters}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Users Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">ID</TableHead>
                  <TableHead className="min-w-[150px]">
                    <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort('name')}>
                      User
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead className="min-w-[180px]">
                    <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort('email')}>
                      Contact
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort('role')}>
                      Role
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort('status')}>
                      Status
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort('lastLogin')}>
                      Last Login
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  // Loading skeletons
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={`skeleton-${index}`}>
                      <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <Skeleton className="h-4 w-[120px]" />
                        </div>
                      </TableCell>
                      <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredUsers.length === 0 ? (
                  // No users found message
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <User className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">No users found</p>
                        {(searchTerm || roleFilter !== 'all' || statusFilter !== 'all') && (
                          <Button variant="outline" size="sm" onClick={resetFilters} className="mt-2">
                            <RefreshCw className="mr-2 h-3 w-3" />
                            Reset filters
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  // User rows
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.id}</TableCell>
                      <TableCell>
                        <HoverCard>
                          <HoverCardTrigger asChild>
                            <div className="flex items-center gap-3 cursor-pointer">
                              {user.image ? (
                                <div className="h-10 w-10 rounded-full overflow-hidden">
                                  <img src={user.image} alt={user.name} className="h-full w-full object-cover" />
                                </div>
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                  <User className="h-5 w-5 text-muted-foreground" />
                                </div>
                              )}
                              <div className="font-medium">{user.name}</div>
                            </div>
                          </HoverCardTrigger>
                          <HoverCardContent className="w-80">
                            <div className="flex justify-between space-x-4">
                              <div className="space-y-1">
                                <h4 className="text-sm font-semibold">{user.name}</h4>
                                <div className="flex items-center pt-2">
                                  <Mail className="h-4 w-4 mr-2 opacity-70" />
                                  <span className="text-sm">{user.email}</span>
                                </div>
                                <div className="flex items-center">
                                  <Phone className="h-4 w-4 mr-2 opacity-70" />
                                  <span className="text-sm">{user.phone}</span>
                                </div>
                                <div className="flex items-center">
                                  {user.role === 'Admin' ? (
                                    <ShieldCheck className="h-4 w-4 mr-2 text-blue-500" />
                                  ) : user.role === 'Manager' ? (
                                    <Shield className="h-4 w-4 mr-2 text-green-500" />
                                  ) : (
                                    <User className="h-4 w-4 mr-2 opacity-70" />
                                  )}
                                  <span className="text-sm">{user.role}</span>
                                </div>
                                <div className="flex items-center pt-2 text-xs text-muted-foreground">
                                  <span>Added: Recently</span>
                                </div>
                              </div>
                              <div className="h-20 w-20 rounded-md overflow-hidden">
                                {user.image ? (
                                  <img src={user.image} alt={user.name} className="h-full w-full object-cover" />
                                ) : (
                                  <div className="h-full w-full bg-muted flex items-center justify-center">
                                    <User className="h-8 w-8 text-muted-foreground" />
                                  </div>
                                )}
                              </div>
                            </div>
                          </HoverCardContent>
                        </HoverCard>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center">
                            <Mail className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                            <span className="text-sm">{user.email}</span>
                          </div>
                          <div className="flex items-center">
                            <Phone className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                            <span className="text-sm">{user.phone}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'Admin' ? 'default' : user.role === 'Manager' ? 'outline' : 'secondary'} className="flex w-fit items-center gap-1">
                          {user.role === 'Admin' ? (
                            <ShieldCheck className="h-3 w-3" />
                          ) : user.role === 'Manager' ? (
                            <Shield className="h-3 w-3" />
                          ) : (
                            <User className="h-3 w-3" />
                          )}
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.status === 'active' ? 'success' : 'destructive'} className="flex w-fit items-center gap-1">
                          {user.status === 'active' ? (
                            <Eye className="h-3 w-3" />
                          ) : (
                            <EyeOff className="h-3 w-3" />
                          )}
                          {user.status === 'active' ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{formatDate(user.lastLogin)}</div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setCurrentUser(user);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => {
                              setCurrentUser(user);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination Controls */}
          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">Show:</p>
              <Select
                value={`${itemsPerPage}`}
                onValueChange={(value) => {
                  setItemsPerPage(Number(value));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent side="top">
                  {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-6 lg:space-x-8">
              <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                Page {currentPage} of {totalPages || 1}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage <= 1}
                >
                  <span className="sr-only">Go to first page</span>
                  ⟪
                </Button>
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage <= 1}
                >
                  <span className="sr-only">Go to previous page</span>
                  ⟨
                </Button>
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                >
                  <span className="sr-only">Go to next page</span>
                  ⟩
                </Button>
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage >= totalPages}
                >
                  <span className="sr-only">Go to last page</span>
                  ⟫
                </Button>
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground">
              {totalItems > 0 ? (
                `Showing ${Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} to ${Math.min(currentPage * itemsPerPage, totalItems)} of ${totalItems} entries`
              ) : (
                'No users found'
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add User Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user account. Fill in all required information below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="mx-auto">
              <ImageUpload
                initialImage={newUser.image || ''}
                onImageUpload={handleImageUpload}
                onRemove={handleImageRemove}
                previewSize="lg"
                dropzoneText="Upload profile picture"
                buttonText="Select image"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={newUser.role}
                  onValueChange={(value) => setNewUser({ ...newUser, role: value })}
                >
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Manager">Manager</SelectItem>
                    <SelectItem value="Staff">Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="john.doe@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={newUser.phone}
                onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={newUser.status}
                onValueChange={(value) => setNewUser({ ...newUser, status: value })}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddUser}>Add User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information. Make changes to the fields below.
            </DialogDescription>
          </DialogHeader>
          {currentUser && (
            <div className="grid gap-4 py-4">
              <div className="mx-auto">
                <ImageUpload
                  initialImage={currentUser.image || ''}
                  onImageUpload={handleEditImageUpload}
                  onRemove={handleImageRemove}
                  previewSize="lg"
                  dropzoneText="Upload profile picture"
                  buttonText="Change image"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Full Name</Label>
                  <Input
                    id="edit-name"
                    value={currentUser.name}
                    onChange={(e) => setCurrentUser({ ...currentUser, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-role">Role</Label>
                  <Select
                    value={currentUser.role}
                    onValueChange={(value) => setCurrentUser({ ...currentUser, role: value })}
                  >
                    <SelectTrigger id="edit-role">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="Manager">Manager</SelectItem>
                      <SelectItem value="Staff">Staff</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={currentUser.email}
                  onChange={(e) => setCurrentUser({ ...currentUser, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone Number</Label>
                <Input
                  id="edit-phone"
                  value={currentUser.phone}
                  onChange={(e) => setCurrentUser({ ...currentUser, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={currentUser.status}
                  onValueChange={(value) => setCurrentUser({ ...currentUser, status: value })}
                >
                  <SelectTrigger id="edit-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditUser}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Delete User
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the user account and remove all associated data.
            </DialogDescription>
          </DialogHeader>
          {currentUser && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4 p-4 border rounded-lg">
                {currentUser.image ? (
                  <div className="h-16 w-16 rounded-full overflow-hidden">
                    <img src={currentUser.image} alt={currentUser.name} className="h-full w-full object-cover" />
                  </div>
                ) : (
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <div className="space-y-1">
                  <h3 className="font-medium">{currentUser.name}</h3>
                  <div className="text-sm text-muted-foreground">{currentUser.email}</div>
                  <div className="flex items-center gap-2">
                    <Badge variant={currentUser.role === 'Admin' ? 'default' : currentUser.role === 'Manager' ? 'outline' : 'secondary'} className="flex w-fit items-center gap-1">
                      {currentUser.role === 'Admin' ? (
                        <ShieldCheck className="h-3 w-3" />
                      ) : currentUser.role === 'Manager' ? (
                        <Shield className="h-3 w-3" />
                      ) : (
                        <User className="h-3 w-3" />
                      )}
                      {currentUser.role}
                    </Badge>
                    <Badge variant={currentUser.status === 'active' ? 'success' : 'destructive'} className="flex w-fit items-center gap-1">
                      {currentUser.status === 'active' ? (
                        <Eye className="h-3 w-3" />
                      ) : (
                        <EyeOff className="h-3 w-3" />
                      )}
                      {currentUser.status === 'active' ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="bg-destructive/10 text-destructive rounded-lg p-4 text-sm">
                <p>Are you sure you want to delete this user? This action cannot be undone.</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteUser}>Delete User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}