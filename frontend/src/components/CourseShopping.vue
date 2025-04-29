<template>
  <div class="course-card" v-if="course">
    <div class="course-labels">
      <img :src="course.image || defaultCourseImg" :alt="course.name" />
    </div>

    <div class="course-content">
      <div class="course-title">{{ course.name }}</div>

      <div class="course-description">
        <div class="course-subject">{{ course.category?.name || 'General' }}</div>
      </div>

      <div class="teacher-info">
        <img :src="course.teachings[0]?.user.avatar||defaultCourseImg" alt="Instructor" class="teacher-avatar" />
        <div class="teacher-name">{{ course.teachings[0]?.user.userName}}</div>
      </div>
      
      <div class="course-price">
        <span 
          v-if="course.discountPrice"
          class="original-price"
        >
          ${{ course.price.toFixed(2) }}
        </span>
        <span class="current-price">
          ${{ (course.discountPrice || course.price).toFixed(2) }}
        </span>
        <span 
          v-if="course.discountPercentage"
          class="discount-badge"
        >
          {{ course.discountPercentage }}% OFF
        </span>
      </div>
  
      <div class="course-teacher">
        <div class="course-meta">
          <div class="meta-item">📚 <span>{{ course.totalLessons }} Lessons</span></div>
          <div class="meta-item">⏳ <span>{{ formatDuration(course.totalDuration) }}</span></div>
          <div class="meta-item">👨‍🎓 <span>{{ course.totalStudents }} Students</span></div>
        </div>
  
        <div class="course-rating">
          <span class="rating-stars">{{ course.courseLevel }}</span>
        </div>
      </div>
    </div>
  </div>
  <div v-else-if="isLoading" class="course-loading">
    Loading course information...
  </div>
  <div v-else class="course-error">
    Failed to load course details
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import defaultCourseImg from '../assets/course-img.png';
import axios from 'axios';

interface Category {
  id: number;
  name: string;
  description: string;
}

enum CourseLevel {
  Beginner = 'BEGINNER',
  Intermediate = 'INTERMEDIATE',
  Advanced = 'ADVANCED'
}

interface Teaching {
  id: number
  userId: number
  courseId: number
  createdAt: string
  user: User
}
interface User {
  id: number
  email: string
  password: string
  userName: string
  avatar: string
  isVerified: boolean
  isBlocked: boolean
}
interface Course {
  id: number;
  name: string;
  price: number;
  description: string;
  courseLevel: CourseLevel;
  totalLessons: number;
  totalStudents: number;
  discountPrice: number;
  discountTimeRemaining: string; // ISO date string
  discountPercentage: number;
  image: string;
  slug: string;
  category: Category;
  createdAt: string; // ISO date string
  teachings: Teaching[];
  averageRating: number;
  ratingCount: number;
  totalDuration: number | null;
}


const props = defineProps<{
  courseId: number;
  courseData?: Course; // Optional prop for preloaded data
}>();

const API_BASE_URL = 'http://14.225.217.42:5000/api';
const course = ref<Course | null>(null);
const isLoading = ref(false);
const error = ref<string | null>(null);

const formatDuration = (minutes: number | null): string => {
  if (!minutes) return 'N/A';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

const fetchCourseData = async () => {
  if (props.courseData) {
    course.value = props.courseData;
    return;
  }

  try {
    isLoading.value = true;
    error.value = null;
    
    const response = await axios.get(`${API_BASE_URL}/courses/${props.courseId}`, {
      timeout: 10000
    });

    if (response.status === 200) {
      course.value = response.data;
    }
  } catch (err) {
    console.error('Error fetching course:', err);
    error.value = 'Failed to load course details';
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchCourseData();
});

watch(() => props.courseId, () => {
  fetchCourseData();
});

watch(() => props.courseData, (newData) => {
  if (newData) {
    course.value = newData;
  }
});
</script>

<style scoped>
.course-card {
  display: flex;
  width: 100%;
  align-items: center;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 20px 10px; 
}

.course-labels img {
  display: flex;
  width: 300px;
  height: 200px;
  border-radius: 6px;
  object-fit: cover;
  margin: 10px;
  align-items: center;
}

.course-content {
  margin: 0 20px;
  width: 100%;
}

.course-title {
  font-size: 24px;
  font-weight: bolder;
  color: #5c8984;
}

.course-description {
  margin: 5px 0;
}

.course-subject {
  background-color: #dce2ee;
  padding: 5px 10px;
  border-radius: 15px;
  display: inline-block;
}

.teacher-info {
  display: flex;
  align-items: center;
  margin: 10px 0;
}

.teacher-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  margin-right: 10px;
}

.course-price {
  font-size: 20px;
  font-weight: bold;
  color: #ff0000;
  margin-top: 5px;
  border-bottom: 2px solid #ddd;
  padding-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.original-price {
  text-decoration: line-through;
  color: #64748b;
  font-size: 16px;
}

.current-price {
  color: #1e293b;
}

.discount-badge {
  background-color: #fef2f2;
  color: #dc2626;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}

.course-teacher {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}

.course-meta {
  display: flex;
  gap: 10px;
}

.meta-item {
  font-size: 14px;
  color: #333;
}

.course-rating {
  display: flex;
  align-items: center;
  font-size: 14px;
}

.rating-stars {
  color: #f8bc24;
  margin-right: 5px;
}

.course-loading,
.course-error {
  padding: 20px;
  text-align: center;
  color: #64748b;
}

.course-error {
  color: #dc2626;
}
</style>