<template>
  <div class="lesson-page">
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
      <section v-if="activeSection === 'course'" class="content">
        <div class="header">
          <BackButton />
          <div class="title-container">
            <FontAwesomeIcon :icon="faBook" class="course-icon" />
            <h1> {{ editMode?(lesson.title):(chapter?.title || 'Chapter') }}</h1>
          </div>
        </div>

        <div class="main-content">
          <div class="lesson-form">
            <div class="form-content">
              <div class="form-left">
                <div class="form-group">
                  <label>Title Lesson</label>
                  <input 
                    type="text" 
                    v-model="lesson.title" 
                    placeholder="Enter your title course"
                    class="form-input"
                  />
                </div>
                <div class="form-group">
                  <label>Position Lesson</label>
                  <input 
                    type="number" 
                    v-model="lesson.position" 
                    placeholder="Enter your title course"
                    class="form-input"
                  />
                </div>
                <div class="form-group description-group">
                  <label>Course Description</label>
                  <textarea 
                    v-model="lesson.description" 
                    placeholder="Enter your course description"
                    class="form-textarea"
                  ></textarea>
                </div>
              </div>

              <div class="form-right">
                <div class="video-upload-container">
                  <div class="video-box" @click="triggerVideoInput">
                    <div v-if="!videoPreviewUrl" class="video-placeholder">
                      <font-awesome-icon :icon="faUpload" class="upload-icon" />
                      <span>Video</span>
                    </div>
                    <video 
                      v-else 
                      :src="videoPreviewUrl" 
                      controls 
                      class="video-preview"
                    ></video>
                  </div>
                  <input 
                    ref="videoInputRef"
                    type="file" 
                    accept="video/*"
                    class="video-input"
                    @change="handleVideoUpload"
                  />
                  <button 
                    class="add-video-btn" 
                    @click="triggerVideoInput"
                  >
                    <font-awesome-icon :icon="faPlus" />
                    {{ selectedVideo ? 'Change Video' : 'Add Video' }}
                  </button>

                  <p class="upload-text">{{ selectedVideo ? selectedVideo.name : 'Add your course video' }}</p>

                </div>
              </div>
            </div>

            <button class="create-btn" @click="handleSubmit" :disabled="isLoading">
              <span v-if="!isLoading">{{editMode?"Update":"Submit"}}</span>
              <span v-else>
                Loading<span v-for="n in loadingDots" :key="n">.</span>
              </span>
            </button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { toast } from 'vue3-toastify';
import BackButton from '../../components/BackButton.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faBook, faGear, faUpload, faPlus} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import type { IChapter, IMenuItem } from '../../types/lesson'
import type { ICourse } from '../../types/course';
import type {IOption } from '../../types/quizz';

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
interface lessonResponse {
  id: number
  title: string
  description: string
  position: number
  videoUrl: string
  duration: number
  chapter: IChapter
  chapterId: number
}
const createdQuiz = ref<{ title: string; passingScore?: number; timeLimit?: number; questions: Question[] } | null>(null);
const route = useRoute();
const router = useRouter();
const chapterId = Number(route.params.chapterId);
const lessonId = Number(route.params.lessonId);
// const oldLesson = ref<lessonResponse>();
const totalLessons = ref(0);
interface Lesson {
  chapterId : number;
  title: string;
  description: string;
  position: number;
  videoUrl: string;
}
const lesson = ref<Lesson>({
  chapterId : chapterId,
  title: '',
  description: '',
  position: 0,
  videoUrl: '',
});


interface Chapter {
  id: number
  title: string
  position: number
  totalLessons: number
  totalDuration: number
  course: ICourse
  courseId: number
}

const chapter = ref<Chapter>();

const menuItems: IMenuItem[] = [
  { id: 'course', icon: faBook, label: 'Course' },
  { id: 'settings', icon: faGear, label: 'Settings' }
];

const activeSection = ref<string>('course');
const setActiveSection = (section: string): void => {
  if (section === 'settings') {
    router.push('/setting-teacher');
  } else {
    activeSection.value = section;
  }
};
const fetchChapter = async () => {
  try {
    const { data } = await api.get<Chapter>(`/chapters/${chapterId}`);
    chapter.value = data;
    totalLessons.value = data.totalLessons;
    lesson.value.position = data.totalLessons + 1;
  } catch (error) {
    console.error('Error fetching chapters:', error);
    toast.error('Failed to load chapters');
  }
};
const fetchLessons = async () => {
  try {
    const {data} = await api.get<lessonResponse>(`/lessons/${lessonId}`);
    lesson.value.title = data.title;
    lesson.value.description = data.description;
    lesson.value.position = data.position;
    videoPreviewUrl.value = data.videoUrl;
  } catch (error) {
    console.error('Error fetching lessons:', error);
    toast.error('Failed to load lessons');
  }
};

const selectedVideo = ref<File | null>(null);
const videoPreviewUrl = ref<string | null>(null);
const videoInputRef = ref<HTMLInputElement | null>(null);

const handleSubmit = () => {
  if (!lesson.value.title || !lesson.value.description) {
    toast.error('Please fill in all required fields!');
    return;
  }
  if (!lesson.value.videoUrl && !selectedVideo.value && !editMode.value) {
    toast.error('Please upload a video!');
    return;
  }

  submitLesson();
};
const isLoading = ref(false);
const loadingDots = ref(0);
let loadingInterval = null;

