/**
 * Categories API
 * 
 * This file contains API functions for managing categories.
 */

import { apiClient } from './axios';
import { categoryEndpoints } from './endpoints';

/**
 * Dashboard analytics response types
 */
export interface CategoryDashboardOverview {
  totalCategories: number;
  activeCategories: number;
  inactiveCategories: number;
  totalProducts: number;
  timestamp: string;
  categoryDistribution: {
    level: number;
    count: number;
    active_count: number;
    inactive_count: number;
  }[];
  recentActivity: {
    id: string;
    name: string;
    slug: string;
    level: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    productCount: number;
  }[];
}

export interface CategoryDashboardDistribution {
  totalCategories: number;
  activeCategories: number;
  inactiveCategories: number;
  totalProducts: number;
  timestamp: string;
  categoryDistribution: {
    level: number;
    count: number;
    active_count: number;
    inactive_count: number;
  }[];
  productsByCategory: {
    id: string;
    name: string;
    slug: string;
    level: number;
    product_count: number;
    average_price: number | null;
    total_stock: number | null;
  }[];
  averageProductsPerCategory: {
    average_products_per_category: number;
    max_products_in_category: number;
    min_products_in_category: number;
  };
  categoryStatus: {
    active: number;
    inactive: number;
    breakdown: {
      isActive: boolean;
      count: number;
      percentage: string;
    }[];
  };
  topPerformingCategories: any[];
  recentActivity: {
    id: string;
    name: string;
    slug: string;
    level: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    productCount: number;
  }[];
  hierarchyAnalytics: {
    maxDepth: number;
    rootCategories: number;
    levelStats: {
      level: number;
      total_categories: number;
      active_categories: number;
      avg_products_per_category: string;
    }[];
  };
}

export interface CategoryDashboardProducts {
  topCategories: Array<{
    categoryId: string;
    categoryName: string;
    productCount: number;
    percentage: number;
  }>;
  totalProducts: number;
}

export interface CategoryDashboardStatus {
  statusTrends: Array<{
    date: string;
    activeCount: number;
    inactiveCount: number;
    totalCount: number;
  }>;
  currentStatus: {
    active: number;
    inactive: number;
  };
}

export interface CategoryDashboardPerformance {
  topPerformers: Array<{
    categoryId: string;
    categoryName: string;
    productCount: number;
    recentGrowth: number;
    score: number;
  }>;
  averagePerformance: number;
}

export interface CategoryDashboardActivity {
  totalCategories: number;
  activeCategories: number;
  inactiveCategories: number;
  totalProducts: number;
  timestamp: string;
  categoryDistribution: Array<{
    level: number;
    count: number;
    active_count: number;
    inactive_count: number;
  }>;
  productsByCategory: Array<{
    id: string;
    name: string;
    slug: string;
    level: number;
    product_count: number;
    average_price: number | null;
    total_stock: number | null;
  }>;
  averageProductsPerCategory: {
    average_products_per_category: number;
    max_products_in_category: number;
    min_products_in_category: number;
  };
  categoryStatus: {
    active: number;
    inactive: number;
    breakdown: Array<{
      isActive: boolean;
      count: number;
      percentage: string;
    }>;
  };
  topPerformingCategories: Array<any>;
  recentActivity: Array<{
    id: string;
    name: string;
    slug: string;
    level: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    productCount: number;
  }>;
  hierarchyAnalytics: {
    maxDepth: number;
    rootCategories: number;
    levelStats: Array<{
      level: number;
      total_categories: number;
      active_categories: number;
      avg_products_per_category: string;
    }>;
  };
}

export interface CategoryDashboardHierarchy {
  hierarchyStats: {
    maxDepth: number;
    avgDepth: number;
    totalLevels: number;
  };
  levelDistribution: Array<{
    level: number;
    count: number;
    percentage: number;
  }>;
  parentChildRelations: Array<{
    parentId: string;
    parentName: string;
    childrenCount: number;
  }>;
}

/**
 * Category type definition based on the API response
 */
export interface Category {
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
}

/**
 * API response type for categories list
 */
