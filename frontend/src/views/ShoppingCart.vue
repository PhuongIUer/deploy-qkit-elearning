<template>
  <div class="shopping-page">
    <div class="shopping-content">
      <!-- Loading State -->
      <div v-if="isLoading" class="loading-overlay">
        <div class="loading-spinner"></div>
      </div>

      <!-- Header with Select All -->
      <div class="checkout-header">
        <h2>{{ cartItems.length }} {{ cartItems.length === 1 ? 'Course' : 'Courses' }} in cart</h2>
      </div>

      <!-- Empty Cart State -->
      <div v-if="cartItems.length === 0 && !isLoading" class="empty-cart">
        <img src="../assets/empty-cart.svg" alt="Empty cart" class="empty-cart-image">
        <h2>Your cart is empty</h2>
        <p>Browse our courses to find something you'd like to learn!</p>
        <button class="browse-courses-btn" @click="navigateToCourses">
          Browse Courses
        </button>
      </div>

      <!-- Cart With Items -->
      <template v-else>
        <div 
          v-for="item in cartItems" 
          :key="item.cartId"
          class="course-container"
          :class="{ 'course-selected': item.selected }"
        >
          <div class="course-content">
            <CourseShopping
              :course-id="item.courseId"
              :course-data="item.course"
            />
          </div>
          <button 
            class="delete-btn" 
            @click="removeItemFromCart(item.courseId)"
            aria-label="Remove course from cart"
          >
            <FontAwesomeIcon :icon="faTrash" />
          </button>
        </div>

        <!-- Summary Section -->
        <div class="summary-section">
          <div class="selected-count">
            {{ selectedCount }} {{ selectedCount === 1 ? 'Course' : 'Courses' }} Selected
          </div>
          
          <div class="payment">
            <div class="total-section">
              <h2>Total:</h2>
              <div class="price-display">
                <span 
                  v-if="hasDiscounts"
                  class="original-price"
                >
                  ${{ originalTotal.toFixed(2) }}
                </span>
                <span class="total-amount">
                  ${{ totalAmount.toFixed(2) }}
                </span>
              </div>
            </div>
            <button
              class="payment-btn"
              @click="proceedToCheckout"
              :disabled="!hasSelectedItems || isProcessingPayment"
            >
              <span v-if="!isProcessingPayment">Proceed to Checkout</span>
              <span v-else class="processing-text">
                <FontAwesomeIcon :icon="faSpinner" spin /> Processing...
              </span>
            </button>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { toast } from 'vue3-toastify';
import { useRouter } from 'vue-router';
import CourseShopping from '../components/CourseShopping.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faTrash, faSpinner } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import type { AxiosError } from 'axios';

const CART_POLLING_INTERVAL = 30000; // 30 seconds
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
// Interfaces
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

export interface Course {
  id: number
  courseLevel: string
  name: string
  price: string
  description: string
  totalLessons: number
  totalChapters: number
  totalStudents: number
  image: string
  slug: string
  discountPrice: string
  discountPercentage: number
  discountTimeRemaining: string
  createdAt: string
  priceId: string
  deactivatedAt: string
  totalDuration: number
  teachings: Teaching[]
  category: Category
}

export interface Teaching {
  id: number
  userId: number
  courseId: number
  createdAt: string
  user: User
}

export interface User {
  id: number
  email: string
  password: string
  userName: string
  avatar: string
  isVerified: boolean
  isBlocked: boolean
}


interface CartItem {
  courseId: number;
  cartId: number;
  course: Course;
  selected: boolean;
}

// Composables
const router = useRouter();

// Refs
const cartItems = ref<CartItem[]>([]);
const selectAll = ref(true);
const isLoading = ref(true);
const isProcessingPayment = ref(false);
let cartPollingInterval: number | null = null;

// Computed Properties
const totalAmount = computed(() => {
  return cartItems.value
    .filter(item => item)
    .reduce((sum, item) => {
      const price = item.course.discountPrice ?? item.course.price;
      return sum + price;
    }, 0);
});

const originalTotal = computed(() => {
  return cartItems.value
    .filter(item => item.selected)
    .reduce((sum, item) => sum + item.course.price, 0);
});

