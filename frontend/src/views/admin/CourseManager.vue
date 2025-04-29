<template>
  <div class="course-container">
    <SideBar/>
    <div class="course-content">
      <div class="header">
        <h1>Course Management</h1>
        <div class="header-actions">
          <button @click="fetchCourses" class="reload-button" :disabled="loading">
            <span v-if="!loading">Reload Data</span>
            <span v-else>Loading...</span>
          </button>
          <div class="search-filter">
            <input 
              v-model="searchQuery" 
              @input="handleSearch" 
              placeholder="Search courses..."
              class="search-input"
            />
            <select v-model="categoryFilter" @change="applyFilters" class="category-select">
              <option value="">All Categories</option>
              <option v-for="category in categories" :key="category.id" :value="category.id">
                {{ category.name }}
              </option>
            </select>
            <select v-model="levelFilter" @change="applyFilters" class="level-select">
              <option value="">All Levels</option>
              <option v-for="level in levels" :key="level" :value="level">
                {{ level }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <div v-if="loading" class="loading">Loading courses...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else class="table-container">
        <table class="course-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Level</th>
              <th>Original Price</th>
              <th>Discount</th>
              <th>Final Price</th>
              <th>Lessons</th>
              <th>Students</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="course in filteredCourses" :key="course.id">
              <td>{{ course.name }}</td>
              <td>{{ course.category.name }}</td>
              <td >
                <span :class="levelClass(course.courseLevel)">{{ formatLevel(course.courseLevel) }}</span>
                </td>
              <td>{{ formatPrice(course.price) }}</td>
              <td>{{ course.discountPercentage }}%</td>
              <td>{{ formatPrice(calculateRealPrice(course)) }}</td>
              <td>{{ course.totalLessons }}</td>
              <td>{{ course.totalStudents }}</td>
              <td class="button-container">
                <button @click="viewCourse(course.id)" class="view-button">View</button>
                <button @click="confirmDelete(course.id)" class="delete-button">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="pagination">
          <button @click="prevPage" :disabled="currentPage === 1">Previous</button>
          <span>Page {{ currentPage }} of {{ totalPages }}</span>
          <button @click="nextPage" :disabled="currentPage >= totalPages">Next</button>
          <select v-model="itemsPerPage" @change="handlePageSizeChange" class="page-size-select">
            <option value="5">5 per page</option>
            <option value="10">10 per page</option>
            <option value="20">20 per page</option>
          </select>
        </div>
        <div v-if="showDeleteModal" class="modal">
    <div class="modal-content">
      <h2>Confirm Deletion</h2>
      <p>Are you sure you want to delete this course? This action cannot be undone.</p>
      <div class="form-actions">
        <button @click="showDeleteModal = false" :disabled="deleting">Cancel</button>
        <button @click="deleteCourse" :disabled="deleting" class="delete-confirm-button">
          {{ deleting ? 'Deleting...' : 'Delete' }}
        </button>
      </div>
    </div>
  </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import axios, { isAxiosError } from 'axios';
import { debounce } from 'lodash-es';
import SideBar from '../../components/admin/SideBar.vue';
import { useRouter } from 'vue-router';
import { toast } from 'vue3-toastify';
import type { ICourse, Category} from '../../types/course';

import { courseStore } from '../../store/courseStore';
export default defineComponent({
  components: { SideBar },
  name: 'CourseManagement',
  setup() {
    const store = courseStore();
    
    const router = useRouter();
    
    const apiData = ref<ICourse[]>([]);
    const loading = ref(true);
    const error = ref<string | null>(null);
    const updating = ref(false);
    
    // Pagination
    const currentPage = ref(1);
    const itemsPerPage = ref(5);
    const totalItems = ref(0);
    const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value));

    // Search and filter
    const searchQuery = ref('');
    const categoryFilter = ref('');
    const levelFilter = ref('');
    const debouncedSearch = debounce(() => applyFilters(), 300);

    // Available categories and levels
    const categories = ref<Category[]>([]);
      const levels = ref<string[]>(
        ['BEGINNER',
        'INTERMEDIATE',
        'ADVANCED']
      );
    
    // Create axios instance with base URL and auth
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
    const showDeleteModal = ref(false);
    const deleting = ref(false);
    const courseToDelete = ref<number | null>(null);

    // Add this method to your existing methods
    const confirmDelete = (courseId: number) => {
      courseToDelete.value = courseId;
      showDeleteModal.value = true;
    };
    const fetchCourses = async () => {
      try {
        await store.fetchCourses(currentPage.value, itemsPerPage.value)
        apiData.value = store.Courses;
        totalItems.value = store.totalItems;
      } catch (err) {
        error.value = isAxiosError(err) 
          ? err.response?.data?.message || err.message 
          : 'Unknown error occurred';
        console.error('Error fetching courses:', err);
      } finally {
        loading.value = false;
      }
    };
    const deleteCourse = async () => {
      if (!courseToDelete.value) return;

      try {
        deleting.value = true;
        await api.delete(`/courses/${courseToDelete.value}`);
        toast.success('Course deleted successfully');
        await fetchCourses(); // Refresh the course list
      } catch (err) {
        const errorMessage = isAxiosError(err) 
          ? err.response?.data?.message || err.message 
          : 'Failed to delete course';
        toast.error(errorMessage);
        console.error('Error deleting course:', err);
      } finally {
        deleting.value = false;
        showDeleteModal.value = false;
        courseToDelete.value = null;
      }
    };
    // Computed properties
    const transformedCourses = computed(() => {
      return apiData.value.map(course => ({
        ...course,
        price: parseFloat(course.price).toFixed(2)
      }));
    });

    const filteredCourses = computed(() => {
      let result = transformedCourses.value;
      
      // Apply category filter
      if (categoryFilter.value) {
        result = result.filter(course => course.category.id === Number(categoryFilter.value));
      }
      
      // Apply level filter
      if (levelFilter.value) {
        result = result.filter(course => course.courseLevel === levelFilter.value);
      }
      
      // Apply search query
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        result = result.filter(course => 
          course.name.toLowerCase().includes(query) ||
          course.category.name.toLowerCase().includes(query)
        );
      }
      
      return result;
    });

    // Helper functions
    const calculateRealPrice = (course: ICourse) => {
      const price = parseFloat(course.price);
      const discount = course.discountPercentage / 100;
      return price - (price * discount);
    };

    const formatPrice = (price: number | string) => {
      const amount = typeof price === 'string' ? parseFloat(price) : price;
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(amount);
    };

    const formatLevel = (level: string) => {
      const levelMap: Record<string, string> = {
        'BEGINNER': 'Beginner',
        'INTERMEDIATE': 'Intermediate',
        'ADVANCED': 'Advanced'
      };
      return levelMap[level] || level;
    };

    const levelClass = (level: string) => {
      return `level-${level.toLowerCase()}`;
    };
    

    // API calls


    const fetchCategories = async () => {
      try {
        const response = await api.get<Category[]>('/categories');
        categories.value = response.data;
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };

    // Pagination handlers
    const handlePageSizeChange = () => {
      currentPage.value = 1;
      fetchCourses();
    };

    const prevPage = () => {
      if (currentPage.value > 1) {
        currentPage.value--;
        fetchCourses();
      }
    };

    const nextPage = () => {
        currentPage.value++;
        fetchCourses();
      
    };

    // Filter handlers
    const handleSearch = () => {
      debouncedSearch();
    };

    const applyFilters = () => {
      currentPage.value = 1;
      fetchCourses();
    };

    // Course actions
    const viewCourse = (id: number) => {
      router.push(`/courses/learn/${id}`);
    };

    onMounted(() => {
      fetchCourses();
      fetchCategories();
    });

    return {
      loading,
      error,
      updating,
      categories,
      levels,
      searchQuery,
      categoryFilter,
      levelFilter,
      currentPage,
      itemsPerPage,
      totalPages,
      transformedCourses,
      filteredCourses,
      showDeleteModal,
      deleting,
      confirmDelete,
      deleteCourse,
      fetchCourses,
      handlePageSizeChange,
      prevPage,
      nextPage,
      handleSearch,
      applyFilters,
      calculateRealPrice,
      formatPrice,
      formatLevel,
      levelClass,
      viewCourse
    };
  },
});
</script>

