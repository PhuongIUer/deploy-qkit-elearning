import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import axios , { isAxiosError }from 'axios';
import type { ICourse, ICourseTeaching, averageRating } from '../types/course';
import type { ICommonResponse, ITeachingResponse } from '@/types';
export const courseStore = defineStore('course', () => {
  const api = axios.create({
    baseURL: 'http://14.225.217.42:5000/api',
  });
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  const Courses = ref<ICourse[]>([]);
  const CoursesTeaching = ref<ICourseTeaching[]>([]);
  const averageRating = ref<number>();
  const numberReviews = ref<number>();
  // Initialize with null or default value
  const courseData = ref<ICommonResponse<ICourse> | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchRatingCourse = async (courseId: number) => {
    try {
      loading.value = true;
      error.value = null;
      const response = await api.get<averageRating>(
        `/courses/${courseId}/ratings/average`
      );
      averageRating.value = response.data.average;
      numberReviews.value = response.data.count;
      return response.data;
    } catch (err: unknown) {
      error.value = isAxiosError(err)
        ? err.response?.data?.message || err.message
        : 'Unknown error occurred';
      console.error('Error fetching average rating:', err);
    }
  }
  const totalItems = ref(0);
  // Async function to fetch courses
  const fetchCourses = async (currentPage: number, itemsPerPage: number): Promise<void> => {
    try {
      loading.value = true;
      error.value = null;
      
      const response = await api.get<ICommonResponse<ICourse>>(
        `/courses?page=${currentPage}&limit=${itemsPerPage}`
      );
      
      Courses.value = response.data.items;
      totalItems.value = response.data.meta.totalItems;
      
    } catch (err: unknown) {
      error.value = isAxiosError(err) 
        ? err.response?.data?.message || err.message 
        : 'An unknown error occurred while fetching courses';
      
      console.error('Error fetching courses:', err);
    } finally {
      loading.value = false;
    }
  };
  const fetchCoursesAll = async () => {
    try {
      loading.value = true;
      error.value = null;
      
      const response = await api.get<ICommonResponse<ICourse>>(
        `/courses?page=1&limit=100`
      );
      Courses.value = response.data.items;
      totalItems.value = response.data.meta.totalItems;
      
    } catch (err) {
      error.value = isAxiosError(err) 
        ? err.response?.data?.message || err.message 
        : 'Unknown error occurred';
      console.error('Error fetching courses:', err);
    } finally {
      loading.value = false;
    }
  };
  const fetchCoursesTeacher = async () => {
    try {
      loading.value = true;
      error.value = null;
      
      const response = await api.get<ITeachingResponse<ICourseTeaching>>(
        `courses/my-courses?page=1&limit=100`
      );
      return CoursesTeaching.value = response.data.items;
      totalItems.value = response.data.meta.total;
    } catch (err) {
      error.value = isAxiosError(err) 
        ? err.response?.data?.message || err.message 
        : 'Unknown error occurred';
      console.error('Error fetching courses:', err);
    } finally {
      loading.value = false;
    }
  };
  const fetchCoursebyID = async (id: number) => {
    try {
      loading.value = true;
      error.value = null;
      
      const response = await api.get<ITeachingResponse<ICourseTeaching>>(
        `courses/courses/${id}`
      );
      return CoursesTeaching.value = response.data.items;
    } catch (err) {
      error.value = isAxiosError(err) 
        ? err.response?.data?.message || err.message 
        : 'Unknown error occurred';
      console.error('Error fetching courses:', err);
    } finally {
      loading.value = false;
    }
  }
  const numberOfCourses = computed(() => {
    return totalItems.value || 0;
  });
  return {
    numberOfCourses,
    courseData,
    loading,
    error,
    Courses,
    totalItems,
    CoursesTeaching,
    averageRating,
    numberReviews,
    fetchCoursebyID,
    fetchRatingCourse,
    fetchCoursesTeacher,
    fetchCourses,
    fetchCoursesAll,
    };
});
