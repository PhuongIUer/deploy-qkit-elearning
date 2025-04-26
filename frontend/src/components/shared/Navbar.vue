<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <nav :class="['navbar', { scrolled: isScrolled }]">
    <div class="navbar-container">
      <!-- Logo -->
      <div class="navbar-logo">
        <router-link to="/" class="logo-link">
          <img src="../../assets/logo.png" alt="Logo" class="logo-img" />
        </router-link>
      </div>

      <!-- Navigation Links -->
      <div class="navbar-center">
        <ul class="navbar-links">
          <li>
            <router-link to="/" class="navbar-item">Home</router-link>
          </li>
          <li>
            <router-link to="/courses" class="navbar-item">Course</router-link>
          </li>
          <li>
            <router-link to="/roadmap" class="navbar-item">Road Map</router-link>
          </li>
          <li>
            <router-link to="/order-checking" class="navbar-item">Order Checking</router-link>
          </li>
        </ul>
      </div>

      <!-- Auth Section -->
      <div class="navbar-auth">
        <template v-if="!isLoggedIn">
          <router-link to="/login" class="navbar-item">Login</router-link>
          <router-link to="/signup" class="navbar-item">Sign Up</router-link>
        </template>
        <div v-else class="user-profile">
          <!-- Shopping Cart Icon with Dropdown -->
          <div class="icon-container" ref="cartRef" @click="toggleCartDropdown">
            <FontAwesomeIcon :icon="faShoppingCart" class="nav-icon" />
            <span v-if="cartItemsCount > 0" class="cart-badge">{{ cartItemsCount }}</span>
            <!-- Cart Dropdown -->
            <div v-if="showCartDropdown" class="cart-dropdown">
              <div class="dropdown-header">
                <h4>Your Cart</h4>
              </div>
              <div class="dropdown-content">
                <div v-for="(item, index) in cartItems" :key="index" class="cart-item" @click="navigateToCourse(item.courseId)">
                  <img
                    :src="item.course.image"
                    alt="Course image"
                    class="cart-item-image"
                    @error="setDefaultCourseImage"
                  />
                  <div class="cart-item-details">
                    <p class="cart-item-title">{{ item.course.name }}</p>
                    <p class="cart-item-price">${{ item.course.price }}</p>
                  </div>
                  <button class="remove-item" @click.stop="removeItemFromCart(item.courseId)">
                    <FontAwesomeIcon :icon="faTimes" />
                  </button>
                </div>
                <div v-if="cartItems.length === 0" class="empty-cart">Your cart is empty</div>
              </div>
              <div class="dropdown-footer cart-footer" @click="navigateToCart">
                <div class="cart-total" v-if="cartItems.length > 0">
                  <span>Total:</span>
                  <span
                    >${{
                      computed(() => cartItems.reduce((sum, item) => sum + item.course.price, 0))
                    }}</span
                  >
                </div>
                <div style="padding-bottom: 15px;">
                  <span>View Cart</span>
                  <FontAwesomeIcon :icon="faChevronRight" />
                </div>
              </div>
            </div>
          </div>

          <!-- User Avatar and Dropdown -->
          <div class="avatar-container" ref="dropdownRef" @click="toggleDropdown">
            <div class="avatar-wrapper">
              <img :src="userAvatar" @error="setDefaultAvatar" alt="User Avatar" class="avatar" />
              <div class="username-container">
                <span class="username">{{ userName }}</span>
                <FontAwesomeIcon
                  :icon="faChevronDown"
                  class="dropdown-icon"
                  :class="{ rotate: showDropdown }"
                />
              </div>
            </div>
            <!-- Update the dropdown-menu section in your template -->
            <div v-if="showDropdown" class="dropdown-menu">
              <button v-if="!isTeacher" @click="handleProfileStudent" class="dropdown-item">
                <FontAwesomeIcon :icon="faUser" class="dropdown-icon-left" />
                <span class="profile-text">Profile</span>
              </button>
              <div v-if="isTeacher" class="divider"></div>
              <button v-if="isTeacher" @click="handleProfileTeacher" class="dropdown-item">
                <FontAwesomeIcon :icon="faUser" class="dropdown-icon-left" />
                <span class="profile-text">Profile</span>
              </button>
              <div class="divider"></div>

              <!-- Admin button (only shown if user is admin) -->
              <div v-if="isAdmin" class="divider"></div>
              <button v-if="isAdmin" @click="handleAdmin" class="dropdown-item">
                <FontAwesomeIcon :icon="faUserShield" class="dropdown-icon-left" />
                <span class="admin-text">Admin</span>
              </button>
              <div class="divider"></div>

              <button @click="handleLogout" class="dropdown-item">
                <FontAwesomeIcon :icon="faSignOutAlt" class="dropdown-icon-left" />
                <span class="logout-text">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
  faChevronDown,
  faShoppingCart,
  faChevronRight,
  faTimes,
  faUser,
  faUserShield,
  faSignOutAlt,
} from '@fortawesome/free-solid-svg-icons'
import defaultAvatar from '../../assets/ava.jpg'
import defaultCourseImage from '../../assets/course-img.png'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '../../store/auth'
import type { AxiosError } from 'axios'
import axios from 'axios'
import { toast } from 'vue3-toastify'
const navigateToCourse = (courseIdItem: number) => {
        router.push(`/courses/${courseIdItem}`)
    }
