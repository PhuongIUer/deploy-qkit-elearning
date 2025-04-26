import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios, {isAxiosError} from 'axios';
import type { IQuiz } from '../types/quizz';

export const useQuizStore = defineStore('quiz', () => {
  const quizzes = ref<IQuiz[]>([]);
  const selectedQuiz = ref<IQuiz | null>(null);
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

  const fetchQuizById = async (id: string) => {
    try {
      loading.value = true;
      const response = await api.get(`/quizzes/${id}`);
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
    try {
      loading.value = true;
      const response = await api.get(`/quizzes/lesson/${lessonId}`);
      selectedQuiz.value = response.data;
    } catch (err) {
      error.value = isAxiosError(err)
        ? err.response?.data?.message || err.message
        : 'Failed to fetch quiz by lesson ID';
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  const createQuiz = async (quizData: Partial<IQuiz>) => {
    try {
      const response = await api.post('/quizzes', quizData);
      quizzes.value.push(response.data);
    } catch (err) {
      error.value = isAxiosError(err)
        ? err.response?.data?.message || err.message
        : 'Failed to create quiz';
      console.error(err);
    }
  };

  const updateQuiz = async (id: string, updatedQuiz: Partial<IQuiz>) => {
    try {
      const response = await api.patch(`/quizzes/${id}`, updatedQuiz);
      const index = quizzes.value.findIndex(q => q.id === id);
      if (index !== -1) quizzes.value[index] = response.data;
    } catch (err) {
      error.value = isAxiosError(err)
        ? err.response?.data?.message || err.message
        : 'Failed to update quiz';
      console.error(err);
    }
  };

  const deleteQuiz = async (id: string) => {
    try {
      await api.delete(`/quizzes/${id}`);
      quizzes.value = quizzes.value.filter(q => q.id !== id);
    } catch (err) {
      error.value = isAxiosError(err)
        ? err.response?.data?.message || err.message
        : 'Failed to delete quiz';
      console.error(err);
    }
  };

  return {
    quizzes,
    selectedQuiz,
    loading,
    error,
    fetchQuizById,
    fetchQuizByLessonId,
    createQuiz,
    updateQuiz,
    deleteQuiz,
  };
});
