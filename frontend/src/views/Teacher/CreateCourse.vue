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
      <section v-if="activeSection === 'course'">
        <div class="course-form-wrapper">
          <BackButton />
          <form class="course-form" @submit.prevent="submitForm">
            <div class="form-left">
              <label class="form-label">Course Name</label>
              <input type="text" class="form-input" placeholder="Enter your course name" v-model="form.name" />
              
              <label class="form-label">Course Description</label>
              <TiptapEditor
                type="text"
                class="form-input"
                placeholder="Enter your course description"
                v-model="form.description"
              />
              <!-- <div class="course-description"></div> -->

              <label class="form-label">Level</label>
              <div class="custom-select-wrapper" :class="{ open: isLevelOpen }">
                <select class="form-input custom-select"
                        v-model="form.courseLevel"
                        @focus="isLevelOpen = true"
                        @blur="isLevelOpen = false">
                  <option disabled value="">Select Level</option>
                  <option value="BEGINNER">Beginner</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="ADVANCED">Advanced</option>
                </select>
                <font-awesome-icon :icon="faChevronDown" class="dropdown-icon" />
              </div>

              <label class="form-label">Category</label>
              <div class="custom-select-wrapper" :class="{ open: isCategoryOpen }">
                <select class="form-input custom-select"
                        v-model="form.categoryId"
                        @focus="isCategoryOpen = true"
                        @blur="isCategoryOpen = false">
                  <option disabled value="">Select Category</option>
                  <option v-for="category in categories" :key="category.id" :value="category.id">
                    {{ category.name }}
                  </option>
                </select>
                <font-awesome-icon :icon="faChevronDown" class="dropdown-icon" />
              </div>
              <label class="form-label">Features</label>
                <div class="features-list">
                  <div v-for="(feature, index) in form.features" :key="index" class="feature-item">
                    <input 
                      type="text" 
                      class="form-input feature-input" 
                      v-model="form.features[index]" 
                      :placeholder="'Enter feature ' + (index + 1)"
                    />
                    <button 
                      v-if="form.features.length > 1" 
                      type="button" 
                      class="delete-feature-btn" 
                      @click="removeFeature(index)"
                    >
                      -
                    </button>
                  </div>
                </div>
                <button 
                  type="button" 
                  class="add-feature-btn" 
                  @click="addFeature"
                >
                  + Add Feature
                </button>
            </div>

            <div class="form-right">
              <div class="thumbnail-container">
                <div class="thumbnail-box">
                  <img 
                    v-if="thumbnailUrl"
                    :src="thumbnailUrl || undefined"
                    alt="Course Thumbnail"
                    class="thumbnail-preview-img"
                    @error="handleImageError"
                  />
                  <div v-else class="thumbnail-placeholder">
                    No image selected
                  </div>
                </div>

                <div class="thumbnail-upload">
                  <label for="thumbnail-upload" class="upload-btn">
                    <font-awesome-icon :icon="faUpload" />
                    Upload Thumbnail
                  </label>
                  <input 
                    type="file"
                    id="thumbnail-upload"
                    class="file-input"
                    accept="image/*"
                    @change="handleFileUpload"
                  />
                </div>

                <p class="upload-hint">Allowed formats: JPG, PNG</p>
              </div>
              <label class="form-label">Price</label>
              <input type="number" class="form-input"  v-model="form.price" />

              <label class="form-label">Discount Percentage</label>
              <input 
                type="number" 
                class="form-input" 
                v-model="form.discountPercentage"
                min="0"
                max="100"
              />
            
              <label class="form-label">Discount End Date</label>
              <input 
                type="datetime-local" 
                class="form-input" 
                v-model="form.discountTimeRemaining"
              />
            </div>
          </form>
          <button class="create-button" @click="handleSubmit">
            <span v-if="!isLoading">{{editingCourseId?"Update":"Submit"}}</span>
              <span v-else>
                Loading<span v-for="n in loadingDots" :key="n">.</span>
              </span>
          </button>
          
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faBook, faGear, faUpload, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { useRouter, useRoute } from 'vue-router';
import BackButton from '../../components/BackButton.vue';
import { toast } from 'vue3-toastify';
import TiptapEditor from '../../components/TiptapEditor.vue';

