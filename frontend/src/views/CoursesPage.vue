<template>
  <div class="course-page">
    <header
      class="search-header"
      :style="{
        backgroundImage: `url(${SearchBackground})`,
      }"
    >
      <div class="search-container">
        <div class="search-box">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Search for courses..."
            class="search-input"
            @keyup.enter="fetchCourses"
          />
          <button class="search-button" @click="fetchCourses">Search</button>
        </div>
        <div class="filters">
          <v-menu>
            <template v-slot:activator="{ props }">
              <v-btn v-bind="props" color="teal-lighten-5" class="filter-btn">
                {{ selectedCategory?.name || 'Subject' }}
                <v-icon end>mdi-chevron-down</v-icon>
              </v-btn>
            </template>
            <v-card>
              <v-list>
                <v-list-item @click="selectCategory(null)">
                  <v-list-item-title>All Subjects</v-list-item-title>
                </v-list-item>
                <v-list-item
                  v-for="category in categories"
                  :key="category.id"
                  @click="selectCategory(category)"
                >
                  <v-list-item-title>{{ category.name }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-card>
          </v-menu>

          <v-menu>
            <template v-slot:activator="{ props }">
              <v-btn v-bind="props" color="teal-lighten-5" class="filter-btn">
                {{ selectedLevel || 'Level' }}
                <v-icon end>mdi-chevron-down</v-icon>
              </v-btn>
            </template>
            <v-card>
              <v-list>
                <v-list-item @click="selectLevel('')">
                  <v-list-item-title>All Levels</v-list-item-title>
                </v-list-item>
                <v-list-item v-for="level in levels" :key="level" @click="selectLevel(level)">
                  <v-list-item-title>{{ level }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-card>
          </v-menu>

          <v-btn
            color="error"
            class="reset-btn"
            @click="clearFilters"
            :disabled="!hasActiveFilters"
          >
            Reset Filters
            <v-icon end>mdi-close</v-icon>
          </v-btn>
        </div>
      </div>
    </header>

    <main class="course-content">
      <!-- Sort options -->
      <div class="sort-options">
        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn v-bind="props" class="sort-btn" @click="fetchCourses">
              {{ sortOptions.find((opt) => opt.value === sortBy)?.label || 'Sort by' }}
              <v-icon end>mdi-chevron-down</v-icon>
            </v-btn>
          </template>
          <v-card>
            <v-list>
              <v-list-item
                v-for="option in sortOptions"
                :key="option.value"
                @click="handleSortOptionClick(option.value)"
              >
                <v-list-item-title>{{ option.label }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card>
        </v-menu>
      </div>

      <!-- Loading state -->
      <div v-if="loading" class="loading-container">
        <div class="skeleton-grid">
          <div v-for="n in 12" :key="n" class="skeleton-card">
            <v-skeleton-loader type="image, article, button"></v-skeleton-loader>
          </div>
        </div>
      </div>

      <!-- No results state -->
      <div v-else-if="courses.length === 0" class="no-results">
        <v-icon size="60" color="grey">mdi-magnify-remove</v-icon>
        <h3>No courses found</h3>
        <p>We couldn't find any courses matching your search criteria.</p>
      </div>

      <!-- Course Grid -->
      <div v-else class="course-grid">
        <CourseCard
          v-for="course in courses"
          :key="course.id"
          :course="transformCourseData(course)"
          :isRegistered="false"
          class="course-item"
        />
      </div>

      <!-- Pagination -->
      <div v-if="courses.length > 0 && totalPages > 1" class="pagination-container">
        <v-pagination
          v-model="currentPage"
          :length="totalPages"
          :total-visible="7"
          class="custom-pagination"
          active-color="blue"
          @update:modelValue="fetchCourses"
        ></v-pagination>
      </div>
    </main>

    <!-- Students are viewing section -->
    <section class="popular-courses">
      <h2 class="section-title text-navy">Students Are Viewing</h2>
      <CoursesCarousel :courses="popularCourses" />
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import CourseCard from '../components/CourseCard.vue'
import CoursesCarousel from '../components/CoursesCarousel.vue'
import { VPagination } from 'vuetify/components/VPagination'
import SearchBackground from '../assets/search-background.png'
import courseService from '../api/CourseService'
import type { ICourse,  Category} from '../types/course'


// Data states
const courses = ref<ICourse[]>([])
const popularCourses = ref<ICourse[]>([])
const categories = ref<Category[]>([])
const loading = ref<boolean>(false)
const totalItems = ref<number>(0)

// Filter and pagination states
const searchQuery = ref('')
const selectedCategory = ref<Category>()
const selectedLevel = ref('')
const currentPage = ref(1)
const itemsPerPage = 12
const totalPages = ref(1)
const sortBy = ref('popular')

const levels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED']
const sortOptions = [
  { value: 'mostStudents', label: 'Most Popular' },
  { value: 'createdAt', label: 'Newest' },
  { value: 'priceLowToHigh', label: 'Price: Low to High' },
  { value: 'priceHighToLow', label: 'Price: High to Low' },
]

// Computed properties
const hasActiveFilters = computed(() => {
  return searchQuery.value || selectedCategory.value || selectedLevel.value
})

// Fetch courses from API
const fetchCourses = async () => {
  try {
    loading.value = true;

    const params = new URLSearchParams({
      page: currentPage.value.toString(),
      limit: itemsPerPage.toString(),
      ...(searchQuery.value && { search: searchQuery.value }),
      ...(selectedCategory.value && { categoryId: selectedCategory.value.id.toString() }),
      ...(selectedLevel.value && { courseLevel: selectedLevel.value }),
    });

    // Handle sorting - only send sortBy without order
    if (sortBy.value === 'popular') {
      params.append('sortBy', 'totalStudents');
    } else if (sortBy.value === 'newest') {
      params.append('sortBy', 'createdAt');
    } else if (sortBy.value === 'price-low') {
      params.append('sortBy', 'price_asc'); // Assuming API uses suffix for direction
    } else if (sortBy.value === 'price-high') {
      params.append('sortBy', 'price_desc'); // Assuming API uses suffix for direction
    }

    const response = await fetch(`http://localhost:3000/api/courses?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();

    courses.value = data.items;
    totalItems.value = data.total;
  } catch (error) {
    console.error('Error fetching courses:', error);
  } finally {
    loading.value = false;
  }
};
// Fetch categories
const fetchCategories = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/categories')
    categories.value = await response.json()
  } catch (error) {
    console.error('Error fetching categories:', error)
  }
}

// Transform API data to match CourseCard component expectations
const transformCourseData = (course: ICourse) => {
  return {
    id: course.id,
    image: course.image,
    subject: course.category?.name || 'Development',
    level: course.courseLevel?.toLowerCase() || 'beginner',
    title: course.name,
    description: course.description,
    originalPrice: formatPrice(course.price),
    discountedPrice: formatPrice(course.discountPrice || course.price),
    teacherAvatar: course.teachings?.[0]?.avatar || '',
    teacherName: course.teachings?.[0]?.userName || 'Instructor',
    price: course.price,
    students: course.totalStudents || 0,
    rating: course.averageRating || 0,
    reviews: course.ratingCount || 0,
    lectures: course.totalLessons || 0,
    duration: course.totalDuration,
    isPopular: false,
  }
}

const fetchPopularCourses = async () => {
  courseService.getPopularCourse().then((res) => {
    popularCourses.value = res.items.slice(0, 5).map((course: ICourse) => {
      return {
        ...course,
      }
    })
  })
}

// Format price for display
const formatPrice = (price: number) => {
  if (!price) return '0'
  return price.toLocaleString('vi-VN')
}

// Filter handlers
const selectCategory = (category: Category | null) => {
  selectedCategory.value = category
  currentPage.value = 1
  fetchCourses()
}

const selectLevel = (level: string) => {
  selectedLevel.value = level
  currentPage.value = 1
  fetchCourses()
}

const clearFilters = () => {
  selectedCategory.value = null
  selectedLevel.value = ''
  searchQuery.value = ''
  currentPage.value = 1
  fetchCourses()
}

const handleSortOptionClick = (value: string) => {
  sortBy.value = value
  currentPage.value = 1
  fetchCourses()
}

// Initial fetch
onMounted(() => {
  fetchCourses()
  fetchCategories()
  fetchPopularCourses()
})
</script>

<style scoped lang="scss">
.course-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.search-header {
  background-size: cover;
  background-position: center;
  padding: 80px 20px;
  color: white;
  text-align: center;
}

.search-container {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
  position: relative;
}

.search-box {
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 800px;
  margin: 0 auto 20px;
  background: rgb(255 255 255);
  border-radius: 10px;
  padding: 5px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.search-input {
  flex: 1;
  padding: 12px 20px;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  outline: none;
  background: white;
}

.search-button {
  padding: 12px 30px;
  background-color: #5c8984;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
  font-weight: 500;
}

.search-button:hover {
  background-color: #4a9e96;
}

.filters {
  display: flex;
  justify-content: center;
  gap: 15px;
  flex-wrap: wrap;
}

.filter-btn {
  font-weight: 700;
  background-color: #9ad8de;
  color: #252641;
  border-radius: 5px;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s;
}

.reset-btn {
  font-weight: 700;
  border-radius: 5px;
}

.course-content {
  flex-grow: 1;
  max-width: 1400px;
  margin: 30px auto;
  width: 100%;
  padding: 0 20px;
  min-height: 600px;
}

.sort-options {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 30px;
  justify-content: flex-start;
  flex-direction: row-reverse;
}

.sort-btn {
  font-weight: 700;
  background-color: #9ad8de;
  color: #252641;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s;
}

.loading-container {
  margin: 20px 0;
}

.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 25px;
  margin-bottom: 40px;
}

.skeleton-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;

  h3 {
    margin: 20px 0 10px;
    font-size: 24px;
    color: #333;
  }

  p {
    color: #666;
    margin-bottom: 20px;
    font-size: 16px;
  }
}

.course-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 25px;
  margin-bottom: 40px;
}

.popular-courses {
  margin: 0 auto;
  padding: 40px 0;
  background-color: #ebf5ff;
  width: 100%;
}

.popular-courses h2 {
  font-size: 1.8rem;
  color: #374259;
  margin-bottom: 30px;
  text-align: center;
}

.pagination-container {
  margin-top: 40px;
  display: flex;
  justify-content: center;
}

:deep(.v-pagination__prev .v-btn),
:deep(.v-pagination__next .v-btn) {
  background-color: #dbf1f2;
  border-radius: 8px;

  i {
    color: #5c8984;
  }

  &:hover {
    background-color: #e0e0e0;
  }
}

:deep(.text-blue) {
  background: #5c8984;

  span {
    color: #fff;
  }
}

.section-title {
  text-align: center;
  margin-bottom: 10px;
  font-size: 45px;
  font-weight: bold;
  color: #2f327d;
}

@media (max-width: 768px) {
  .search-box {
    flex-direction: column;
  }

  .search-input,
  .search-button {
    border-radius: 30px;
    width: 100%;
  }

  .search-button {
    margin-top: 10px;
  }

  .filters {
    flex-direction: column;
    align-items: center;
  }

  .course-grid {
    grid-template-columns: 1fr;
  }
}
</style>