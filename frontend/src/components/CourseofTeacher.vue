<template>
    <div class="course-card" @click="navigateToCourse(course.id)">
      <!-- Course Thumbnail -->
      <div class="course-thumbnail">
        <img :src="courseImage" :alt="course.image" class="thumbnail-image" />
        <div class="thumbnail-overlay">
          <button class="action-btn modify-btn" @click.stop="handleModify(course.id)">
            Modify
          </button>
          <button class="action-btn edit-btn" @click.stop="handleEdit(course.id)">
            Edit
          </button>
          <button class="action-btn view-btn" @click.stop="handleView(course.id)">
            View
          </button>
          <button class="action-btn delete-btn" @click.stop="handleDelete(course.id)">
            Delete
          </button>
        </div>
      </div>
  
      <!-- Course Content -->
      <div class="course-info">
        <!-- Category & Price -->
        <div class="course-meta-header">
          <span
            class="course-category"
            :style="{
              backgroundColor: categoryStyle.bg,
              color: categoryStyle.text,
            }"
          >
            {{ course.courseLevel }}
          </span>
          <div class="course-pricing">
            <span class="original-price" v-if="course.price">{{ course.price }}$</span>
            <span class="current-price">{{ course.discountPrice }}$</span>
          </div>
        </div>
  
        <!-- Course Title -->
        <h3 class="course-title">{{ course.name }}</h3>
  
        <!-- Instructor & Rating -->
        <div class="instructor-section">
          <div class="instructor-info">
            <img :src="instructorImage" :alt="course.teachings[0]?.avatar" class="instructor-avatar" />
            <span class="instructor-name">{{ course.teachings[0]?.userName }}</span>
          </div>
          <div class="course-rating">
            <span class="rating-value">{{ averageRating }}</span>
            <span class="rating-icon">★</span>
            <span class="rating-count">({{ numberOfReviews }} reviews)</span>
          </div>
        </div>
  
        <!-- Course Stats -->
        <div class="course-stats">
          <div class="stat-item">
            <span class="stat-icon">📚</span>
            <span class="stat-value">{{ course.totalChapters }} Lectures</span>
          </div>
          <div class="stat-item">
            <span class="stat-icon">⏳</span>
            <span class="stat-value">{{ secondsToHMS(course.totalDuration) }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-icon">👨‍🎓</span>
            <span class="stat-value">{{ course.totalStudents }} Students</span>
          </div>
        </div>
      </div>
    </div>
  </template>
      
  <script setup lang="ts">
  import { useRouter } from 'vue-router'
  import { computed, onMounted } from 'vue'
  import { courseStore } from '../store/courseStore'
  import CourseTeacher from '../assets/course-author.png'
  import type { ICourse} from '../types/course'
  import axios,{ isAxiosError } from 'axios'
  import { toast } from 'vue3-toastify'
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
  const coursesStore = courseStore();
  const props = defineProps<{course: ICourse}>()
  
  const router = useRouter()
  const averageRating = computed(() => {
    return coursesStore.averageRating
  })
  const numberOfReviews = computed(() => {
    return coursesStore.numberReviews
  })
  const navigateToCourse = (courseId: number) => {
    router.push(`/courses/${courseId}`)
  }
  const getRatingCourse = async (courseId: number) => {
      await coursesStore.fetchRatingCourse(courseId)
  }
  const handleModify = (courseId: number) => {
    router.push(`/course-teacher/edit-course/${courseId}`);
  }
  const handleEdit = (courseId: number) => {
    router.push(`/course-teacher/courses/${courseId}/create-chapter`);
  }
  const handleView = (courseId: number) => {
    router.push(`/courses/learn/${courseId}`);
  }
const handleDelete = async (courseId: number) => {
  try {
        await api.delete(`/courses/${courseId}`);
        toast.success('Course deleted successfully');
        await new Promise(resolve => setTimeout(resolve, 2000));
        window.location.reload()
      } catch (err) {
        const errorMessage = isAxiosError(err) 
          ? err.response?.data?.message || err.message 
          : 'Failed to delete course';
        
        if(errorMessage === 'Failed to delete course and its related records') {
          toast.error('Course has been buyed by students, cannot be deleted!');
        }else{
          toast.error(errorMessage);
        }
        console.error('Error deleting course:', err);
      }
}
  const secondsToHMS = (totalSeconds: number): string => {
    const hours: number = Math.floor(totalSeconds / 3600);
    const minutes: number = Math.floor((totalSeconds % 3600) / 60);
    const seconds: number = Math.floor(totalSeconds % 60);

    const pad = (num: number): string => num.toString().padStart(2, '0');
    
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };
  const courseImage = computed(() => props.course.image)
  const instructorImage = computed(() => props.course.teachings[0]?.avatar || CourseTeacher)
  onMounted(async () => {
    getRatingCourse(props.course.id)
    })
  const categoryStyle = computed(() => {
    const styleMap = {
      'Web Develop': {
        bg: '#E6F0FF',
        text: '#3A86FF',
      },
      Frontend: {
        bg: '#F0E6FF',
        text: '#8338EC',
      },
      Backend: {
        bg: '#FFE6F0',
        text: '#FF006E',
      },
      Mobile: {
        bg: '#FFEDE6',
        text: '#FB5607',
      },
      Devops: {
        bg: '#FFF9E6',
        text: '#FFBE0B',
      },
      'Big data': {
        bg: '#E6FFF5',
        text: '#06D6A0',
      },
      default: {
        bg: '#F5F5F5',
        text: '#7F7E97',
      },
    }
  
    return styleMap[props.course.any as keyof typeof styleMap] || styleMap.default
  
  
  })
  </script>
      
  <style scoped>
  .course-card {
    --primary-color: #252641;
    --secondary-color: #dce2ee;
    /* --accent-color: #ff4757; */
    --text-dark: #2f3542;
    --text-medium: #57606f;
    --text-light: #7f7e97;
    --border-color: #e8e8e8;
    /* --popular-highlight: #fff2f2; */
    width: 100%;
    /* max-width: 300px; */
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  
  .course-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
    cursor: pointer;
  }
  
  .course-card.popular-course {
    border: 1px solid var(--accent-color);
    background-color: var(--popular-highlight);
  }
  
  /* Badges */
  .course-badges {
    position: absolute;
    top: 12px;
    left: 12px;
    display: flex;
    gap: 8px;
    z-index: 2;
  }
  
  .badge {
    padding: 4px 10px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 700;
    color: white;
  }
  
  .badge.expert {
    background-color: #3a86ff;
  }
  
  .badge.pro {
    background-color: #8338ec;
  }
  
  .badge.popular {
    background-color: var(--accent-color);
  }
  
  /* Thumbnail */
  .course-thumbnail {
    position: relative;
    height: 180px;
    overflow: hidden;
  }
  
  .thumbnail-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
  }
  
  .course-card:hover .thumbnail-image {
    transform: scale(1.05);
  }
  
  /* Course Info */
  .course-info {
    padding: 16px;
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  
  /* Header */
  .course-meta-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }
  
  .course-category {
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 600;
    display: inline-block;
    transition: all 0.3s ease;
  }
  .course-pricing {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  
  .original-price {
    text-decoration: line-through;
    color: var(--text-light);
    font-size: 13px;
  }
  
  .current-price {
    color: #ff0000;
    font-weight: 700;
    font-size: 16px;
  }
  
  /* Title */
  .course-title {
    font-size: 17px;
    font-weight: 700;
    color: #5c8984;
    margin: 0 0 14px 0;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    min-height: calc(17px * 1.4 * 2);
  }
  
  /* Instructor */
  .instructor-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--border-color);
  }
  
  .instructor-info {
    display: flex;
    align-items: center;
  }
  
  .instructor-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    margin-right: 8px;
    object-fit: cover;
  }
  
  .instructor-name {
    font-size: 13px;
    color: var(--text-medium);
    font-weight: 500;
  }
  
  .course-rating {
    display: flex;
    align-items: center;
    font-size: 13px;
  }
  
  .rating-value {
    font-weight: 700;
    color: #f8bc24;
    margin-right: 2px;
  }
  
  .rating-icon {
    color: #f8bc24;
    margin-right: 4px;
  }
  
  .rating-count {
    color: var(--text-light);
  }
  
  /* Stats */
  .course-stats {
    display: flex;
    justify-content: space-between;
    gap: 8px;
  }
  
  .stat-item {
    display: flex;
    align-items: center;
    font-size: 12px;
    color: var(--text-medium);
    gap: 4px;
  }
  
  .stat-icon {
    font-size: 14px;
  }
  
  @media (max-width: 768px) {
    .course-card {
      max-width: 100%;
    }
  
    .course-thumbnail {
      height: 160px;
    }
  
    .course-title {
      font-size: 16px;
    }
  }
  .course-thumbnail {
  position: relative;
  height: 180px;
  overflow: hidden;
}

.thumbnail-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: grid;
  grid-template-columns: repeat(2, auto); /* 2 columns */
  grid-template-rows: repeat(2, auto);    /* 2 rows */
  gap: 10px;
  place-content: center; /* centers both columns and rows */
  opacity: 0;
  transition: opacity 0.3s ease;
}
.course-thumbnail:hover .thumbnail-overlay {
  opacity: 1;
}

.action-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.modify-btn {
  background-color: #f9c74f;
  color: white;
}

.modify-btn:hover {
  background-color: #f1b434;
}

.edit-btn {
  background-color: #3a86ff;
  color: white;
}

.edit-btn:hover {
  background-color: #2a76ef;
}

.view-btn {
  background-color: #06d6a0;
  color: white;
}

.view-btn:hover {
  background-color: #05c18f;
}

.delete-btn {
  background-color: #ff4757;
  color: white;
}

.delete-btn:hover {
  background-color: #ee3747;
}


  </style>