/**
 * API Module Index
 * 
 * This file exports all API-related modules for easy importing.
 */

// Core API client and configuration
export * from './axios';
export * from './config';

// API endpoints
export * from './endpoints';

// Authentication utilities
export * from './auth';

// Error handling
export * from './errorHandler';

// React hooks
export * from './useApi';

// Categories API
export * from './categories';
export {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryDashboardOverview,
  getCategoryDashboardDistribution,
  getCategoryDashboardProducts,
  getCategoryDashboardStatus,
  getCategoryDashboardPerformance,
  getCategoryDashboardActivity,
  getCategoryDashboardHierarchy,
  type Category,
  type GetCategoriesParams,
  type CategoriesResponse,
  type CategoryDashboardOverview,
  type CategoryDashboardDistribution,
  type CategoryDashboardProducts,
  type CategoryDashboardStatus,
  type CategoryDashboardPerformance,
  type CategoryDashboardActivity,
  type CategoryDashboardHierarchy
} from './categories';

// Re-export default config
import apiConfig from './config';
export default apiConfig;