export interface CategoriesResponse {
  data: Category[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Parameters for getting categories
 * Note: Backend expects 'q' for search, not 'search'
 * Status filtering is not supported by the backend
 */
export interface GetCategoriesParams {
  page?: number;
  limit?: number;
  search?: string; // Will be mapped to 'q' parameter in API call
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: 'active' | 'inactive' | 'all'; // Not sent to backend, kept for UI compatibility
  parentId?: string;
}

/**
 * Fetch categories from the API
 */
export async function getCategories(params: GetCategoriesParams = {}): Promise<CategoriesResponse> {
  try {
    console.log('🔄 Fetching categories with params:', params);
    
    // Build query params object, only including defined values
    const queryParams: Record<string, any> = {
      page: params.page || 1,
      limit: params.limit || 10,
    };
    
    // Only add optional parameters if they have meaningful values
    if (params.search && params.search.trim()) {
      queryParams.q = params.search; // Use 'q' instead of 'search'
    }
    
    if (params.sortBy) {
      queryParams.sortBy = params.sortBy;
    }
    
    if (params.sortOrder) {
      queryParams.sortOrder = params.sortOrder;
    }
    
    if (params.parentId) {
      queryParams.parentId = params.parentId;
    }
    
    // Remove status parameter as backend doesn't accept it
    // if (params.status && params.status !== 'all') {
    //   queryParams.isActive = params.status === 'active';
    // }
    
    const response = await apiClient.get(categoryEndpoints.list, {
      params: queryParams
    });
    
    console.log('✅ Categories fetched successfully:', {
      totalCategories: response.data.data?.length || 0,
      pagination: response.data.pagination
    });
    
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching categories:', error);
    throw error;
  }
}

/**
 * Create a new category
 */
// export async function createCategory(categoryData: Partial<Category>): Promise<Category> {
//   try {
//     console.log('🔄 Creating category:', categoryData);
    
//     const response = await apiClient.post(categoryEndpoints.create, categoryData);
    
//     console.log('✅ Category created successfully:', response.data);
    
//     return response.data;
//   } catch (error) {
//     console.error('❌ Error creating category:', error);
//     throw error;
//   }
// }

/**
 * Update an existing category
 */
// export async function updateCategory(categoryId: string, categoryData: Partial<Category>): Promise<Category> {
//   try {
//     console.log('🔄 Updating category:', { categoryId, categoryData });
    
//     const response = await apiClient.put(categoryEndpoints.update(categoryId), categoryData);
    
//     console.log('✅ Category updated successfully:', response.data);
    
//     return response.data;
//   } catch (error) {
//     console.error('❌ Error updating category:', error);
//     throw error;
//   }
// }

/**
 * Delete a category
 */
// export async function deleteCategory(categoryId: string): Promise<void> {
//   try {
//     console.log('🔄 Deleting category:', categoryId);
    
//     await apiClient.delete(categoryEndpoints.delete(categoryId));
    
//     console.log('✅ Category deleted successfully');
//   } catch (error) {
//     console.error('❌ Error deleting category:', error);
//     throw error;
//   }
// }

/**
 * Get category details by ID
 */
// export async function getCategoryById(categoryId: string): Promise<Category> {
//   try {
//     console.log('🔄 Fetching category by ID:', categoryId);
    
//     const response = await apiClient.get(`${categoryEndpoints.detail}/${categoryId}`);
    
//     console.log('✅ Category fetched successfully:', response.data);
    
//     return response.data;
//   } catch (error) {
//     console.error('❌ Error fetching category:', error);
//     throw error;
//   }
// }

/**
 * Get category dashboard overview analytics
 */
export async function getCategoryDashboardOverview(): Promise<CategoryDashboardOverview> {
  try {
    console.log('🔄 Fetching category dashboard overview...');
    
    const response = await apiClient.get(`${categoryEndpoints.list}/dashboard?type=overview`);
    
    console.log('✅ Category dashboard overview fetched successfully:', {
      totalCategories: response.data.totalCategories,
      activeCategories: response.data.activeCategories,
      recentActivityCount: response.data.recentActivity?.length || 0
    });
    
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching category dashboard overview:', error);
    throw error;
  }
}

/**
 * Get category dashboard distribution analytics
 */
export async function getCategoryDashboardDistribution(): Promise<CategoryDashboardDistribution> {
  try {
    console.log('🔄 Fetching category dashboard distribution...');
    
    const response = await apiClient.get(`${categoryEndpoints.list}/dashboard?type=distribution`);
    
    console.log('✅ Category dashboard distribution fetched successfully:', {
      totalCategories: response.data.totalCategories,
      productsByCategoryCount: response.data.productsByCategory?.length || 0,
      hierarchyMaxDepth: response.data.hierarchyAnalytics?.maxDepth || 0
    });
    
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching category dashboard distribution:', error);
    throw error;
  }
}

/**
 * Get products by category analytics
 */
export async function getCategoryDashboardProducts(limit: number = 10): Promise<CategoryDashboardProducts> {
  try {
    console.log('🔄 Fetching category dashboard products...', { limit });
    
    const response = await apiClient.get(`${categoryEndpoints.list}/dashboard?type=products&limit=${limit}`);
    
    console.log('✅ Category dashboard products fetched successfully:', {
      topCategoriesCount: response.data.topCategories?.length || 0,
      totalProducts: response.data.totalProducts
    });
    
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching category dashboard products:', error);
    throw error;
  }
}

/**
 * Get category status trends
 */
export async function getCategoryDashboardStatus(period: string = 'month'): Promise<CategoryDashboardStatus> {
  try {
    console.log('🔄 Fetching category dashboard status trends...', { period });
    
    const response = await apiClient.get(`${categoryEndpoints.list}/dashboard?type=status&period=${period}`);
    
    console.log('✅ Category dashboard status trends fetched successfully:', {
      trendsCount: response.data.statusTrends?.length || 0,
      currentActive: response.data.currentStatus?.active || 0,
      currentInactive: response.data.currentStatus?.inactive || 0
    });
    
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching category dashboard status:', error);
    throw error;
  }
}

/**
 * Get top performing categories
 */
export async function getCategoryDashboardPerformance(limit: number = 5): Promise<CategoryDashboardPerformance> {
  try {
    console.log('🔄 Fetching category dashboard performance...', { limit });
    
    const response = await apiClient.get(`${categoryEndpoints.list}/dashboard?type=performance&limit=${limit}`);
    
    console.log('✅ Category dashboard performance fetched successfully:', {
      topPerformersCount: response.data.topPerformers?.length || 0,
      averagePerformance: response.data.averagePerformance
    });
    
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching category dashboard performance:', error);
    throw error;
  }
}

/**
 * Get recent category activities
 */
export async function getCategoryDashboardActivity(period: string = 'week'): Promise<CategoryDashboardActivity> {
  try {
    console.log('🔄 Fetching category dashboard activity...', { period });
    
    const response = await apiClient.get(`${categoryEndpoints.list}/dashboard?type=activity&period=${period}`);
    
    console.log('✅ Category dashboard activity fetched successfully:', {
      recentActivitiesCount: response.data.recentActivities?.length || 0,
      totalActivities: response.data.activitySummary?.totalActivities || 0
    });
    
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching category dashboard activity:', error);
    throw error;
  }
}

/**
 * Get category hierarchy analytics
 */
export async function getCategoryDashboardHierarchy(): Promise<CategoryDashboardHierarchy> {
  try {
    console.log('🔄 Fetching category dashboard hierarchy...');
    
    const response = await apiClient.get(`${categoryEndpoints.list}/dashboard?type=hierarchy`);
    
    console.log('✅ Category dashboard hierarchy fetched successfully:', {
      maxDepth: response.data.hierarchyStats?.maxDepth || 0,
      totalLevels: response.data.hierarchyStats?.totalLevels || 0,
      levelDistributionCount: response.data.levelDistribution?.length || 0
    });
    
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching category dashboard hierarchy:', error);
    throw error;
  }
}

/**
 * Get single category by ID
 */
export async function getCategoryById(id: string): Promise<Category> {
  try {
    console.log(`🔄 Fetching category with ID: ${id}`);
    
    const response = await apiClient.get(`/categories/${id}`);
    
    console.log('✅ Category fetched successfully:', response.data.name);
    
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching category:', error);
    throw error;
  }
}

/**
 * Create new category
 */
export async function createCategory(categoryData: {
  name: string;
  slug: string;
  description: string;
  isActive: boolean;
  image?: string | null;
  parentId?: string | null;
}): Promise<Category> {
  try {
    console.log('🔄 Creating new category:', categoryData.name, 'with slug:', categoryData.slug);
    
    const response = await apiClient.post('/categories', categoryData);
    
    console.log('✅ Category created successfully:', response.data.name);
    
    return response.data;
  } catch (error) {
    console.error('❌ Error creating category:', error);
    throw error;
  }
}

/**
 * Update existing category
 */
export async function updateCategory(id: string, categoryData: {
  name?: string;
  description?: string;
  isActive?: boolean;
  image?: string | null;
  parentId?: string | null;
}): Promise<Category> {
  try {
    console.log(`🔄 Updating category with ID: ${id}`);
    
    const response = await apiClient.put(`/categories/${id}`, categoryData);
    
    console.log('✅ Category updated successfully:', response.data.name);
    
    return response.data;
  } catch (error) {
    console.error('❌ Error updating category:', error);
    throw error;
  }
}

/**
 * Delete category
 */
export async function deleteCategory(id: string): Promise<void> {
  try {
    console.log(`🔄 Deleting category with ID: ${id}`);
    
    await apiClient.delete(`/categories/${id}`);
    
    console.log('✅ Category deleted successfully');
  } catch (error) {
    console.error('❌ Error deleting category:', error);
    throw error;
  }
}