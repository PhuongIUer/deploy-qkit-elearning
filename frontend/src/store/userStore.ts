import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import axios , { isAxiosError }from 'axios';
import type { ICommonResponse } from '@/types';
import type { IUser } from '@/types/user';

export const userStore = defineStore('user', () => {
  const api = axios.create({
    baseURL: 'http://localhost:3000/api',
  });
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
  // Initialize with null or default value
  const userData = ref<ICommonResponse<IUser> | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Add request interceptor
  

  // Create a computed property for number of users
  const numberOfUsers = computed(() => {
    return userData.value?.meta.totalItems || 0;
  });

  // Async function to fetch users
  const fetchUsers = async (currentPage: number, itemsPerPage: number): Promise<void> => {
    try {
      loading.value = true;
      error.value = null;
      
      const response = await api.get<ICommonResponse<IUser>>(
        `/users?page=${currentPage}&limit=${itemsPerPage}`
      );
      
      userData.value = response.data;
      
    } catch (err: unknown) {
      error.value = isAxiosError(err) 
        ? err.response?.data?.message || err.message 
        : 'An unknown error occurred while fetching courses';
      
      console.error('Error fetching courses:', err);
    } finally {
      loading.value = false;
    }
  };
  const fetchUsersAll = async () => {
    try {
      loading.value = true;
      error.value = null;
      
      const response = await api.get<ICommonResponse<IUser>>(
        `/users?page=1&limit=100`
      );
      
      userData.value = response.data;
      
    } catch (err: unknown) {
      error.value = isAxiosError(err) 
        ? err.response?.data?.message || err.message 
        : 'An unknown error occurred while fetching courses';
      
      console.error('Error fetching courses:', err);
    } finally {
      loading.value = false;
    }
  };
  const userbyID = ref<IUser>();
  const fetchUsersbyID = async (Id: number) => {
    try {
      loading.value = true;
      error.value = null;
      
      const response = await api.get<IUser>(
        `/users/${Id}`
      );
      userbyID.value = response.data;
      
    } catch (err: unknown) {
      error.value = isAxiosError(err) 
        ? err.response?.data?.message || err.message 
        : 'An unknown error occurred while fetching courses';
      
      console.error('Error fetching courses:', err);
    } finally {
      loading.value = false;
    }
  }
  return {
    userbyID,
    numberOfUsers,
    userData,
    loading,
    error,
    fetchUsers,
    fetchUsersAll,
    fetchUsersbyID,
  };
});