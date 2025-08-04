/**
 * Users API
 * 
 * This file contains API functions for managing users.
 */

import { apiClient } from './axios';
import { userEndpoints } from './endpoints';

/**
 * User type definition based on the API response
 */
export interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  emailVerifiedAt: string | null;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  phoneVerified: boolean;
  phoneVerifiedAt: string | null;
  profileImage: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  lastLoginAt: string | null;
  lastActiveAt: string | null;
  createdAt: string;
  updatedAt: string;
  fullName: string;
}

/**
 * API response type for users list
 */
export interface UsersResponse {
  data: User[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Parameters for getting users
 */
export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: 'ACTIVE' | 'INACTIVE' | 'all';
}

/**
 * Get all users
 */
export async function getUsers(params: GetUsersParams = {}): Promise<UsersResponse> {
  try {
    console.log('🔄 Fetching users with params:', params);
    
    // Build query parameters
    const queryParams: Record<string, any> = {};
    
    if (params.page) queryParams.page = params.page;
    if (params.limit) queryParams.limit = params.limit;
    if (params.search) queryParams.q = params.search; // Backend expects 'q' for search
    if (params.sortBy) queryParams.sortBy = params.sortBy;
   // if (params.sortOrder) queryParams.sortOrder = params.sortOrder;
    if (params.status && params.status !== 'all') queryParams.status = params.status;
    
    console.log('📤 API request params:', queryParams);
    
    const response = await apiClient.get('/user', { params: queryParams });
    
    console.log('✅ Users fetched successfully:', {
      totalUsers: response.data?.length || 0,
      pagination: response.data.pagination
    });
    
    // Handle response format - API returns array directly
    const users = Array.isArray(response.data) ? response.data : [];
    
    return {
      data: users,
      pagination: response.data.pagination || {
        page: params.page || 1,
        limit: params.limit || 10,
        total: users.length,
        totalPages: Math.ceil(users.length / (params.limit || 10))
      }
    };
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    throw error;
  }
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<User> {
  try {
    console.log('🔄 Fetching user with ID:', userId);
    
    const response = await apiClient.get(userEndpoints.details(userId));
    
    console.log('✅ User fetched successfully:', response.data.email);
    
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching user:', error);
    throw error;
  }
}

/**
 * Create a new user
 */
export async function createUser(userData: Partial<User>): Promise<User> {
  try {
    console.log('🔄 Creating new user:', userData.email);
    
    const response = await apiClient.post(userEndpoints.create, userData);
    
    console.log('✅ User created successfully:', response.data.email);
    
    return response.data;
  } catch (error) {
    console.error('❌ Error creating user:', error);
    throw error;
  }
}

/**
 * Update an existing user
 */
export async function updateUser(userId: string, userData: Partial<User>): Promise<User> {
  try {
    console.log('🔄 Updating user:', userId);
    
    const response = await apiClient.put(userEndpoints.update(userId), userData);
    
    console.log('✅ User updated successfully:', response.data.email);
    
    return response.data;
  } catch (error) {
    console.error('❌ Error updating user:', error);
    throw error;
  }
}

/**
 * Delete a user
 */
export async function deleteUser(userId: string): Promise<void> {
  try {
    console.log('🔄 Deleting user:', userId);
    
    await apiClient.delete(userEndpoints.delete(userId));
    
    console.log('✅ User deleted successfully');
  } catch (error) {
    console.error('❌ Error deleting user:', error);
    throw error;
  }
}