const route = useRoute();
const router = useRouter();
const isLevelOpen = ref(false);
const isCategoryOpen = ref(false);
const editingCourseId = ref<string | null>(route.params.id as string || null);
const featuresInput = ref('');
const categories = ref<Category[]>([]);
const isLoading = ref(false);
const loadingDots = ref(0);
let loadingInterval = null;
interface MenuItem {
  id: string;
  icon: typeof faBook | typeof faGear;
  label: string;
}
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
const menuItems: MenuItem[] = [
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

enum CourseLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED'
}

interface Category {
  id: number
  name: string
}

interface Course {
  id: number
  name: string
  price: number
  description: string
  courseLevel: CourseLevel
  totalDuration: number
  discountPrice: number
  discountTimeRemaining: string
  discountPercentage: number
  image: string
  categoryId: number
  features: string[]
}

const form = ref<Partial<Course>>({
  name: '',
  price: 0,
  description: '', // Initialize description as an empty string
  categoryId: 0,
  courseLevel: CourseLevel.BEGINNER,
  totalDuration: 0,
  image: '',
  discountPrice: 0,
  discountPercentage: 0,
  discountTimeRemaining: '2000-01-01T05:00:00',
  features: [] // Ensure features is always initialized as an array
});

if (!form.value.features) {
  form.value.features = []; // Safeguard to ensure features is always an array
}

const thumbnailUrl = ref<string | null>(null);
const imageFile = ref<File | null>(null);

// const updateFeatures = () => {
//   form.value.features = featuresInput.value
//     .split(',')
//     .map(f => f.trim())
//     .filter(f => f.length > 0);
// };

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    imageFile.value = file;
    form.value.image = file.name;
    form.value.image = file.name;

    const reader = new FileReader();
    reader.onload = () => {
      thumbnailUrl.value = reader.result as string;
    };
    reader.readAsDataURL(file);
  }
};

const handleImageError = () => {
  thumbnailUrl.value = null;
};

const submitForm = () => {
  console.log("Form data:", form.value);
};

const fetchCategories = async () => {
  try {
    const response = await api.get('/categories');
    categories.value = response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    toast.error('Failed to load categories');
  }
};

const fetchCourse = async (id: number) => {
  try {
    const response = await api.get(`/courses/${id}`);
    const course = response.data;
    
    form.value = {
      ...course,
      categoryId: course.category?.id || 0
    };
    
    if (course.features) {
      featuresInput.value = course.features.join(', ');
    }
    
    if (course.image) {
      thumbnailUrl.value = course.image;
    }
    
  } catch (error) {
    console.error('Error fetching course:', error);
    toast.error('Failed to load course data');
  }
};

const handleSubmit = async () => {
  const token = localStorage.getItem('authToken');
  isLoading.value = true;
  loadingDots.value = 1;
  loadingInterval = setInterval(() => {
    loadingDots.value = (loadingDots.value % 3) + 1;
  }, 300);
  if (!token) {
    toast.error('You must be logged in!');
    return;
  }

  if (
    !form.value.name ||
    !form.value.price ||
    !form.value.description ||
    !form.value.categoryId ||
    !form.value.courseLevel 
    
  ) {
    console.log('Form data:', form.value);
    toast.error('Please fill in all required fields!');
    return;
  }

  try {
    const formData = new FormData();
    
    // Append all form fields to FormData
    formData.append('name', form.value.name);
    formData.append('price', String(form.value.price));
    formData.append('description', form.value.description);
    formData.append('courseLevel', form.value.courseLevel);
    formData.append('categoryId', String(form.value.categoryId));
    
    const discountPrice = computedDiscountPrice.value;
    formData.append('discountPrice', String(discountPrice));
    
    if (form.value.discountPercentage) {
      formData.append('discountPercentage', String(form.value.discountPercentage));
    }
    
    if (form.value.discountTimeRemaining) {
      formData.append('discountTimeRemaining', form.value.discountTimeRemaining);
    }
    
    if (form.value.features && form.value.features.length > 0) {
      formData.append('features', form.value.features.join(','));
    }
    
    if (imageFile.value) {
      formData.append('image', imageFile.value);
    }

    await api.post('/courses', formData);
    toast.success('Course created successfully!');
    
    setTimeout(() => {
      router.push('/course-teacher');
    }, 1500);
  } catch (error) {
    console.error('Error saving course:', error);
    toast.error('Failed to save course');
  }finally {
    clearInterval(loadingInterval);
    isLoading.value = false;
  }
};
watch(
  () => form.value.discountPercentage,
  (newPercentage) => {
    if (newPercentage && form.value.price) {
      const discount = (form.value.price * newPercentage) / 100;
      form.value.discountPrice = Math.max(0, form.value.price - discount); 
    } else {
      form.value.discountPrice = 0; 
    }
  }
);

