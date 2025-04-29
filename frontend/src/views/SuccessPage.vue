<template>
    <div class="success-page">
      <div class="success-content">
        <div class="success-icon">
          <i class="checkmark">✓</i>
        </div>
        <h1>Payment Successful!</h1>
        <p>Your course enrollment has been confirmed</p>
        
        <div class="order-summary">
          <h2>Order Details</h2>
          <div class="order-info">
            <div class="info-row">
              <span>Order ID:</span>
              <span>{{ orderId }}</span>
            </div>
            <div class="info-row">
              <span>Date:</span>
              <span>{{ formatDate(date|| "") }}</span>
            </div>
            <div class="info-row">
              <span>Status:</span>
              <span>{{ status }}</span>
            </div>

          </div>
        </div>
  
        <div class="action-buttons">
          <button class="home-btn" @click="goToHome">
            Back to Home
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import { orderStore } from '../store/orderStore';
  export interface Order {
  id: number
  userId: number
  createdAt: string
  sessionId: string
  status: string
  courseIds: string[]
}
  const order = orderStore();
  const router = useRouter();
  const route = useRoute();
  const dataOrder = ref<Order[]>()
  const date = ref<string>();
  const orderId = ref<string>();
  const total = ref(0);
  const discount = ref(0);
  const status = ref<string>();
  const goToHome = () => {
    router.push('/');
  };
  const formatDate = (dateString: string) => {
      const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    };
  const viewInvoice = () => {
    // For now just console.log, later implement invoice view
    console.log('View invoice for order:', orderId.value);
    // router.push(`/invoice/${orderId.value}`);
  };
  
  const initializeData = () => {
  if (dataOrder.value && dataOrder.value.length > 0) {
    const lastOrder = dataOrder.value[dataOrder.value.length - 1];
    orderId.value = lastOrder.sessionId || "";
    status.value = lastOrder.status || "";
    date.value = lastOrder.createdAt || "";
    
    // If you need other data from the last order:
    // total.value = lastOrder.totalPrice || 0;
    // user.value = lastOrder.user?.userName || "Unknown";
  }
};

onMounted(async () => {
  try {
    await order.getOrder(); // Make sure this fetches the orders data
    dataOrder.value = order.ordersPer; // Assuming this contains the orders array
    
    initializeData();
    
    if (route.params.paymentDetails) {
      const details = JSON.parse(route.params.paymentDetails as string);
      total.value = details.total;
      discount.value = details.discount;
    }
  } catch (error) {
    console.error("Error initializing order data:", error);
  }
});
  </script>
  
  <style scoped>
  .success-page {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-color: #f5f5f5;
    padding: 20px;
  }
  
  .success-content {
    background: white;
    padding: 40px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    text-align: center;
    max-width: 1000px;
    width: 100%;
  }
  
  .success-icon {
    width: 80px;
    height: 80px;
    margin: 0 auto 20px;
    border-radius: 50%;
    background: #6c9d8f;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .checkmark {
    color: white;
    font-size: 40px;
    line-height: 1;
  }
  
  h1 {
    color: #333;
    font-size: 28px;
    margin-bottom: 10px;
  }
  
  p {
    color: #666;
    margin-bottom: 30px;
  }
  
  .order-summary {
    text-align: left;
    padding: 20px;
    background: #f8f8f8;
    border-radius: 8px;
    margin: 20px 0;
  }
  
  .order-summary h2 {
    font-size: 20px;
    margin-bottom: 15px;
    color: #333;
  }
  
  .info-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
    color: #666;
  }
  
  .action-buttons {
    display: flex;
    gap: 15px;
    margin-top: 30px;
  }
  
  .home-btn,
  .invoice-btn {
    flex: 1;
    padding: 12px;
    border-radius: 6px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s;
  }
  
  .home-btn {
    background-color: #6c9d8f;
    color: white;
    border: none;
  }
  
  .home-btn:hover {
    background-color: #5a8b7d;
  }
  
  .invoice-btn {
    background-color: white;
    color: #6c9d8f;
    border: 2px solid #6c9d8f;
  }
  
  .invoice-btn:hover {
    background-color: #f0f7f5;
  }
  
  @media (max-width: 480px) {
    .action-buttons {
      flex-direction: column;
    }
    
    .success-content {
      padding: 20px;
    }
  }
  </style>