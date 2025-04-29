<template>
  <div class="course-learning-container">
    <!-- Sidebar Navigation -->
    <div class="course-sidebar">
      <div class="sidebar-header">
        <h3><span class="course-circle">●</span> Course Content</h3>
      </div>

      <div class="sidebar-sections">
        <div
          v-for="(chapter, index) in chapters"
          :key="chapter.id"
          class="sidebar-section"
          :class="{ 'is-active': activeChapter === chapter.id }"
        >
          <div class="section-header" @click="toggleChapter(chapter.id)">
            <div class="section-module-icon">
              <span class="module-icon">📘</span>
            </div>
            <div class="section-info">
              <div class="section-title">Chapter {{chapter.position}}: {{ chapter.title }}</div>
              <div class="section-meta">
                <span class="lesson-count">{{ chapter.totalLessons }} lessons</span>
                <span class="duration">{{ formatDuration(chapter.totalDuration) }}</span>
              </div>
            </div>
            <div class="toggle-icon">
              <i
                :class="
                  activeChapter === chapter.id ? 'fas fa-chevron-down' : 'fas fa-chevron-right'
                "
              ></i>
            </div>
          </div>

          <div class="lesson-list" v-show="activeChapter === chapter.id">
            <div
              v-for="lesson in getLessonsForChapter(chapter.id)"
              :key="lesson.id"
              class="lesson-item"
              :class="{ 'is-active': activeLesson === lesson.id }"
              @click="selectLesson(lesson)"
            >
              <span class="lesson-number">Lesson #{{ lesson.position }}: </span>
              <span class="lesson-title">{{ lesson.title }}</span>
              <span class="lesson-duration">{{ formatDuration(lesson.duration) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="course-right">
      <div v-if="loading" class="loading-state">
        <i class="fas fa-spinner fa-spin"></i> Loading course content...
      </div>

      <!-- Content when loaded -->
      <template v-else>
        <!-- Course Header -->

        <div class="course-header">
          <h1>Lesson #{{currentLesson.position}}: {{ currentLesson?.title || course?.name || 'Select a lesson' }}</h1>
          <div class="course-meta" v-if="currentLesson">
            <span class="section-name">Chapter {{currentChapter.position}}: {{ currentChapter?.title || '' }}</span>
            <span class="divider">•</span>
            <span class="lesson-duration">{{ formatDuration(currentLesson.duration) }}</span>
          </div>
        </div>
      </template>
      <div class="course-main">
        <!-- Loading state -->
        <div v-if="loading" class="loading-state">
          <i class="fas fa-spinner fa-spin"></i> Loading course content...
        </div>

        <!-- Content when loaded -->
        <template v-else>
          <!-- Video Player -->
          <div class="video-container">
            <video
              ref="videoPlayer"
              controls
              class="video-player"
              :poster="getVideoThumbnail(currentLesson?.videoUrl)"
            >
              <source :src="currentLesson?.videoUrl" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <div class="video-controls">
              <div class="control-buttons">
                <button class="expand-btn"><i class="fas fa-expand"></i></button>
              </div>
            </div>
          </div>

          <!-- Content Tabs -->
          <div class="content-tabs">
            <div
              class="tab"
              :class="{ 'is-active': activeTab === 'overview' }"
              @click="activeTab = 'overview'"
            >
              Overview
            </div>
            <div
              class="tab"
              :class="{ 'is-active': activeTab === 'quiz' }"
              @click="activeTab = 'quiz'"
            >
              Quiz
            </div>
          </div>

          <!-- Tab Content -->
          <div class="tab-content">
            <div v-if="activeTab === 'overview'" class="overview-content">
              <h3>About This Lesson</h3>
              <p>
                {{ currentLesson?.description || 'Lesson description not available' }}
              </p>
            </div>
            <div v-if="activeTab === 'quiz'" class="quiz-content">
              <h3>Lesson Quiz</h3>
              <div class="quiz-info">
                <div class="info-item">
                  <div class="info-value">5</div>
                  <div class="info-label">Questions</div>
                </div>
                <div class="info-item">
                  <div class="info-value">5 min</div>
                  <div class="info-label">Duration</div>
                </div>
                <div class="info-item">
                  <div class="info-value">70</div>
                  <div class="info-label">Passing Score</div>
                </div>
              </div>
              <button class="start-quiz-btn" @click="startQuiz">Start Quiz</button>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
  
  <script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { formatDuration } from '../utils/time'

const route = useRoute()
const router = useRouter()
const courseId = route.params.id

const activeChapter = ref(null)
const activeLesson = ref(null)
const activeTab = ref('overview')
const chapters = ref([])
const lessons = ref([])
const course = ref(null)
const loading = ref(true)
const videoPlayer = ref(null)

// Mock learning points since they're not in the API
const learningPoints = ref([
  'Key concepts in the lesson',
  'Practical applications',
  'Best practices to follow',
])

const startQuiz = () => {
  router.push(`/courses/quiz/1`)
}
const currentChapter = computed(() => {
  return chapters.value.find((ch) => ch.id === activeChapter.value)
})

const currentLesson = computed(() => {
  return lessons.value.find((l) => l.id === activeLesson.value)
})

const getLessonsForChapter = (chapterId) => {
  return lessons.value.filter((lesson) => lesson.chapterId === chapterId)
}

const toggleChapter = async (chapterId) => {
  if (activeChapter.value === chapterId) {
    activeChapter.value = null
  } else {
    activeChapter.value = chapterId
    if (!lessons.value.some((l) => l.chapterId === chapterId)) {
      await fetchLessons(chapterId)
    }
    // Auto-select first lesson if none selected
    if (!activeLesson.value) {
      const chapterLessons = getLessonsForChapter(chapterId)
      if (chapterLessons.length > 0) {
        selectLesson(chapterLessons[0])
      }
    }
  }
}

const selectLesson = (lesson) => {
  activeLesson.value = lesson.id
  activeTab.value = 'overview'
}

const fetchChapters = async () => {
  try {
    const response = await fetch(`http://14.225.217.42:5000/api/chapters/course/${courseId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        Accept: 'application/json',
      },
    })
    chapters.value = await response.json()

    // Automatically select the first chapter with lessons if available
    const chapterWithLessons = chapters.value.find((ch) => ch.totalLessons > 0)
    if (chapterWithLessons) {
      await toggleChapter(chapterWithLessons.id)
    }
  } catch (error) {
    console.error('Error fetching chapters:', error)
  } finally {
    loading.value = false
  }
}

const fetchLessons = async (chapterId) => {
  try {
    const response = await fetch(`http://14.225.217.42:5000/api/lessons/chapter/${chapterId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        Accept: 'application/json',
      },
    })
    const chapterLessons = await response.json()
    // Add chapterId to each lesson for filtering
    const lessonsWithChapter = chapterLessons.map((lesson) => ({
      ...lesson,
      chapterId,
    }))
    lessons.value = [...lessons.value, ...lessonsWithChapter]
  } catch (error) {
    console.error('Error fetching lessons:', error)
  }
}

