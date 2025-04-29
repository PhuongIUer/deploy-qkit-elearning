<template>
  <div class="course-page">
    <div class="main-container">
      <!-- Sidebar Navigation -->
      <div class="sidebar-layout">
        <div class="menu-container">
          <button 
            v-for="menu in menuItems"
            :key="menu.id"
            class="menu-btn"
            :class="{ 'active': activeSection === menu.id }"
            @click="setActiveSection(menu.id)"
          >
            <FontAwesomeIcon :icon="menu.icon" />
            {{ menu.label }}
          </button>
        </div>
      </div>

      <!-- Main Content Area -->
      <div class="course-container">
        <!-- Registered Courses Section -->
        <section v-if="activeSection === 'course'">
          <div class="course-section">
            <h2 class="section-title underlined" @click="toggleRegistered">
              📌 Registered Courses ({{ totalCourses }})
              <span class="dropdown-icon">{{ showRegistered ? '▲' : '▼' }}</span>
            </h2>
            <div v-show="showRegistered" class="course-grid">
              <CourseCard
                v-for="course in courses"
                :key="course.id"
                :course="transformCourseData(course)"
                :isRegistered="true"
                class="course-item"
              />
            </div>
          </div>
        </section>

        <!-- Settings Section -->
        <section v-else-if="activeSection === 'settings'">
          <!-- Settings content here -->
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faBook, faGear } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'vue-router';
import CourseCard from '../../components/CourseCard.vue';
import axios from 'axios';
import type { ICourse } from '../../types/course';
import type { ICommonResponse } from '../../types/index';

const courses = ref<ICourse[]>([]);
const router = useRouter();
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
const totalCourses = ref<number>(0);
const fetchCourses = async () => {
  const response = await api.get<ICourse[]>('/courses/enrolled');
  courses.value = response.data;
  totalCourses.value = response.data.length;
};
const formatPrice = (price: number) => {
  if (!price) return '0'
  return price.toLocaleString('vi-VN')
}
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
interface MenuItem {
  id: string;
  icon: typeof faBook | typeof faGear;
  label: string;
}

// Constants
const menuItems: MenuItem[] = [
  { id: 'course', icon: faBook, label: 'Course' },
  { id: 'settings', icon: faGear, label: 'Settings' }
];

// State
const activeSection = ref<string>('course');
const registeredCourses = ref<number>(9);
const showRegistered = ref<boolean>(true);


// Methods
const setActiveSection = (section: string): void => {
  if (section === 'settings') {
    router.push('/setting-student');
  } else {
    activeSection.value = section;
  }
};

const toggleRegistered = () => {
  showRegistered.value = !showRegistered.value;
};


onMounted(() => {
  fetchCourses();

});
</script>

<style scoped>
.course-page {
  width: 100%;
  width: 100%;
  min-height: 120vh;
  display: flex;
  flex-direction: column;
  align-items: center;

}

.main-container {
  display: flex;
  align-items: flex-start;
  min-height: calc(100vh - 160px);
  padding: 20px;
  width: 100%;
  box-sizing: border-box;
  max-width: 1200px;
}

.sidebar-layout {
  position: sticky;
  top: 80px;
  height: fit-content;
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 220px;
}

.menu-container {
  background-color: #f5f5f5;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.menu-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 24px;
  border: 2px solid #6c9d8f;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 10px;
}

.menu-btn.active,
.menu-btn:hover {
  background-color: #6c9d8f;
  color: white;
}

.course-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.course-card {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 280px;
  flex-direction: column;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.course-card:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
}

.course-avatar {
  background-color: #333;
  color: white;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
}

.course-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.course-header {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  height: 100%;
}

.course-info {
  flex: 1;
}

.course-title {
  font-weight: bold;
  font-size: 14px;
  margin: 0 0 2px 0;
}

.course-date {
  font-size: 12px;
  color: #666;
  margin: 0;
}

.course-container {
  flex: 1;
  margin-left: 40px;
}

.course-item:hover {
  transform: scale(1.05);
  transition: transform 0.3s ease-in-out;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
  cursor: pointer;
}

.section-title {
  font-size: 20px;
  font-weight: bold;
  margin: 20px 0 10px;
  cursor: pointer;
  align-items: center;
  justify-content: space-between;
}

.underlined {
  border-bottom: 3px solid #6c9d8f;
  display: inline-block;
  padding-bottom: 5px;
}

.dropdown-icon {
  font-size: 16px;
  margin-left: 10px;
}


/* responsive */
@media (max-width: 1200px) {
  .main-container {
    max-width: 1200px;
    margin: 0 auto; 
  }

  .course-grid {
    grid-template-columns: repeat(3, 1fr); 
  }
}


@media (max-width: 1024px) {
  .course-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .sidebar-layout {
    width: 100%;
    margin-bottom: 20px;
  }

  .course-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
  }
}

@media (max-width: 480px) {
  .course-grid {
    grid-template-columns: repeat(1, 1fr);
  }
}
</style>
