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
              <option v-for="level in levels" :key="level.value" :value="level.value">
                {{ level.label }}
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
              <td :class="levelClass(course.courseLevel)">{{ formatLevel(course.courseLevel) }}</td>
              <td>{{ formatPrice(course.price) }}</td>
              <td>{{ course.discountPercentage }}%</td>
              <td>{{ formatPrice(calculateRealPrice(course)) }}</td>
              <td>{{ course.totalLessons }}</td>
              <td>{{ course.totalStudents }}</td>
              <td class="button-container">
                <button @click="viewCourse(course.slug)" class="view-button">View</button>
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
import type { ICourse, Category, CourseLevel} from '../../types/CourseResponse';

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
    const levels = ref<CourseLevel[]>([]);
    
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
    const viewCourse = (slug: string) => {
      router.push(`/courses/${slug}`);
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
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.search-filter {
  display: flex;
  gap: 1rem;
}

.search-input, .category-select, .sort-select, .order-select {
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.table-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.course-table {
  width: 100%;
  border-collapse: collapse;
}

.course-table th, .course-table td {
  padding: 1rem;
  text-align: center;;
  border-bottom: 1px solid #eee;
}

.course-table th {
  background-color: #f8f9fa;
  font-weight: 600;
}

.course-table tr:hover {
  background-color: #f8f9fa;
}

.view-button {
  padding: 0.5rem 1rem;
  display: inline-block;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.view-button:hover {
  background-color: #45a049;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background-color: #f8f9fa;
}

.pagination button {
  padding: 0.5rem 1rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.pagination button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.loading {
  text-align: center;
  padding: 2rem;
}
.level-beginner, .level-intermediate, .level-advanced {
  font-size: medium;
}

.level-beginner {
  color: #4CAF50;
  font-weight: 500;
}

.level-intermediate {
  color: #2196F3;
  font-weight: 500;
}

.level-advanced {
  color: #F44336;
  font-weight: 500;
}

.view-button {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 5px 15px;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 5px;
}


.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  width: 500px;
  max-width: 90%;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.form-actions button {
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.form-actions button[type="submit"] {
  background-color: #4CAF50;
  color: white;
  border: none;
}

.form-actions button[type="button"] {
  background-color: #f5f5f5;
  border: 1px solid #ddd;
}
.header-section {
  margin-bottom: 1.5rem;
}

.header-section h1 {
  font-size: 1.8rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.25rem;
}

.subtitle {
  color: #64748b;
  font-size: 0.95rem;
}

.controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  align-items: center;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 250px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
}

.search-input {
  width: 100%;
  padding: 0.625rem 1rem 0.625rem 2.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.95rem;
  background-color: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: border-color 0.2s, box-shadow 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.filter-box {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.filter-box label {
  font-weight: 500;
  color: #475569;
  font-size: 0.95rem;
}

.filter-select {
  padding: 0.625rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.95rem;
  background-color: #fff;
  cursor: pointer;
  transition: border-color 0.2s;
}

.filter-select:focus {
  outline: none;
  border-color: #6366f1;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  gap: 1rem;
}

.spinner {
  width: 2.5rem;
  height: 2.5rem;
  border: 3px solid #e2e8f0;
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-state {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background-color: #fef2f2;
  border-radius: 6px;
  color: #b91c1c;
}

.error-icon {
  flex-shrink: 0;
}

.error-message {
  margin-bottom: 0.75rem;
}

.retry-button {
  padding: 0.5rem 1rem;
  background-color: #dc2626;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.retry-button:hover {
  background-color: #b91c1c;
}

.table-container {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  margin-bottom: 1.5rem;
  background-color: #fff;
}

.user-table {
  width: 100%;
  border-collapse: collapse;
}

.user-table th {
  background-color: #f1f5f9;
  color: #334155;
  font-weight: 600;
  text-align: center;
  padding: 1rem;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.user-table td {
  text-align: center ;
  padding: 1rem;
  border-top: 1px solid #e2e8f0;
  color: #334155;
  font-size: 0.95rem;
}

.user-table tr:hover {
  background-color: #f8fafc;
}

/* Badge styles */
.role-user span,
.verification span,

.role-user .role-admin {
  background-color: #e0e7ff;
  color: #4338ca;
}

.role-user .role-teacher {
  background-color: #dbeafe;
  color: #1d4ed8;
}

.role-user .role-student {
  background-color: #dcfce7;
  color: #166534;
}

.verification .Verified {
  background-color: #dcfce7;
  color: #166534;
}

.verification .Non-Verify {
  background-color: #fee2e2;
  color: #b91c1c;
}


.pagination-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 1rem 0;
}

.page-size-selector {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.page-size-selector label {
  font-size: 0.9rem;
  color: #64748b;
}

.page-size-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 0.9rem;
}

.page-navigation {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.page-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: #f1f5f9;
  color: #334155;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.page-button:hover:not(:disabled) {
  background-color: #e2e8f0;
}

.page-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.page-info {
  font-size: 0.9rem;
  color: #64748b;
}

/* Modal styles */
.modal-overlay {
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
  width: 90%;
  max-width: 500px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
  color: #1e293b;
}

.close-button {
  background: none;
  border: none;
  padding: 0.25rem;
  cursor: pointer;
  color: #64748b;
  transition: color 0.2s;
}
.delete-button {
  background-color: #f44336;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  margin-left: 5px;
}

.delete-button:hover {
  background-color: #d32f2f;
}

.delete-confirm-button {
  background-color: #f44336;
  color: white;
}

.delete-confirm-button:hover {
  background-color: #d32f2f;
}
.close-button:hover {
  color: #475569;
}
/* Method 1: Using Flexbox (Recommended) */
.button-container {
    gap: 10px; /* Adds spacing between buttons */
}

/* Method 2: Using Text-Align (If buttons are inline/inline-block) */
.button-container {
    text-align: center;
}
.button-container button {
    margin: 0 5px; /* Adds spacing between buttons */
}

/* Method 3: Using Grid */

.modal-form {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: #475569;
  font-weight: 500;
}

.form-input,
.form-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.95rem;
  transition: border-color 0.2s;
}
.reload-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 16px;
  background-color: #4285f4;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.reload-button:hover {
  background-color: #3367d6;
  transform: translateY(-1px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
}

.reload-button:active {
  background-color: #2a56c6;
  transform: translateY(0);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.reload-button:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(66, 133, 244, 0.3);
}

/* Optional: Add a rotating icon */
.reload-button .icon {
  margin-right: 8px;
  transition: transform 0.5s ease;
}

.reload-button.loading .icon {
  transform: rotate(360deg);
}
.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #6366f1;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.cancel-button {
  padding: 0.75rem 1.25rem;
  background-color: #f1f5f9;
  color: #475569;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.cancel-button:hover {
  background-color: #e2e8f0;
}

.save-button {
  position: relative;
  padding: 0.75rem 1.25rem;
  background-color: #6366f1;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.save-button:hover:not(:disabled) {
  background-color: #4f46e5;
}

.save-button:disabled {
  background-color: #a5b4fc;
  cursor: not-allowed;
}

.button-loader {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
  margin-right: 0.5rem;
}

@media (max-width: 768px) {
  .controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-box {
    min-width: auto;
  }
  
  .pagination-controls {
    flex-direction: column-reverse;
    align-items: stretch;
    gap: 1rem;
  }
  
  .page-navigation {
    justify-content: space-between;
  }
}
</style>