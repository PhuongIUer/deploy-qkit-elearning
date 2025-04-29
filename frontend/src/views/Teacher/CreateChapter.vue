<template>
  <div class="chapter-page">
    <div class="main-container">
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
      <!-- Header -->
      <section v-if="activeSection === 'course'" style="width: 100%;">
        <div class="main-content">
          <div class="header">
            <BackButton />
            <div class="title-container">
              <FontAwesomeIcon :icon="faBook" class="course-icon" />
              <h1>{{ courseResponse?.name || 'Loading...' }}</h1>
            </div>
          </div>
          <div class="chapter-container">
            <div class="chapter-list">
              <div class="chapter-header">
                <h2>Chapters</h2>
                <button class="add-chapter-btn" @click="showCreateForm = true">
                  <FontAwesomeIcon :icon="faPlus" />
                  Create New Chapter
                </button>
              </div>

              <div v-if="chapters.length === 0" class="empty-state">
                No chapters yet. Create your first chapter!
              </div>
              <div v-else class="chapters">
                <div v-for="chapter in chapters" :key="chapter.id" style="cursor: pointer;">
                  
                  <div @click.stop="fetchLessons(chapter.id)">
                    <div class="chapter-info">
                      <h3>Chapter {{chapter.position}}: {{ chapter.title }}</h3>
                      <div class="chapter-actions">
                        <button class="action-btn edit-btn" @click="editChapter(chapter)">
                          <FontAwesomeIcon :icon="faPen" />
                        </button>
                        <button class="action-btn delete-btn" @click="deleteChapter(chapter.id)">
                          <FontAwesomeIcon :icon="faTrash" />
                        </button>
                      </div>
                    </div>
                    <div v-if="true" >    
                      <div v-for="lesson in chapter.lessons" :key="lesson.id" class="lesson-item-container  ">
                        <!-- Lesson Item -->
                        <div class="lesson-item" @click="goToLesson(lesson.id)">
                          <span class="lesson-title">Lesson #{{ lesson.position }} : {{ lesson.title }}</span>
                          <div class="chapter-actions">
                            <button class="action-btn edit-btn" @click.stop="editLesson(chapter.id, lesson.id)">
                              <FontAwesomeIcon :icon="faPen" />
                            </button>
                            <button class="action-btn delete-btn" @click.stop="deleteLesson(lesson.id)">
                              <FontAwesomeIcon :icon="faTrash" />
                            </button>
                          </div>
                        </div>

                        <!-- Quiz List -->
                        <div class="quiz-list" v-if="!isLoadingQuizzes">
                          <div class="quiz-header">
                            <h4>Quizzes</h4>
                            <button 
                              class="add-quiz-btn" 
                              @click.stop="addQuiz(lesson.id)"
                              v-if="!lesson.quizzes || lesson.quizzes.length === 0"
                            >
                              <FontAwesomeIcon :icon="faPlus" />
                              Add Quiz
                            </button>
                            <div class="chapter-actions" v-else>
                              <button class="action-btn edit-btn" @click.stop="editQuiz(lesson.quizzes[0].id, lesson.id)">
                                <FontAwesomeIcon :icon="faPen" />
                              </button>
                              <button class="action-btn delete-btn" @click.stop="deleteQuiz(lesson.quizzes[0].id, lesson.id)">
                                <FontAwesomeIcon :icon="faTrash" />
                              </button>
                            </div>
                          </div>
                        </div>
                        <div class="loading-placeholder" v-else>
                          <!-- Placeholder hoặc loading spinner -->
                        </div>

                      </div>
                    </div>
                    <div class="create-lesson-container">
                      <button class="create-lesson-btn" @click="createLesson(chapter.id)">
                        <FontAwesomeIcon :icon="faPlus" />
                        Create New Lesson
                      </button>
                    </div>
                  </div>
                  <hr class="chapter-divider" />
                </div>
              </div>
            </div>

            <!-- Create New Chapter Dialog -->
            <div v-if="showCreateForm" class="dialog-overlay">
              <div class="dialog-content">
                <h2>{{'Create New Chapter' }}</h2>
                <form @submit.prevent="submitChapter">
                  <div class="form-group">
                    <label class="label-chapter">Chapter Title:</label>
                    <input 
                      v-model="newChapter.title" 
                      type="text" 
                      required 
                      placeholder="Enter chapter title..."
                    />
                    <label class="label-chapter">Chapter Position:</label>
                    <input 
                      v-model="newChapter.position"
                      type="number" 
                      required 
                      placeholder= 0                    
                    />
                  </div>

                  <div class="form-actions">
                    <button type="button" class="cancel-btn" @click="cancelChapter">
                      Cancel
                    </button>
                    <button type="submit" class="submit-btn">
                      {{ editMode ? 'Update Chapter' : 'Create Chapter' }}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">