watch(currentLesson, (newLesson) => {
  if (newLesson?.videoUrl && videoPlayer.value) {
    // Reset and play the new video
    videoPlayer.value.load()
    videoPlayer.value.play().catch((e) => {
      console.error('Autoplay prevented:', e)
      // Handle autoplay restrictions (user may need to interact first)
    })
  }
})

const getVideoThumbnail = (videoUrl) => {
  if (!videoUrl) return ''
  // If using Cloudinary, you can generate a thumbnail URL
  if (videoUrl.includes('cloudinary.com')) {
    return videoUrl.replace('/upload/', '/upload/w_800,h_450,c_fill,q_auto,f_auto/')
  }
  return ''
}

onMounted(() => {
  fetchChapters()
})
</script>
  
  <style scoped>
/* Main Container Styles */
.course-learning-container {
  display: flex;
  min-height: 100vh;
  background-color: #f0f8ff;
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: 1.2rem;
  color: #666;
}

.loading-state i {
  margin-right: 0.5rem;
}

/* Sidebar Styles */
.course-sidebar {
  width: 320px;
  background-color: #f8f9fa;
  border-right: 1px solid #e0e0e0;
  height: 100vh;
  overflow-y: auto;
}

.sidebar-header {
  padding: 1.2rem 1rem;
  border-bottom: 1px solid #e0e0e0;
}

.sidebar-header h3 {
  margin: 0;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  color: #2c3e50;
}

.course-circle {
  color: #3498db;
  font-size: 1.5rem;
  margin-right: 10px;
}

.sidebar-sections {
  padding: 0;
}

.sidebar-section {
  border-bottom: 1px solid #e0e0e0;
}