const cartItemsCount = ref(0); // Initialize with 0 or fetch from an API/store
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { isLoggedIn, userName, userAvatar, isAdmin, isTeacher } = storeToRefs(authStore)
const isScrolled = ref(false)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'
// Interfaces
interface Category {
  id: number
  name: string
  description: string
}

enum CourseLevel {
  Beginner = 'BEGINNER',
  Intermediate = 'INTERMEDIATE',
  Advanced = 'ADVANCED',
}

interface Course {
  id: number
  courseLevel: CourseLevel
  name: string
  price: number
  description: string
  totalLessons: number
  totalStudents: number
  image: string
  slug: string
  discountPrice: number | null
  discountPercentage: number | null
  discountTimeRemaining: string | null
  createdAt: string
  priceId: string
  deactivatedAt: string | null
  totalDuration: number | null
  category: Category
}

interface CartItem {
  courseId: number
  cartId: number
  course: Course
  selected: boolean
}
const handleApiError = (error: AxiosError, fallbackMessage: string, context?: string) => {
  console.error(`${context || 'API Error'}:`, error)

  let message = fallbackMessage

  if (error.response) {
    if (error.response.status === 401) {
      message = 'Please login to access your cart'
      router.push('/login')
    } else if (error.response.data?.message) {
      message = error.response.data.message
    }
  } else if (error.request) {
    message = 'Network error - please check your connection'
  }

  toast.error(message)
}
// Refs
const cartItems = ref<CartItem[]>([])
const selectAll = ref(false)
const isLoading = ref(true)