import { ref, onMounted } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faPlus, faBook, faGear, faPen, faTrash } from '@fortawesome/free-solid-svg-icons';
import { useRouter, useRoute } from 'vue-router';
import { toast } from 'vue3-toastify';
import BackButton from '../../components/BackButton.vue';
import { courseStore } from '../../store/courseStore';
import type { ICourse } from '../../types/course';
import type { IChapter, IChapterCreate } from '../../types/chapter';
import type { listLesson, ILesson } from '../../types/lesson';
import axios from 'axios';

interface MenuItem {
  id: string;
  icon: typeof faBook | typeof faGear;
  label: string;
}

const totalChapters = ref(0);
const nextChapterPosition = ref(0);
const menuItems: MenuItem[] = [
  { id: 'course', icon: faBook, label: 'Course' },
  { id: 'settings', icon: faGear, label: 'Settings' }
];
const chapterId = ref<number>(0);
const chapterPosition = ref<number>(0);
const editMode = ref(false);
const activeSection = ref<string>('course');
const setActiveSection = (section: string): void => {
  if (section === 'settings') {
    router.push('/setting-teacher');
  } else {
    activeSection.value = section;
  }
};

const router = useRouter();
const route = useRoute();

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

api.interceptors.response.use(
  response => response,
  error => {
    // Lọc lỗi 404 từ endpoint quizzes
    if (error.response && 
        error.response.status === 404 && 
        error.config.url.includes('/quizzes/lesson/')) {
      // Tạo một response giả để không báo lỗi
      console.log(`Không tìm thấy quiz cho endpoint: ${error.config.url}`);
      return Promise.resolve({ data: null });
    }
    return Promise.reject(error);
  }
);

const newLesson = ref<ILesson>({
  id: 0,
  title: '',
  description: '',
  position: 0,
  videoUrl: '',
  duration: 0,  
});
const newLessonsMap = ref<listLesson>();
const courseId = Number(route.params.courseId);


const chapters = ref<IChapter[]>([]);
const showCreateForm = ref(false);
const newChapter = ref<IChapterCreate>({ title: '', position: totalChapters.value + 1 });

const cancelChapter = () => {
  showCreateForm.value = false;
  newChapter.value = { title: '', position: totalChapters.value + 1 };
};

const submitChapter = async () => {
  try {
    // Check if we're in edit mode and the position matches the original
    const isSamePosition = editMode.value && chapterPosition.value == newChapter.value.position;

    // If not the same position, check for conflicts
    if (!isSamePosition) {
      if (chapters.value.some(chapter => 
        chapter.position === newChapter.value.position && 
        chapter.id !== chapterId.value // Exclude current chapter in edit mode
      )) {
        toast.error('A chapter with this position already exists!');
        return;
      }
    }

    if (editMode.value) {
      try {
        await api.patch(`/chapters/${chapterId.value}`, newChapter.value);
        toast.success('Chapter updated successfully!');
      } catch (error) {
        console.error('Error updating chapter:', error);
        toast.error('Failed to update chapter');
      }
    } else {
      try {
        await api.post(`/chapters/${courseId}`, newChapter.value);
        toast.success('Chapter created successfully!');
      } catch (error) {
        console.error('Error creating chapter:', error);
        toast.error('Failed to create chapter');
      }
    }
  } finally {
    showCreateForm.value = false;
    newChapter.value = { title: '', position: totalChapters.value + 1 };
    fetchChapters(Number(courseId));
  }
};



const createLesson = (chapterId: number) => {
  router.push(`/course-teacher/courses/${courseId}/${chapterId}/lessons`);
};
const editLesson = (chapterId: number,lessonId: number) => {
  router.push(`/course-teacher/courses/${courseId}/${chapterId}/${lessonId}`);
};
const deleteChapter = async (chapterId: number) => {
  const confirmDelete = window.confirm('Are you sure you want to delete this chapter?');
  if (confirmDelete) {
    try {
        await api.delete(`/chapters/${chapterId}`);
        toast.success('Chapter deleted successfully!');
      } catch (error) {
        console.error('Error deleting chapter:', error);
        toast.error('Failed to delete chapter');
      }finally {
    fetchChapters(Number(courseId));
  } 
  }
};
const editChapter = (chapter: IChapter) => {
  newChapter.value = {
    title: chapter.title,
    position: chapter.position,
  };
  chapterId.value = chapter.id;
  editMode.value = true;
  showCreateForm.value = true;
  chapterPosition.value = chapter.position;
};

