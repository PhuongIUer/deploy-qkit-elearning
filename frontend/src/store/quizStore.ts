import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios, { isAxiosError } from 'axios';
import type { IOption, IQuiz } from '@/types/quizz';
import type { ICommonResponse } from '@/types';

export const useQuizStore = defineStore('quiz', () => {
  const quizzes = ref<IQuiz[]>([]);
  const selectedQuiz = ref<IQuiz | null>(null);
  const totalItems = ref(0);
  const loading = ref(false);
  const error = ref<string | null>(null);

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

  const fetchQuizzes = async (page: number = 1, limit: number = 10) => {
    try {
      loading.value = true;
      error.value = null;

      const response = await api.get<ICommonResponse<IQuiz>>(`/quizzes?page=${page}&limit=${limit}`);
      quizzes.value = response.data.items;
      totalItems.value = response.data.meta.totalItems;
    } catch (err) {
      error.value = isAxiosError(err)
        ? err.response?.data?.message || err.message
        : 'Failed to fetch quizzes';
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  const fetchQuizById = async (id: string) => {
    try {
      loading.value = true;
      error.value = null;

      const response = await api.get<IQuiz>(`/quizzes/${id}`);
      selectedQuiz.value = response.data;
    } catch (err) {
      error.value = isAxiosError(err)
        ? err.response?.data?.message || err.message
        : 'Failed to fetch quiz';
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  const fetchQuizByLessonId = async (lessonId: number) => {
    if (!lessonId || isNaN(lessonId)) {
      console.error("Invalid lessonId:", lessonId);
      return;
    }
    try {
      loading.value = true;
      error.value = null;
  
      const response = await api.get<IQuiz>(`/quizzes/lesson/${lessonId}`);
      const quiz = response.data;
  
      quiz.questions.forEach((question) => {
        question.options.forEach((option: IOption) => {
          option.explanation = option.explanation ?? ''; 
        });
      });
  
      selectedQuiz.value = quiz;
    } catch (err) {
      error.value = isAxiosError(err)
        ? err.response?.data?.message || err.message
        : 'Failed to fetch quiz by lesson ID';
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  async function createQuizForLesson(lessonId: number, quizData: Partial<IQuiz>) {
    try {
      console.log('Creating quiz for lesson ID:', lessonId, 'with data:', quizData);
      const response = await api.post('/quizzes', quizData);
      selectedQuiz.value = response.data; // Lưu quiz vừa tạo vào store
      return response.data;
    } catch (error) {
      console.error('Error creating quiz:', error);
      throw error; // Ném lỗi để xử lý ở nơi gọi hàm
    }
  }

  const createQuiz = async (quizData: Partial<IQuiz>) => {
    try {
      loading.value = true;
      error.value = null;

      const response = await api.post<IQuiz>('/quizzes', quizData);
      quizzes.value.push(response.data);
    } catch (err) {
      error.value = isAxiosError(err)
        ? err.response?.data?.message || err.message
        : 'Failed to create quiz';
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  
  const updateQuiz = async (quizId: number, updatedQuizData: Partial<IQuiz>) => {
    try {
      console.log("Updating quiz with ID:", quizId, "and data:", updatedQuizData);
      
      loading.value = true;
      error.value = null;

      const cleanedUpdatedQuizData = {
        ...updatedQuizData,
        questions: updatedQuizData.questions?.map((question) => ({
          ...question,
          options: question.options?.map((option: IOption) => ({
            ...option,
            explanation: option.explanation ?? ''  // Đảm bảo explanation có giá trị
          }))
        }))
      };

      const response = await api.patch<IQuiz>(`/quizzes/${quizId}`, cleanedUpdatedQuizData); 
      selectedQuiz.value = response.data; 
      const index = quizzes.value.findIndex(quiz => quiz.id === quizId);
      if (index !== -1) {
        quizzes.value[index] = response.data; 
      }
      console.log('Quiz updated successfully:', response.data);
    } catch (err) {
      error.value = isAxiosError(err)
        ? err.response?.data?.message || err.message
        : 'Failed to update quiz';
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  const deleteQuiz = async (id: string) => {
    try {
      loading.value = true;
      error.value = null;

      await api.delete(`/quizzes/${id}`);
      quizzes.value = quizzes.value.filter(q => q.id !== (id));
    } catch (err) {
      error.value = isAxiosError(err)
        ? err.response?.data?.message || err.message
        : 'Failed to delete quiz';
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  const numberOfQuizzes = computed(() => totalItems.value || 0);

  return {
    quizzes,
    selectedQuiz,
    loading,
    error,
    totalItems,
    numberOfQuizzes,
    fetchQuizzes,
    fetchQuizById,
    fetchQuizByLessonId,
    createQuizForLesson,
    createQuiz,
    updateQuiz,
    deleteQuiz
  };
});