const selectedCount = computed(() => {
  return cartItems.value.filter(item => item.selected).length;
});

const hasSelectedItems = computed(() => {
  return selectedCount.value > 0;
});

const hasDiscounts = computed(() => {
  return cartItems.value.some(item => 
    item.selected && item.course.discountPrice !== null
  );
});

// Methods
const fetchCartItems = async () => {
  try {
    const response = await api.get(`/cart`, {
      headers: getAuthHeaders(),
      timeout: 10000 // 10 seconds timeout
    });

    if (response.status === 200) {
      cartItems.value = response.data.cartItems.map((item: any) => ({
        ...item,
        selected: true,
        course: {
          ...item.course,
          price: parseFloat(item.course.price),
          discountPrice: item.course.discountPrice ? parseFloat(item.course.discountPrice) : null
        }
      }));
      selectAll.value = true;
    }
  } catch (error) {
    handleApiError(error as AxiosError, 'Your cart is empty');
  } finally {
    isLoading.value = false;
  }
};

const toggleSelectAll = () => {
  cartItems.value.forEach(item => {
    item.selected = selectAll.value;
  });
};


const removeItemFromCart = async (courseId: number) => {
  try {
    const isConfirmed = await showConfirmationDialog(
      'Remove Course',
      'Are you sure you want to remove this course from your cart?'
    );
    
    if (!isConfirmed) return;

    isLoading.value = true;
    const response = await api.delete(`/cart`, {
      data: { 
        courseId: courseId 
      },
      headers: getAuthHeaders()
    });

    if (response.status === 200) {
      fetchCartItems();
      if (cartItems.value.length === 0) {
        selectAll.value = false;
      }
    }
  } catch (error) {
    handleApiError(error as AxiosError, 'Failed to remove course from cart');
  } finally {
    isLoading.value = false;
  }
};
interface Responsive {
  url: string
}
const proceedToCheckout = async () => {
  if (!hasSelectedItems.value) {
    toast.warning('Please select at least one course');
    return;
  }

  try {
    isProcessingPayment.value = true;
    
    // Get all selected course IDs
    const selectedCourseIds = cartItems.value
      .filter(item => item.selected)
      .map(item => item.courseId);

    // Delete each selected course from the cart one by one
    

    // Proceed to checkout with the selected courses
    const response = await api.post<Responsive>(
      `/cart/checkout`,
      { courseIds: selectedCourseIds },
      { headers: getAuthHeaders() }
    );
    for (const courseId of selectedCourseIds) {
      await api.delete(`/cart`, {
        data: { courseId },
        headers: getAuthHeaders()
      });
    }
    if (response.data.url) {
      window.location.href = response.data.url;
    } else {
      throw new Error('No redirect URL received');
    }
  } catch (error) {
    handleApiError(
      error as AxiosError,
      'Payment failed. Please try again.',
      'Checkout error'
    );
  } finally {
    isProcessingPayment.value = false;
  }
};

const navigateToCourses = () => {
  router.push('/courses');
};

const startCartPolling = () => {
  if (cartPollingInterval) {
    clearInterval(cartPollingInterval);
  }
  
  cartPollingInterval = setInterval(() => {
    fetchCartItems();
  }, CART_POLLING_INTERVAL) as unknown as number;
};

const showConfirmationDialog = (title: string, message: string): Promise<boolean> => {
  return new Promise((resolve) => {
    // In a real app, you might use a proper modal dialog component
    const isConfirmed = confirm(`${title}\n\n${message}`);
    resolve(isConfirmed);
  });
};

const handleApiError = (error: AxiosError, fallbackMessage: string, context?: string) => {
  console.error(`${context || 'API Error'}:`, error);
  
  let message = fallbackMessage;
  
  if (error.response) {
    if (error.response.status === 401) {
      message = 'Please login to access your cart';
      router.push('/login');
    } else if (error.response.data?.message) {
      message = error.response.data.message;
    }
  } else if (error.request) {
    message = 'Network error - please check your connection';
  }
  
  toast.error(message);
};