const goToLesson = (lessonId: number) => {
  router.push(`/courses/learn/${courseId}?lessonId=${lessonId}`);
};

const deleteLesson = async (lessonId: number) => {
  const confirmDelete = window.confirm('Are you sure you want to delete this lesson?');
  if (confirmDelete) {
    try {
        await api.delete(`/lessons/${lessonId}`);
        toast.success('Lesson deleted successfully!');
      } catch (error) {
        console.error('Error deleting lesson:', error);
        toast.error('Failed to delete lesson');
      }finally {
    fetchChapters(Number(courseId));
  } 
  }
};

const fetchQuizForLesson = async (lessonId: number) => {
  try {
    console.log(`Đang tìm quiz cho lesson ${lessonId}...`);
    
    // Sử dụng try-catch nội bộ để xử lý lỗi 404 cụ thể
    try {
      const response = await api.get(`/quizzes/lesson/${lessonId}`);
      console.log(`Kết quả quiz cho lesson ${lessonId}:`, response.data);
      
      // Tìm chapter và lesson tương ứng để cập nhật
      for (const chapter of chapters.value) {
        if (!chapter.lessons) continue;
        
        const lesson = chapter.lessons.find(l => l.id === lessonId);
        if (lesson) {
          // Nếu API trả về dữ liệu, cập nhật lesson.quizzes
          if (response.data) {
            // Đảm bảo trường quizzes tồn tại
            if (!lesson.quizzes) {
              lesson.quizzes = [];
            }
            
            // Thêm quiz vào lesson nếu chưa tồn tại
            const quizExists = lesson.quizzes.some(q => q.id === response.data.id);
            if (!quizExists) {
              lesson.quizzes.push(response.data);
              console.log(`Đã thêm quiz ${response.data.id} vào lesson ${lessonId}`);
            }
          }
          break;
        }
      }
      return response.data;
    } catch (error) {
      // Bắt lỗi 404 và xử lý im lặng
      if (error.response && error.response.status === 404) {
        console.log(`Không tìm thấy quiz cho lesson ${lessonId}`);
        return null;
      }
      // Nếu không phải lỗi 404, ném lại lỗi để xử lý bên ngoài
      throw error;
    }
  } catch (error) {
    // Xử lý các lỗi khác (không phải 404)
    console.error(`Lỗi khi tìm quiz cho lesson ${lessonId}:`, error);
    return null;
  }
};

const fetchAllQuizzes = async () => {
  console.log('Tải quiz cho tất cả lessons...');
  for (const chapter of chapters.value) {
    if (!chapter.lessons) continue;
    
    for (const lesson of chapter.lessons) {
      await fetchQuizForLesson(lesson.id);
    }
  }
};

const addQuiz = (lessonId: number) => {
  // Tìm lesson có id tương ứng
  const lesson = chapters.value
    .flatMap((chapter) => chapter.lessons || [])
    .find((lesson) => lesson.id === lessonId);
  
  // Nếu lesson có quiz, chuyển đến trang edit quiz
  if (lesson && lesson.quizzes && lesson.quizzes.length > 0) {
    const quizId = lesson.quizzes[0].id;
    router.push(`/course-teacher/lessons/${lessonId}/quizzes/${quizId}/edit`);
  } else {
    // Nếu không, chuyển đến trang tạo quiz mới
    router.push(`/course-teacher/lessons/${lessonId}/quizzes/create`);
  }
};

const editQuiz = (quizId: number, lessonId: number) => {
  router.push(`/course-teacher/lessons/${lessonId}/quizzes/${quizId}/edit`);
};