// Cart data
const totalAmount = computed(() => {
  return cartItems.value
    .filter((item) => item.selected)
    .reduce((sum, item) => {
      const price = item.course.discountPrice ?? item.course.price
      return sum + price
    }, 0)
})
const fetchCartItems = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/cart`, {
      headers: getAuthHeaders(),
      timeout: 10000, // 10 seconds timeout
    })

    if (response.status === 200) {
      cartItems.value = response.data.cartItems.map((item: any) => ({
        ...item,
        selected: false,
        course: {
          ...item.course,
          price: parseFloat(item.course.price),
          discountPrice: item.course.discountPrice ? parseFloat(item.course.discountPrice) : null,
        },
      }))
      selectAll.value = false
    }
  } catch (error) {
    handleApiError(error as AxiosError, 'Cart loading failed')
    handleApiError(error as AxiosError, 'Cart loading failed')
  } finally {
    isLoading.value = false
  }
}
const showConfirmationDialog = (title: string, message: string): Promise<boolean> => {
  return new Promise((resolve) => {
    // In a real app, you might use a proper modal dialog component
    const isConfirmed = confirm(`${title}\n\n${message}`)
    resolve(isConfirmed)
  })
}
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken')
  if (!token) {
    router.push('/login')
    throw new Error('No authentication token found')
  }

  return {
    Accept: 'application/json',
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
}
const removeItemFromCart = async (courseId: number) => {
  try {
    const isConfirmed = await showConfirmationDialog(
      'Remove Course',
      'Are you sure you want to remove this course from your cart?'
    )

    if (!isConfirmed) return

    isLoading.value = true
    const response = await axios.delete(`${API_BASE_URL}/cart`, {
      data: {
        courseId: courseId,
      },
      headers: getAuthHeaders(),
    })

    if (response.status === 200) {
      fetchCartItems()
      if (cartItems.value.length === 0) {
        selectAll.value = false
      }
    }
  } catch (error) {
    handleApiError(error as AxiosError, 'Failed to remove course from cart')
  } finally {
    isLoading.value = false
  }
}
const showCartDropdown = ref(false)
const cartRef = ref<HTMLElement | null>(null)

// User dropdown
const showDropdown = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

const handleScroll = () => {
  isScrolled.value = window.scrollY > 0
}

const toggleCartDropdown = () => {
  showCartDropdown.value = !showCartDropdown.value
  fetchCartItems()
  showDropdown.value = false
}

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
  // Close other dropdowns
  showCartDropdown.value = false
}

const handleClickOutside = (event: MouseEvent) => {
  if (cartRef.value && !cartRef.value.contains(event.target as Node)) {
    showCartDropdown.value = false
  }
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    showDropdown.value = false
  }
}

const navigateToCart = () => {
  showCartDropdown.value = false
  router.push('/cart')
}

const setDefaultAvatar = (e: Event) => {
  ;(e.target as HTMLImageElement).src = defaultAvatar
}

const setDefaultCourseImage = (e: Event) => {
  ;(e.target as HTMLImageElement).src = defaultCourseImage
}

const handleProfileStudent = () => {
  showDropdown.value = false
  router.push('/setting-student')
}
const handleProfileTeacher = () => {
  showDropdown.value = false
  router.push('/setting-teacher')
}

const handleAdmin = () => {
  showDropdown.value = false
  router.push('/admin')
}

const handleLogout = () => {
  authStore.logout()
  showDropdown.value = false
  router.push('/login')
}

onMounted(() => {
  authStore.fetchUserProfile()
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('scroll', handleScroll)
})

// Watch for route changes and refetch user data
watch(route, () => {
  authStore.fetchUserProfile()
})
</script>

<style scoped>
.navbar {
  position: sticky;
  top: 0;
  width: 100%;
  height: 70px;
  background-color: #ffeded;
  color: #374259;
  z-index: 1000;
}
.navbar.scrolled {
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}
.navbar-container {
  display: flex;
  align-items: center;
  justify-content: space-between; /* This pushes logo left and auth right */
  padding: 0 15px;
  max-width: 1200px;
  margin: 0 auto;
  height: 100%;
}

.navbar-logo {
  display: flex;
  align-items: center;
}

.logo {
  color: #374259;
  padding-left: 10px;
  font-size: 20px;
  font-weight: bold;
}

.logo-img {
  padding-top: 10px;
  width: 70px;
  height: auto;
}

.navbar-center {
  flex-grow: 1; /* This makes the center section grow to fill space */
  display: flex;
  justify-content: center; /* This centers the links horizontally */
  padding-left: 5%;
}

.navbar-links {
  list-style: none;
  display: flex;
  gap: 25px;
  margin: 0; /* Remove default margins */
  padding: 0; /* Remove default padding */
}

.navbar-item {
  text-decoration: none;
  color: #374259;
  font-size: 1rem;
  font-weight: 500;
  padding: 8px 15px;
  border-radius: 5px;
  transition: all 0.3s ease-in-out;
}

.navbar-item:hover {
  font-weight: bold;
}

.navbar-auth {
  display: flex;
  gap: 15px;
  align-items: center;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 20px;
}

.icon-container {
  position: relative;
  cursor: pointer;
  padding: 8px;
  transition: all 0.2s ease;
}

.icon-container:hover {
  transform: scale(1.1);
}

.nav-icon {
  color: #374259;
  font-size: 1.2rem;
}

.notification-badge,
.cart-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  background-color: #ff4757;
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cart-badge {
  background-color: #374259;
}

.avatar-container {
  position: relative;
  display: flex;
  align-items: center;
  padding: 4px 12px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.avatar-wrapper {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
}

.avatar {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #374259;
}

.username {
  color: #374259;
  font-size: 16px;
  font-weight: 600;
}

.username-container {
  display: flex;
  align-items: center;
  gap: 4px;
}

.dropdown-icon {
  width: 12px;
  height: 12px;
  color: #374259;
  transition: transform 0.3s ease;
}

.rotate {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  padding: 8px 0;
  width: 160px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-top: 8px;
  z-index: 1000;
  animation: slideDown 0.3s ease;
}

.dropdown-item {
  display: flex;
  align-items: center;
  width: 100%;
  border: none;
  background: none;
  color: #374259;
  font-size: 14px;
  text-align: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.dropdown-item:hover {
  background-color: #f5f5f5;
}
.dropdown-icon-left {
  width: 16px;
  height: 16px;
  margin-right: 10px;
  color: #374259;
}

.profile-text,
.admin-text,
.logout-text {
  flex-grow: 1;
}

/* Specific icon colors */
.dropdown-item .fa-user {
  color: #4e73df;
}

.dropdown-item .fa-user-shield {
  color: #dd3d3d;
}

.dropdown-item .fa-sign-out-alt {
  color: #6c757d;
}

/* Hover effects */
.dropdown-item:hover .dropdown-icon-left {
  transform: scale(1.1);
  transition: transform 0.2s ease;
}

.dropdown-item:hover .fa-user {
  color: #2e59d9;
}

.dropdown-item:hover .fa-user-shield {
  color: #c82333;
}

.dropdown-item:hover .fa-sign-out-alt {
  color: #5a6268;
}

.divider {
  height: 1px;
  background-color: #f0f0f0;
  margin: 4px 0;
}
.profile-text {
  color: #374259;
  margin-right: 8px;
}

/* Animation for dropdown */
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.navbar-links {
  gap: 10px;
}

.navbar-item {
  font-size: 0.9rem;
}

.avatar-container {
  padding: 4px;
}

.username {
  font-size: 14px;
  display: block;
}

.avatar {
  width: 32px;
  height: 32px;
}

.dropdown-menu {
  width: 120px;
}

.dropdown-item {
  padding: 10px 12px;
  font-size: 12px;
}

.user-profile {
  gap: 10px;
}

.nav-icon {
  font-size: 1rem;
}

.notification-badge,
.cart-badge {
  width: 16px;
  height: 16px;
  font-size: 9px;
}
/* Previous styles remain the same, add these new styles */

.icon-container {
  position: relative;
  cursor: pointer;
  padding: 8px;
  transition: all 0.2s ease;
}

.notification-dropdown,
.cart-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  width: 320px;
  max-height: 400px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.15);
  margin-top: 8px;
  z-index: 1001;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideDown 0.3s ease;
}

.dropdown-header {
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.dropdown-header h4 {
  margin: 0;
  font-size: 16px;
  color: #374259;
}

.dropdown-content {
  flex-grow: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.dropdown-footer {
  padding: 12px 16px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  background-color: #f9f9f9;
  transition: background-color 0.2s;
}

.dropdown-footer:hover {
  background-color: #f0f0f0;
}

.dropdown-footer svg {
  width: 12px;
  height: 12px;
  color: #888;
}

/* Cart dropdown styles */
.cart-item {
  display: flex;
  padding: 12px 16px;
  gap: 12px;
  align-items: center;
}
.cart-item:hover {
  background-color: rgb(203, 203, 203) ;
}
.cart-item-image {
  width: 50px;
  height: 50px;
  border-radius: 4px;
  object-fit: cover;
}

.cart-item-details {
  flex-grow: 1;
}

.cart-item-title {
  margin: 0;
  font-size: 14px;
  color: #333;
  line-height: 1.4;
}

.cart-item-price {
  margin: 4px 0 0;
  font-size: 14px;
  color: #374259;
  font-weight: 600;
}

.remove-item {
  background: none;
  border: none;
  color: #888;
  cursor: pointer;
  padding: 4px;
  transition: color 0.2s;
}

.remove-item:hover {
  color: #ff4757;
}

.remove-item svg {
  width: 14px;
  height: 14px;
}

.empty-cart {
  padding: 20px;
  text-align: center;
  color: #888;
  font-size: 14px;
}

.cart-footer {
  flex-direction: column;
  gap: 8px;
}

.cart-total {
  width: 100%;
  display: flex;
  justify-content: space-between;
  font-weight: 600;
  color: #374259;
}

/* Responsive styles */
@media (max-width: 768px) {
  .cart-dropdown {
    width: 280px;
    right: -20px;
  }

  .user-profile {
    gap: 10px;
  }
}
</style>