const submitLesson = async () => {
  const formData = new FormData();
  formData.append('title', lesson.value.title);
  formData.append('description', lesson.value.description);
  formData.append('position', lesson.value.position.toString());
  if (!editMode.value) {
    formData.append('chapterId', lesson.value.chapterId.toString());
  }

  if (selectedVideo.value) {
    formData.append('video', selectedVideo.value);
  } else if (lesson.value.videoUrl) {
    formData.append('videoUrl', lesson.value.videoUrl);
  }

  isLoading.value = true;
  loadingDots.value = 1;
  loadingInterval = setInterval(() => {
    loadingDots.value = (loadingDots.value % 3) + 1;
  }, 300);

  try {
    if (editMode.value) {
      await api.patch(`/lessons/${lessonId}`, formData);
      toast.success('Lesson updated successfully!');
    } else {
      await api.post(`/lessons`, formData);
      toast.success('Lesson created successfully!');
    }

    router.go(-1); 
  } catch (error) {
    console.error('Error creating/updating lesson:', error);
    toast.error('Failed to create/update lesson');
  } finally {
    clearInterval(loadingInterval); 
    isLoading.value = false; 
  }
};

const handleVideoUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  
  if (file) {
    selectedVideo.value = file;
    videoPreviewUrl.value = URL.createObjectURL(file);
    lesson.value.videoUrl = file.name;
    toast.success('Video uploaded successfully!');
  }
};

const triggerVideoInput = () => {
  videoInputRef.value?.click();
};
const editMode = ref(false);
const checkEditMode = () => {
  editMode.value = (route.params.lessonId !== undefined);
};

interface Question {
  questionNumber: string;
  questionText: string;
  answers: string[];
  options: IOption[]; 
  points: number; 
  order: number;
}

// const saveQuiz = async (quizData: IQuiz) => {
//   try {
//     // Làm sạch dữ liệu quiz
//     const cleanedQuiz: IQuiz = {
//       title: quizData.title,
//       description: quizData.description,
//       lessonId: quizData.lessonId,
//       passingScore: quizData.passingScore,
//       timeLimit: quizData.timeLimit,
//       questions: quizData.questions.map((question) => ({
//         question: question.question, // Đảm bảo đây là chuỗi
//         points: question.points || 10,
//         order: question.order,
//         options: question.options.map((option: IOption) => ({
//           text: option.text,
//           isCorrect: option.isCorrect,
//           explanation: option.explanation || '',
//         })),
//       })),
//     };

//     console.log('Cleaned quiz data:', JSON.stringify(cleanedQuiz, null, 2)); // Debug dữ liệu trước khi gửi
//     const response = await api.post('/quizzes', cleanedQuiz);
//     createdQuiz.value = response.data; // Lưu dữ liệu trả về từ backend
//     toast.success('Quiz saved successfully!');
//     showQuizModal.value = false;
//     hasQuiz.value = true;
//   } catch (error) {
//     console.error('Error saving quiz:', error);
//     toast.error('Failed to save quiz');
//   }
// };

onMounted(() => {
  checkEditMode();
  fetchChapter();
  if (editMode.value) {
    fetchLessons();
  }
});

</script>


<style scoped>
.lesson-page {
  width: 100%;
  /* min-height: 120vh; */
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
  gap: 20px;
}

.sidebar-layout {
  position: sticky;
  top: 80px;
  height: fit-content;
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 220px;
  flex-shrink: 0;
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

.content {
  width: 100%;
  padding: 20px;
}

.header {
  align-items: center;
  margin-bottom: 30px;
  border-bottom: 0.5px solid #d1d1d1;
}

.title-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.course-icon {
  font-size: 20px;
}

.main-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  min-width: 0;
}

.lesson-form {
  width: 100%;
  padding: 20px;
}

.form-content {
  display: flex;
  gap: 30px;
  margin-bottom: 20px;
}

.form-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.form-right {
  width: 300px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 600;
  color: #333;
}

.form-input {
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  width: 100%;
  box-sizing: border-box;
}

.form-input:disabled {
  background-color: #f3f4f6;
  cursor: not-allowed;
}

.form-textarea {
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  width: 100%;
  min-height: 150px;
  box-sizing: border-box;
  resize: none;
}

.description-group {
  flex: 1;
}

.video-upload-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.video-box {
  width: 100%;
  aspect-ratio: 10/10;
  border: 2px dashed #e5e7eb;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f9fafb;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
}

.video-preview {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background-color: black;
}

.video-box:hover {
  border-color: #6c9d8f;
  background-color: #f3f4f6;
}

.video-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #6c9d8f;
}

.upload-icon {
  font-size: 32px;
}

.upload-text {
  color: #6b7280;
  font-size: 14px;
}

.video-input {
  display: none;
}

.create-btn {
  padding: 12px 24px;
  background-color: #6c9d8f;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
  float: right;
}

.create-btn:hover {
  background-color: #5a8a7d;
}

.add-video-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background-color: #6c9d8f;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s ease;
  width: 100%;
  justify-content: center;
  margin-top: 8px;
}

.add-video-btn:hover {
  background-color: #5a8a7d;
}


</style>