const deleteQuiz = async (quizId: number, lessonId: number) => {
  const confirmDelete = window.confirm('Are you sure you want to delete this quiz?');
  if (confirmDelete) {
    try {
      await api.delete(`/quizzes/${quizId}`);
      toast.success('Quiz deleted successfully!');
      // Cập nhật danh sách quiz sau khi xóa
      const lesson = chapters.value
        .flatMap((chapter) => chapter.lessons)
        .find((lesson) => lesson.id === lessonId);
      if (lesson) {
        lesson.quizzes = lesson.quizzes.filter((quiz) => quiz.id !== quizId);
      }
    } catch (error) {
      console.error('Error deleting quiz:', error);
      toast.error('Failed to delete quiz');
    }
  }
};
const courseResponse = ref<ICourse>();
const fetchCourse = async (id: number) => {
  try {
    const { data } = await api.get(`/courses/${id}`);
    courseResponse.value = data;
    
  } catch (error) {
    console.error('Error fetching course:', error);
    toast.error('Failed to load course data');
  }
};
const isLoadingQuizzes = ref(true);
const fetchChapters = async (courseId: number) => {
  try {
    isLoadingQuizzes.value = true;
    const { data } = await api.get(`/chapters/course/${courseId}`);
    chapters.value = data;
    totalChapters.value = chapters.value.length;
    nextChapterPosition.value = chapters.value.length + 1;
    
    // Tải tất cả quizzes sau khi đã tải chapters
    await fetchAllQuizzes();
    
  } catch (error) {
    console.error('Error fetching chapters:', error);
    toast.error('Failed to load chapters');
  }finally{
    newChapter.value = { title: '', position: totalChapters.value + 1 };
    isLoadingQuizzes.value = false;
  }
};

const isLessonEmpty = ref(false);
const fetchLessons = async (chapterId: number) => {
  // Kiểm tra nếu chapter đã có lessons thì không tải lại
  const targetChapter = chapters.value.find(chapter => chapter.id === chapterId);
  if (targetChapter && targetChapter.lessons && targetChapter.lessons.length > 0) {
    console.log('Chapter đã có lessons, không tải lại');
    return;
  }
  
  try {
    console.log(`Đang tải lessons cho chapter ${chapterId}...`);
    const { data } = await api.get<listLesson>(`/lessons/chapter/${chapterId}`);
    if (data) {
      console.log('Dữ liệu lessons nhận được:', data);
      
      // Cập nhật lessons cho chapter tương ứng
      if (targetChapter) {
        // Đảm bảo mỗi lesson có danh sách quizzes ban đầu là rỗng
        targetChapter.lessons = data.map((lesson) => ({
          ...lesson,
          quizzes: [], // Bắt đầu với mảng rỗng, sẽ cập nhật sau
        }));
        
        // Tải quizzes cho mỗi lesson
        for (const lesson of targetChapter.lessons) {
          const quizData = await fetchQuizForLesson(lesson.id);
          if (quizData) {
            lesson.quizzes = [quizData]; // Thêm quiz vào lesson nếu tìm thấy
          }
        }
        
        console.log(`Đã cập nhật lessons và quizzes cho chapter ${chapterId}:`, targetChapter.lessons);
      }
      
      // Cập nhật newLessonsMap cho các mục đích khác
      newLessonsMap.value = targetChapter?.lessons || [];
      isLessonEmpty.value = newLessonsMap.value.length === 0;
    }
  }
  catch (error) {
    console.error('Error fetching lessons:', error);
    toast.error('Failed to load lessons');
    return false;
  }
};
onMounted(() => {
  if (courseId) {
    fetchCourse(Number(courseId));
    fetchChapters(Number(courseId));
  }
  
  // Thêm lắng nghe sự kiện router để tải lại dữ liệu khi quay lại
  router.beforeResolve((to, from, next) => {
    // Nếu quay lại từ trang tạo/sửa quiz
    if (from.path.includes('/quizzes') && to.path === router.currentRoute.value.path) {
      console.log('Quay lại từ trang quiz, tải lại dữ liệu...');
      fetchCourse(Number(courseId));
      fetchChapters(Number(courseId));
    }
    next();
  });
});

</script>

<style scoped>
.chapter-page {
  width: 100%;
  /* min-height: 120vh; */
  display: flex;
  flex-direction: column;
  align-items: center;
  /* padding: 20px; */
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

.main-content {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
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

.chapter-container {
  width: 100%;
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.chapter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
}

.add-chapter-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #6c9d8f;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
}

.add-chapter-btn:hover {
  background: #5a8a7d;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #666;
}


.chapter-info {
  width: 100%;
  justify-content: space-between;
  padding: 16px;
  border: 1px solid #e5e7eb;
  margin-bottom: 12px;
  height: 50px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
  cursor: pointer;
}

.chapter-info:hover {
  background-color: #f9fafb;
  border-color: #6c9d8f;
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.chapter-info h3 {
  font-size: 18px;
}

.chapter-info p {
  margin: 0;
  color: #666;
}

.chapter-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.3s;
}

.edit-btn {
  color: #6c9d8f;
}

.delete-btn {
  color: #dc2626;
}

.action-btn:hover {
  opacity: 0.8;
}

.create-form {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 16px;
}

.back-button:hover {
  background: #e5e7eb;
}

.chapter-container {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.chapter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.add-chapter-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #6c9d8f;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
}

.add-chapter-btn:hover {
  background: #5a8a7d;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #666;
}

.chapter-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 12px;
}

