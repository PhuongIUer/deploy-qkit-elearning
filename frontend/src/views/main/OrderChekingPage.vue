<template>
    <div class="order-tracker">
      <div class="order-container">
        <!-- Header -->
        <div class="header">
          <FontAwesomeIcon icon="box" class="icon"/>
          <h1>Order Lookup</h1>
          <p>Enter your order ID to track your package</p>
        </div>
  
        <!-- Search Input -->
        <div class="search-input">
          <input
            v-model="ssId"
            type="text"
            placeholder="e.g. cs_test_abcdef"
            @keyup.enter="checkOrder"
          >
        </div>
  
        <!-- Search Button -->
        <button
          @click="checkOrder(ssId)"
          :disabled="loading || !ssId.trim()"
          class="search-button"
        >
          <span v-if="!loading">Find My Order</span>
          <span v-else class="loading">
            <FontAwesomeIcon icon="spinner" spin/>
            <span>Searching...</span>
          </span>
        </button>
  
        <!-- Error Message -->
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
  
        <!-- Order Details -->
        <div v-if="items" class="order-details">
          <h3>Order #{{ apiData?.id }} Found </h3>
          <div class="order-container">
  <div v-for="(item, index) in items" :key="index" class="order-item" @click="navigateToCourse(item.id)">
    <img
      :src="item.image"
      alt="Course image"
      class="order-item-image"
      @error="setDefaultCourseImage"
    />
    <div class="order-item-details">  
      <p class="order-item-title">Name: {{ item.name }}</p>
      <p class="order-item-price">Price: {{ item.price }}$</p>
      <p class="order-item-status" :data-status="apiData?.status">Status: {{ apiData?.status }}</p>
      <p class="order-item-day">Date order: {{ new Date(apiData?.createdAt|| "").toLocaleDateString() }}</p>
    </div>
  </div>
  <div v-if="items.length === 0" class="empty-order">Your order is empty</div>
</div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
import { ref, computed } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faBox, faSpinner } from '@fortawesome/free-solid-svg-icons';
import defaultCourseImage from '../../assets/course-img.png';
import axios from 'axios';
import type {orderRespone, MCourse} from '../../types/order'
import { useRouter } from 'vue-router'
library.add(faBox, faSpinner);
const router = useRouter()
interface OrderDetails {
  id: string;
  status: string;
  total: number;
}
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
const navigateToCourse = (courseIdItem: number) => {
    router.push(`/courses/${courseIdItem}`)
}
const ssId = ref('')
const orderDetails = ref<OrderDetails | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

const setDefaultCourseImage = (e: Event) => {
  (e.target as HTMLImageElement).src = defaultCourseImage;
};

const statusClass = computed(() => {
  if (!orderDetails.value) return '';
  return {
    'Completed': 'status-completed',
    'Processing': 'status-processing',
    'Shipped': 'status-shipped',
    'Cancelled': 'status-cancelled'
  }[orderDetails.value.status] || '';
});
const apiData = ref<orderRespone>()
const totalItems = ref(0)
const items = ref<MCourse[]>()
const checkOrder = async (ssId : string): Promise<void> => {
  try {
        loading.value = true;
        error.value = null;
        const response = await api.get<orderRespone>(
          `/orders/session/${ssId}`
        );
        apiData.value = response.data;
        totalItems.value = response.data.courses.length
        items.value = response.data.courses
      } catch (err) {
        error.value = axios.isAxiosError(err) 
          ? err.response?.data?.message || err.message 
          : 'Unknown error occurred';
        console.error('Error fetching users:', err);
      } finally {
        loading.value = false;
      }

};

</script>
  
<style scoped>
/* Base Styles */
.order-tracker {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  max-width: 800px;
  margin: 2rem auto;
  padding: 0 1rem;
}


/* Header Styles */
.header {
  text-align: center;
  margin-bottom: 2rem;
}

.header .icon {
  font-size: 2.5rem;
  color: #4f46e5;
  margin-bottom: 1rem;
}

.header h1 {
  font-size: 1.8rem;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.header p {
  color: #6b7280;
  margin: 0;
}

/* Search Section */
.search-input {
  margin: 1.5rem 0;
}

.search-input input {
  width: 100%;
  padding: 0.8rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.search-input input:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2);
}

/* Button Styles */
.search-button {
  width: 100%;
  padding: 0.8rem;
  background-color: #4f46e5;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.search-button:hover:not(:disabled) {
  background-color: #4338ca;
}

.search-button:disabled {
  background-color: #a5b4fc;
  cursor: not-allowed;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

/* Error Message */
.error-message {
  margin-top: 1rem;
  padding: 0.8rem;
  background-color: #fee2e2;
  color: #dc2626;
  border-radius: 8px;
  text-align: center;
}

/* Order Details */
.order-details {
  margin-top: 2rem;
  animation: fadeIn 0.3s ease-out;
}

.order-details h3 {
  color: #1f2937;
  margin-bottom: 1rem;
  font-size: 1.3rem;
}

.order-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
  border: 1px solid #e5e7eb;
}

.order-item:hover {
  background-color: #f9fafb;
}

.order-item-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
}

.order-item-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.order-item-title {
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.order-item-price {
  color: #10b981;
  font-weight: 600;
  margin: 0.3rem 0;
}

.order-item-status {
  display: inline-block;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
  background-color: #e0f2fe;
  color: #0369a1;
  margin: 0;
}

.order-item-day {
  color: #6b7280;
  font-size: 0.8rem;
  margin: 0.3rem 0 0;
}

.order-container {
  max-width: 800px;
  margin: 0 auto;
  font-family: 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
}

.order-item {
  display: flex;
  gap: 20px;
  padding: 20px;
  margin-bottom: 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  cursor: pointer;
  border: 1px solid #f0f0f0;
}

.order-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
  border-color: #e0e0e0;
}

.order-item-image {
  width: 120px;
  height: 90px;
  object-fit: cover;
  border-radius: 8px;
  background: #f5f5f5;
}

.order-item-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.order-item-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.order-item-price {
  font-size: 16px;
  font-weight: 700;
  color: #3a86ff;
  margin: 0;
}

.order-item-status {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0;
}

/* Status color variations */
.order-item-status[data-status="Completed"] {
  background-color: #e3fcef;
  color: #36b37e;
}

.order-item-status[data-status="Processing"] {
  background-color: #fffae6;
  color: #ffab00;
}

.order-item-status[data-status="Shipped"] {
  background-color: #e6f3ff;
  color: #0065ff;
}

.order-item-status[data-status="Cancelled"] {
  background-color: #ffebee;
  color: #ff5630;
}

.order-item-day {
  font-size: 12px;
  color: #666;
  margin: 0;
}

.empty-order {
  text-align: center;
  padding: 40px;
  font-size: 16px;
  color: #888;
  background: #fafafa;
  border-radius: 12px;
  border: 1px dashed #e0e0e0;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .order-item {
    flex-direction: column;
    gap: 12px;
  }
  
  .order-item-image {
    width: 100%;
    height: 160px;
  }
}
/* Animations */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Responsive Design */
@media (max-width: 640px) {
  .order-container {
    padding: 1.5rem;
  }
  
  .header h1 {
    font-size: 1.5rem;
  }
  
  .order-item {
    flex-direction: column;
  }
  
  .order-item-image {
    width: 100%;
    height: auto;
    max-height: 200px;
  }
}
</style>