// Helper functions
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    router.push('/login');
    throw new Error('No authentication token found');
  }
  
  return {
    'Accept': 'application/json',
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

// Lifecycle hooks
onMounted(() => {
  fetchCartItems();
  startCartPolling();
});

// Cleanup on unmount
onUnmounted(() => {
  if (cartPollingInterval) {
    clearInterval(cartPollingInterval);
  }
});
</script>

<style scoped>
.shopping-page {
  display: flex;
  justify-content: center;
  min-height: 100vh;
  width: 100%;
  padding: 20px;
  background-color: #f8fafc;
}

.shopping-content {
  width: 100%;
  max-width: 1200px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  padding: 24px;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
  border-radius: 12px;
}

.loading-spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #6c9d8f;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.checkout-header {
  display: flex;
  align-items: center;
  padding: 16px 24px;
  margin-bottom: 20px;
  background-color: #f8fafc;
  border-radius: 12px;
  gap: 16px;
  border: 1px solid #e2e8f0;
}

.checkout-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.clear-selection-btn {
  margin-left: auto;
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  font-size: 0.875rem;
  transition: color 0.2s;
}

.clear-selection-btn:hover {
  color: #6c9d8f;
  text-decoration: underline;
}

.empty-cart {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background-color: #f8fafc;
  border-radius: 12px;
  text-align: center;
  margin: 20px 0;
  min-height: 300px;
  border: 1px dashed #cbd5e1;
}

.empty-cart-image {
  width: 150px;
  height: 150px;
  margin-bottom: 24px;
  opacity: 0.8;
}

.empty-cart h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
}

.empty-cart p {
  font-size: 1rem;
  color: #64748b;
  margin-bottom: 24px;
  max-width: 400px;
}

.browse-courses-btn {
  background-color: #6c9d8f;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.browse-courses-btn:hover {
  background-color: #5a8b7d;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.course-checkbox {
  width: 20px;
  height: 20px;
  cursor: pointer;
  margin: 0;
  flex-shrink: 0;
  -webkit-appearance: none;
  appearance: none;
  background-color: white;
  border: 2px solid #cbd5e1;
  border-radius: 4px;
  position: relative;
  transition: all 0.2s;
}

.course-checkbox:checked {
  background-color: #6c9d8f;
  border-color: #6c9d8f;
}

.course-checkbox:checked::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 12px;
}

.course-checkbox:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.course-container {
  display: flex;
  gap: 20px;
  background-color: white;
  border-radius: 12px;
  padding: 20px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s;
}

.course-container:hover {
  border-color: #cbd5e1;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.course-selected {
  background-color: #f0f9f6;
  border-color: #6c9d8f;
}

.course-content {
  flex-grow: 1;
}

.delete-btn {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 8px;
  transition: all 0.2s;
  font-size: 1rem;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.delete-btn:hover {
  color: #ef4444;
  background-color: #fee2e2;
}

.summary-section {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e2e8f0;
}

.selected-count {
  font-size: 0.875rem;
  color: #64748b;
  margin-bottom: 16px;
  text-align: right;
}

.payment {
  display: flex;
  background-color: #f8fafc;
  align-items: center;
  padding: 20px;
  border-radius: 12px;
  justify-content: space-between;
  border: 1px solid #e2e8f0;
}

.total-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.total-section h2 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.price-display {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.original-price {
  font-size: 0.875rem;
  color: #64748b;
  text-decoration: line-through;
}

.total-amount {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
}

.payment-btn {
  border: none;
  border-radius: 8px;
  background-color: #6c9d8f;
  font-size: 1rem;
  padding: 12px 24px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 180px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
}

.payment-btn:hover:not(:disabled) {
  background-color: #5a8b7d;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.payment-btn:disabled {
  background-color: #cbd5e1;
  cursor: not-allowed;
  opacity: 0.7;
}

.processing-text {
  display: flex;
  align-items: center;
  gap: 8px;
}

@media (max-width: 768px) {
  .shopping-content {
    padding: 16px;
  }
  
  .course-container {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    padding: 16px;
  }
  
  .payment {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .total-section {
    justify-content: space-between;
    width: 100%;
  }
  
  .payment-btn {
    width: 100%;
  }
}
</style>