.chapter-info p {
  margin: 0;
  color: #666;
}

.chapter-actions {
  display: flex;
  gap: 8px;
}

.edit-btn, .delete-btn {
  padding: 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.edit-btn {
  background: #f3f4f6;
}

.delete-btn {
  background: #fee2e2;
  color: #dc2626;
}

.create-form {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 16px;
}

.form-group textarea {
  height: 120px;
  resize: vertical;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.cancel-btn,
.submit-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
}

.cancel-btn {
  background: #f3f4f6;
}

.submit-btn {
  background: #6c9d8f;
  color: white;
}

.submit-btn:hover {
  background: #5a8a7d;
}

.btn-drop-down {
  font-size: 30px
}
.label-chapter{
  padding-top: 8px;
}
.wrapper-list-item {
  border-radius: 20px;
  height: 60px;
  border:1px solid #e5e7eb;
  padding: 16px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  background-color: #f7f8f9;
}


.wrapper-list-item:hover {
  background-color: #e7e7e7;
}

.item-lesson {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

  /* .btn-delete{
    font-size: 26px;
  } */

.dialog-overlay {
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
}

.dialog-content {
  background: white;
  padding: 24px;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.dialog-content h2 {
  margin-bottom: 20px;
  color: #333;
}

.dialog-content .form-group {
  margin-bottom: 20px;
}

.dialog-content .form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.dialog-content .form-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
}

.dialog-content .form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.dialog-content .cancel-btn,
.dialog-content .submit-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
}

.dialog-content .cancel-btn {
  background: #f3f4f6;
}

.dialog-content .submit-btn {
  background: #6c9d8f;
  color: white;
}

.dialog-content .submit-btn:hover {
  background: #5a8a7d;
}

.create-lesson-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6c9d8f;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s ease;
  background: none;
  border: none;
  padding: 0;
  width: 100%;
}

.create-lesson-btn:hover {
  color: #5a8a7d;
  transform: translateY(-2px);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.create-lesson-container {
  margin: 12px 0;
  padding: 16px;
  /* border: 1px solid #e5e7eb; */
  border-radius: 12px;
  /* background-color: #f9fafb; */
  transition: all 0.3s ease;
  margin-left: 24px;
  height: 50px
}

.create-lesson-container:hover {
  background-color: #f3f4f6;
  border-color: #6c9d8f;
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.btn-drop-down .mdi-chevron-down {
  transition: transform 0.3s ease;
}

.btn-drop-down .rotated {
  transform: rotate(180deg);
}

.lessons-container {
  margin: 12px 0;
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background-color: #f9fafb;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.lesson-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  /* background-color: #f9fafb; */
  /* border: 1px solid #e5e7eb; */
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-left: 24px;
  height: 50px;
}

.lesson-item:hover {
  background-color: #f3f4f6;
  border-color: #6c9d8f;
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.lesson-title {
  font-size: 16px;
  font-weight: 600;
  color: #6c9d8f;
}

.quiz-list {
  margin-top: 12px; 
  padding: 16px;
  border-radius: 12px;
  margin-left: 48px; 
  transition: all 0.3s ease;
  height: 50px;
  position: relative;
  z-index: 5;
  display: flex;
  align-items: center;
}

.quiz-list:hover {
  background-color: #f3f4f6;
  border-color: #6c9d8f;
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.quiz-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 100%;
}

.quiz-header h4 {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.quiz-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.quiz-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.add-quiz-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #6c9d8f;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.add-quiz-btn:hover {
  background: #5a8a7d;
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.update-quiz-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #4a7a6d;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.update-quiz-btn:hover {
  background: #3a6a5d;
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.chapter-divider {
  border: none;
  border-top: 1px solid #e5e7eb;
  margin: 24px 0; 
  width: 100%;
}

</style>
  