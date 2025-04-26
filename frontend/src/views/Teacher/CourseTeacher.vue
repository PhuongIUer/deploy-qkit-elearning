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
  <!-- Teacher Courses Section -->
  <section v-if="activeSection === 'course'">
    <div class="course-section">
      <h2 class="section-title underlined" @click="toggleTeacher">
        Courses ({{ teacherCourses }})
        <span class="dropdown-icon">{{ showTeacher ? '▲' : '▼' }}</span>
      </h2>
      <div v-show="showTeacher" class="course-grid">
        <!-- Add v-if to prevent errors if courses is undefined -->
        <template v-if="courses && courses.length">
          <CourseofTeacher
            v-for="course in courses"
            :key="course.id"
            :course="course"
            class="course-item"
          />
        </template>
        <div v-else class="no-courses-message">
          No courses available
        </div>

        <div class="course-item create-card" @click="goToCreateCourse">
          <div class="create-icon-wrapper">
            <font-awesome-icon :icon="faPlus" class="create-icon"/>
          </div>
          <div class="create-text">Create</div>
        </div>
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
        <div class="course-item create-card" @click="goToCreateCourse">
          <div class="create-icon-wrapper">
            <font-awesome-icon :icon="faPlus" class="create-icon"/>
          </div>
          <div class="create-text">Create</div>
        </div>

</template>

  <script setup lang="ts">
import { ref,  onMounted  } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faBook, faGear, faPlus } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { courseStore } from '../../store/courseStore';
import { formatDuration } from '../../utils/time'
import type { ICourseTeaching } from '../../types/course';
import CourseofTeacher from '../../components/CourseofTeacher.vue';
const router = useRouter();
const coursesStore = courseStore();
interface MenuItem {
  id: string;
  icon: typeof faBook | typeof faGear;
  label: string;
}

const menuItems: MenuItem[] = [
  { id: 'course', icon: faBook, label: 'Course' },
  { id: 'settings', icon: faGear, label: 'Settings' }
];

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

// State
const activeSection = ref<string>('course');
const teacherCourses = ref<number>();
const showTeacher = ref<boolean>(true);
const courses = ref<ICourseTeaching[]>([]);
// Methods
const setActiveSection = (section: string): void => {
  if (section === 'settings') {
    router.push('/setting-teacher');
  } else {
    activeSection.value = section;
  }
};

const toggleTeacher = () => {
  showTeacher.value = !showTeacher.value;
};

const goToCreateCourse = () => {
  router.push('/course-teacher/create-course');
  router.push('/course-teacher/create-course');
};

const fetchCourses = async () => {
  try {
    // Fetch courses from the store
    await coursesStore.fetchCoursesTeacher();
    const rawCourses = coursesStore.CoursesTeaching;
    courses.value = rawCourses.map((course: ICourseTeaching) => {
      return {
        ...course,
      };
    }) || []; 
    teacherCourses.value = courses.value.length;
    
  } catch (error) {
    console.error('Error fetching courses:', error);
    courses.value = []; 
    teacherCourses.value = 0;
  }
};

onMounted(() => {
  fetchCourses();
  

});

</script>

<style>
.course-page{
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
  .course-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 25px;
  margin-bottom: 40px;
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

  .create-card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border: 2px dashed #bbb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: #fafafa;
  padding: 40px 20px;
  height: 100%;
  min-height: 400px; 
  box-sizing: border-box;
}


.create-card:hover {
  background-color: #e6f4f1;
  transform: scale(1.05);
}

.create-icon {
  font-size: 36px;
  color: #6c9d8f;
  font-weight: bold;
}

.create-icon-wrapper{
  display: flex;
  justify-content: center;
  align-items: center;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #e0f0ea;
}

.create-text {
  margin-top: 10px;
  font-size: 24px;
  color: #000000;
  font-weight: 600;
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
  