const computedDiscountPrice = computed(() => {
  if (form.value.price && form.value.discountPercentage) {
    const discount = (form.value.price * form.value.discountPercentage) / 100;  
    return Math.max(0, form.value.price - discount); 
  }
  return form.value.price || 0; 
});

watch(
  () => form.value.price,
  (newPrice) => {
    if (newPrice && form.value.discountPercentage) {
      const discount = (newPrice * form.value.discountPercentage) / 100;
      form.value.discountPrice = Math.max(0, newPrice - discount); 
    } else {
      form.value.discountPrice = 0; 
    }
  }
);

const addFeature = () => {
  if (!form.value.features) {
    form.value.features = []; 
  }
  form.value.features.push(''); 
};

const removeFeature = (index: number) => {
  if (form.value.features && form.value.features.length > 1) {
    form.value.features.splice(index, 1); 
  }
};

onMounted(() => {
  fetchCategories();
  
  if (editingCourseId.value) {
    fetchCourse(Number(editingCourseId.value));
  }
  if (!form.value.features || form.value.features.length === 0) {
    form.value.features = ['']; 
  }
});
</script>
  
  <style scoped>
  .course-page {
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
    margin-bottom: 40px;
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
  
  .course-form-wrapper {
  display: flex;
  flex-direction: column;
  gap: 20px;
  background-color: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  margin-left: 40px;
  width: 900px;
}

.course-form {
  display: flex;
  gap: 30px;
  width: 100%;
}

.form-left {
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.form-label {
  font-weight: 600;
  margin-bottom: 5px;
}

.form-input {
  padding: 10px 14px;
  border: 1px solid #6c9d8f;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
}

.form-right{
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  /* width: 20%; */
}

.thumbnail-container {
  width: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.thumbnail-box {
  width: 100%;
  height: 200px;
  border: 1px solid #ccc;
  border-radius: 10px;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.thumbnail-preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumbnail-placeholder {
  font-size: 14px;
  color: #aaa;
}

.thumbnail-upload {
  width: 100%;
  margin-top: 10px;
}

.upload-btn {
  display: block;
  width: 100%;
  background-color: #6c9d8f;
  color: white;
  padding: 8px 12px;
  border-radius: 8px;
  text-align: center;
  cursor: pointer;
}

.file-input {
  display: none;
}

.upload-hint {
  margin-top: 8px;
  font-size: 12px;
  color: #888;
}
.discount-field {
  display: flex;
  align-items: center;
  gap: 8px; /* Adjust this value for spacing between label and input */
}
.create-button {
  align-self: flex-end;
  background-color: #6c9d8f;
  color: white;
  padding: 10px 24px;
  border-radius: 8px;
  font-weight: bold;
  font-size: 16px;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s;
}

.create-button:hover {
  background-color: #548b7c;
}
  
.custom-select-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.custom-select {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  padding-right: 36px;
  background-color: white;
  width: 100%;;
}

.dropdown-icon {
  position: absolute;
  right: 14px;
  pointer-events: none;
  transition: transform 0.3s ease;
  color: #6c9d8f;
}

.custom-select-wrapper.open .dropdown-icon {
  transform: rotate(180deg);
}

.back-button-container {
  margin-bottom: 20px;
  align-self: flex-start;
}

.back-button {
  display: flex;
  align-items: center;
  background-color: transparent;
  color: #6c9d8f;
  font-weight: 600;
  font-size: 14px;
  border: none;
  cursor: pointer;
  transition: color 0.3s ease;
}

.back-button:hover {
  color: #548b7c;
}

.back-button .mr-2 {
  margin-right: 8px;
}

/* feature */
.features-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.feature-input {
  flex: 1; /* Input sẽ chiếm toàn bộ không gian còn lại */
  padding: 10px 14px;
  border: 1px solid #6c9d8f;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: width 0.3s ease;
}

.add-feature-btn {
  margin-top: 10px;
  padding: 8px 12px;
  background-color: #6c9d8f;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  align-self: flex-start;
}

.add-feature-btn:hover {
  background-color: #548b7c;
}

.delete-feature-btn {
  padding: 6px 10px;
  background-color: #ff6b6b;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.delete-feature-btn:hover {
  background-color: #e55a5a;
}

.feature-item:not(:has(.delete-feature-btn)) .feature-input {
  width: 100%; /* Khi không có nút Remove, input chiếm toàn bộ chiều rộng */
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
  