/**
 * API Endpoints
 * 
 * This file contains all API endpoints used in the application.
 * Centralizing endpoints makes it easier to manage and update API routes.
 */

import { getApiUrl } from './config';

/**
 * Authentication endpoints
 */
export const authEndpoints = {
  login: getApiUrl('/auth/login'),
  logout: getApiUrl('/auth/logout'),
  refreshToken: getApiUrl('/auth/refresh-token'),
  forgotPassword: getApiUrl('/auth/forgot-password'),
  resetPassword: getApiUrl('/auth/reset-password'),
  verifyEmail: getApiUrl('/auth/verify-email'),
  verifyOtp: getApiUrl('/auth/verify-otp'),
};

/**
 * User management endpoints
 */
export const userEndpoints = {
  list: getApiUrl('/users'),
  details: (userId: string) => getApiUrl(`/users/${userId}`),
  create: getApiUrl('/users'),
  update: (userId: string) => getApiUrl(`/users/${userId}`),
  delete: (userId: string) => getApiUrl(`/users/${userId}`),
  changePassword: (userId: string) => getApiUrl(`/users/${userId}/change-password`),
  profile: getApiUrl('/user/profile'),
  permissions: getApiUrl('/user/profile/permissions'),
};

/**
 * Product endpoints
 */
export const productEndpoints = {
  list: getApiUrl('/products'),
  details: (productId: string) => getApiUrl(`/products/${productId}`),
  create: getApiUrl('/products'),
  update: (productId: string) => getApiUrl(`/products/${productId}`),
  delete: (productId: string) => getApiUrl(`/products/${productId}`),
  categories: getApiUrl('/products/categories'),
};

/**
 * Order endpoints
 */
export const orderEndpoints = {
  list: getApiUrl('/orders'),
  details: (orderId: string) => getApiUrl(`/orders/${orderId}`),
  create: getApiUrl('/orders'),
  update: (orderId: string) => getApiUrl(`/orders/${orderId}`),
  delete: (orderId: string) => getApiUrl(`/orders/${orderId}`),
  status: (orderId: string) => getApiUrl(`/orders/${orderId}/status`),
};

/**
 * Customer endpoints
 */
export const customerEndpoints = {
  list: getApiUrl('/customers'),
  details: (customerId: string) => getApiUrl(`/customers/${customerId}`),
  create: getApiUrl('/customers'),
  update: (customerId: string) => getApiUrl(`/customers/${customerId}`),
  delete: (customerId: string) => getApiUrl(`/customers/${customerId}`),
};

/**
 * Dashboard endpoints
 */
export const dashboardEndpoints = {
  summary: getApiUrl('/dashboard/summary'),
  salesStats: getApiUrl('/dashboard/sales-stats'),
  recentOrders: getApiUrl('/dashboard/recent-orders'),
  topProducts: getApiUrl('/dashboard/top-products'),
  customerStats: getApiUrl('/dashboard/customer-stats'),
};

/**
 * Settings endpoints
 */
export const settingsEndpoints = {
  general: getApiUrl('/settings/general'),
  notifications: getApiUrl('/settings/notifications'),
  security: getApiUrl('/settings/security'),
  appearance: getApiUrl('/settings/appearance'),
};

// Export all endpoints as a single object
export const endpoints = {
  auth: authEndpoints,
  users: userEndpoints,
  products: productEndpoints,
  orders: orderEndpoints,
  customers: customerEndpoints,
  dashboard: dashboardEndpoints,
  settings: settingsEndpoints,
};

export default endpoints;