<style scoped>
.course-container {
  display: flex;
  min-height: 100vh;
  background-color: #F5F6FA;
}

.course-content {
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.header h1 {
  font-size: 1.8rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0;
}

.header-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.search-filter {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.search-input,
.category-select,
.level-select,
.page-size-select {
  padding: 0.625rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.95rem;
  background-color: #fff;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.search-input:focus,
.category-select:focus,
.level-select:focus,
.page-size-select:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.table-container {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  margin-bottom: 2rem;
  background-color: #fff;
  overflow-x: auto;
}

.course-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  min-width: 800px;
}

.course-table th {
  background-color: #f8fafc;
  color: #334155;
  font-weight: 600;
  text-align: center;
  padding: 1rem;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  position: sticky;
  top: 0;
  z-index: 10;
}

.course-table td {
  text-align: center;
  padding: 1rem;
  border-top: 1px solid #f1f5f9;
  color: #475569;
  font-size: 0.95rem;
  transition: background-color 0.2s ease;
}

.course-table tr:not(:last-child) td {
  border-bottom: 1px solid #f1f5f9;
}

.course-table tr:hover td {
  background-color: #f8fafc;
}

/* Level badges */
.level-beginner,
.level-intermediate,
.level-advanced {
  display: inline-block;
  padding: 0.35rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 500;
}

.level-beginner {
  background-color: #ecfdf5;
  color: #065f46;
}

.level-intermediate {
  background-color: #eff6ff;
  color: #1d4ed8;
}

.level-advanced {
  background-color: #fef2f2;
  color: #b91c1c;
}

/* Button styles */
.view-button,
.delete-button,
.reload-button,
.delete-confirm-button {
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.view-button {
  background-color: #e0f2fe;
  color: #0369a1;
}

.view-button:hover {
  background-color: #bae6fd;
}

.delete-button,
.delete-confirm-button {
  background-color: #fee2e2;
  color: #b91c1c;
}

.delete-button:hover,
.delete-confirm-button:hover {
  background-color: #fecaca;
}

.button-container {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.reload-button {
  background-color: #e0f2fe;
  color: #0369a1;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.reload-button:hover {
  background-color: #bae6fd;
  transform: translateY(-1px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
}

.reload-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  flex-wrap: wrap;
}

.pagination button {
  padding: 0.5rem 1rem;
  background-color: #f1f5f9;
  color: #334155;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.pagination button:hover:not(:disabled) {
  background-color: #e2e8f0;
}

.pagination button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.pagination span {
  font-size: 0.9rem;
  color: #64748b;
}

/* Loading and error states */
.loading,
.error {
  padding: 1.5rem;
  text-align: center;
  border-radius: 6px;
  margin-bottom: 1.5rem;
}

.loading {
  background-color: #e3f2fd;
  color: #1976d2;
}

.error {
  background-color: #fef2f2;
  color: #b91c1c;
}

/* Modal styles */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.modal-content h2 {
  margin-top: 0;
  color: #1e293b;
  font-size: 1.25rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.form-actions button {
  padding: 0.75rem 1.25rem;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.form-actions button:first-child {
  background-color: #f1f5f9;
  color: #475569;
  border: none;
}

.form-actions button:first-child:hover {
  background-color: #e2e8f0;
}

@media (max-width: 768px) {
  .course-content {
    padding: 1rem;
  }
  
  .header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .search-filter {
    flex-direction: column;
    width: 100%;
  }
  
  .search-input,
  .category-select,
  .level-select {
    width: 100%;
  }
  
  .pagination {
    flex-direction: column;
  }
}
</style>