.section-name {
  font-size: 0.9rem;
  color: #252641;
}
.section-header {
  padding: 0.8rem 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: background-color 0.2s;
  background-color: #e6f2ff;
}

.section-header:hover {
  background-color: #cfe7ff;
}

.section-module-icon {
  margin-right: 10px;
}

.module-icon {
  font-size: 1.1rem;
}

.section-info {
  flex: 1;
}

.section-title {
  font-weight: 500;
  font-size: 0.9rem;
  margin-bottom: 0.3rem;
  color: #252641;
}

.section-meta {
  font-size: 0.75rem;
  color: #6c757d;
}

.lesson-count {
  margin-right: 0.5rem;
}

.toggle-icon {
  font-size: 0.8rem;
  color: #6c757d;
}

.lesson-list {
  background-color: #e1f8ff;
}

.lesson-item {
  padding: 20px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 0.85rem;
  border-bottom: 1px solid #f0f0f5;
}

.lesson-item:hover {
  background-color: #c3e5f0;
}

.lesson-item.is-active {
  background-color: #b7dfeb;
}

.lesson-number {
  margin-right: 0.5rem;
  color: #696984;
}

.lesson-title {
  flex: 1;
  color: #696984;
}

.lesson-duration {
  font-size: 0.75rem;
  color: #6c757d;
}

/* Main Content Styles */
.course-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #f0f8ff;
}
.course-main {
  flex: 1;
  padding: 15px;
  background-color: #f0f8ff;
}

.course-header {
  margin-bottom: 10px;
  background-color: #aad8d3;
  padding: 20px;
}

.course-header h1 {
  margin: 0 0 0.5rem 0;
  font-size: 1.8rem;
  color: #264b47;
}

.course-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #6c757d;
  font-size: 0.9rem;
}

.time-indicator {
  display: flex;
  align-items: center;
}

.time-indicator i {
  margin-right: 0.3rem;
}

/* Video Player Styles */
.video-container {
  background-color: #000;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  position: relative;
  overflow: hidden;
}

.video-player {
  width: 100%;
  display: block;
}

.video-controls {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  padding: 0.5rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
}

.expand-btn {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
}

/* Make sure the video container maintains aspect ratio */
.video-container {
  position: relative;
  padding-bottom: 56.25%; /* 16:9 aspect ratio */
  height: 0;
  overflow: hidden;
}

.video-container video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

/* Tab Styles */
.content-tabs {
  display: flex;
  margin-bottom: 1rem;
}

.tab {
  padding: 0.75rem 2rem;
  cursor: pointer;
  font-weight: 600;
  color: #5f6469;
  background-color: #e9ecef;
  border-radius: 7px;
}

.tab:not(:last-child) {
  margin-right: 0.5rem;
}

.tab:hover {
  color: #2c3e50;
}

.tab.is-active {
  color: #fff;
  background-color: #5c8984;
}

/* Tab Content Styles */
.tab-content {
  background-color: #fff;
  padding: 1.5rem;
  border-radius: 0 4px 4px 4px;
}

.overview-content h3 {
  margin: 1.5rem 0 1rem 0;
  color: #2c3e50;
  font-size: 1.1rem;
}

.overview-content p {
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.course-description,
.course-conclusion {
  color: #333;
  line-height: 1.6;
}

/* Quiz Content Styles */
.quiz-info {
  display: flex;
  justify-content: space-around;
  margin: 2rem 0;
}

.info-item {
  text-align: center;
}

.info-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: #5c8984;
}

.info-label {
  font-size: 0.9rem;
  color: #6c757d;
}

.start-quiz-btn {
  background-color: #5c8984;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  transition: background-color 0.2s;
}

.start-quiz-btn:hover {
  background-color: #89a9a6;
}

/* Responsive Design */
@media (max-width: 992px) {
  .course-learning-container {
    flex-direction: column;
  }

  .course-sidebar {
    width: 100%;
    height: auto;
    max-height: 400px;
    border-right: none;
    border-bottom: 1px solid #e0e0e0;
  }

  .course-main {
    height: auto;
  }
}

@media (max-width: 576px) {
  .course-main {
    padding: 1rem;
  }

  .course-header h1 {
    font-size: 1.5rem;
  }

  .section-header {
    padding: 0.8rem;
  }

  .lesson-item {
    padding: 0.75rem 1rem 0.75rem 2rem;
  }
}
</style>