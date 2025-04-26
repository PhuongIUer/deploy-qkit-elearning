<template>
  <div class="payment-page">
    <div class="payment-content">
      <!-- Order Summary Section -->
      <div class="order-summary">
        <h2>Order Summary</h2>
        <div class="selected-courses">
          <div v-for="courseId in selectedCourseIds" :key="courseId" class="course-item">
            <div class="course-info">
              <CourseShopping :course-id="courseId" />
            </div>
          </div>
        </div>

        <div class="price-details">
          <div class="subtotal line-item">
            <span>Subtotal</span>
            <span>${{ subtotal.toFixed(2) }}</span>
          </div>
          
          <div class="voucher-section">
            <div class="voucher-header">
              <span class="voucher-title">Available Vouchers</span>
            </div>
            <div class="voucher-dropdown">
              <div class="voucher-select" @click="showVoucherList = !showVoucherList">
                <span>{{ selectedVoucher || 'Select a voucher' }}</span>
                <i class="arrow-down"></i>
              </div>
              <div class="voucher-list" v-if="showVoucherList">
                <div 
                  v-for="(discount, code) in validVouchers" 
                  :key="code"
                  class="voucher-item"
                  @click="selectVoucher(code, discount)"
                >
                  <span class="voucher-code">{{ code }}</span>
                  <span class="voucher-discount">{{ discount }}% OFF</span>
                </div>
              </div>
            </div>
            <div v-if="voucherApplied" class="discount line-item">
              <span>Discount ({{ discount }}%)</span>
              <span>-${{ discountAmount.toFixed(2) }}</span>
            </div>
          </div>

          <div class="total line-item">
            <span>Total</span>
            <span>${{ finalTotal.toFixed(2) }}</span>
          </div>
        </div>
      </div>

      <!-- Payment Form Section -->
      <div class="payment-form">
        <h2>Payment Details</h2>
        <form @submit.prevent="handlePayment">
          <div class="form-group">
            <label>Cardholder Name</label>
            <input 
              type="text" 
              v-model="cardHolder"
              placeholder="John Doe"
              required
            />
          </div>

          <div class="form-group">
            <label>Card Number</label>
            <input 
              type="text" 
              v-model="cardNumber"
              placeholder="1234 5678 9012 3456"
              maxlength="19"
              @input="formatCardNumber"
              required
            />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Expiry Date</label>
              <input 
                type="text" 
                v-model="expiryDate"
                placeholder="MM/YY"
                maxlength="5"
                @input="formatExpiryDate"
                required
              />
            </div>

            <div class="form-group">
              <label>CVV</label>
              <input 
                type="text" 
                v-model="cvv"
                placeholder="123"
                maxlength="3"
                required
              />
            </div>
          </div>

          <button type="submit" class="pay-button" :disabled="processing">
            {{ processing ? 'Processing...' : `Pay $${finalTotal.toFixed(2)}` }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import CourseShopping from '../components/CourseShopping.vue';
import { toast } from 'vue3-toastify';

const route = useRoute();
const router = useRouter();

// Form data
const cardHolder = ref('');
const cardNumber = ref('');
const expiryDate = ref('');
const cvv = ref('');
const processing = ref(false);

// Course and voucher data
const selectedCourseIds = ref<number[]>([]);
const total = ref(0);
const voucherCode = ref('');
const voucherApplied = ref(false);
const discount = ref(0);
const showVoucherList = ref(false);
const selectedVoucher = ref('');

// Mock voucher data
const validVouchers: Record<string, number> = {
  'SAVE10': 10,
  'SAVE20': 20,
  'SAVE30': 30
};

// Computed values
const subtotal = computed(() => total.value);
const discountAmount = computed(() => {
  return (subtotal.value * discount.value) / 100;
});
const finalTotal = computed(() => {
  return subtotal.value - discountAmount.value;
});

// Card number formatting
const formatCardNumber = () => {
  let value = cardNumber.value.replace(/\s/g, '').replace(/\D/g, '');
  let formatted = '';
  for (let i = 0; i < value.length; i++) {
    if (i > 0 && i % 4 === 0) {
      formatted += ' ';
    }
    formatted += value[i];
  }
  cardNumber.value = formatted.substring(0, 19);
};

// Expiry date formatting
const formatExpiryDate = () => {
  let value = expiryDate.value.replace(/\D/g, '');
  if (value.length >= 2) {
    expiryDate.value = value.substring(0, 2) + '/' + value.substring(2, 4);
  } else {
    expiryDate.value = value;
  }
};

// Apply voucher
const selectVoucher = (code: string, discountValue: number) => {
  voucherCode.value = code;
  selectedVoucher.value = `${code} (${discountValue}% OFF)`;
  showVoucherList.value = false;
  discount.value = discountValue;
  voucherApplied.value = true;
};

// Payment submission
const handlePayment = async () => {
  if (selectedCourseIds.value.length === 0) {
    toast.warning('No courses selected for payment');
    return;
  }

  if (!validateForm()) {
    return;
  }
  
  processing.value = true;
  try {
    const paymentData = {
      courses: selectedCourseIds.value,
      voucherCode: voucherApplied.value ? voucherCode.value : null,
      discount: discount.value,
      total: finalTotal.value,
      cardHolder: cardHolder.value,
      cardNumber: cardNumber.value,
      expiryDate: expiryDate.value,
      cvv: cvv.value
    };

    const response = await fetch('/api/orders/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(paymentData)
    });

    if (!response.ok) {
      throw new Error('Payment failed');
    }

    const result = await response.json();
    toast.success('Payment successful!');
    router.push({ path: '/success', query: { orderUrl: result.url } });
  } catch (error) {
    toast.error('Payment failed. Please try again.');
  } finally {
    processing.value = false;
  }
};

const validateForm = () => {
  if (!cardHolder.value.trim()) {
    toast.warning('Please enter cardholder name');
    return false;
  }
  if (cardNumber.value.replace(/\s/g, '').length !== 16) {
    toast.warning('Please enter a valid card number');
    return false;
  }
  if (expiryDate.value.length !== 5) {
    toast.warning('Please enter a valid expiry date');
    return false;
  }
  if (cvv.value.length !== 3) {
    toast.warning('Please enter a valid CVV');
    return false;
  }
  return true;
};

// Initialize data from route
onMounted(async () => {
  const courses = route.query.courses?.toString();
  if (courses) {
    selectedCourseIds.value = courses.split(',').map(Number);
  }

  const queryTotal = route.query.total?.toString();
  if (queryTotal) {
    total.value = parseFloat(queryTotal);
  }

  const response = await fetch('/api/orders', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  const data = await response.json();
  console.log(data);
});
</script>

<style scoped>
.payment-page {
  display: flex;
  justify-content: center;
  min-height: 100vh;
  padding: 40px 20px;
}

.payment-content {
  display: flex;
  gap: 40px;
  max-width: 1200px;
  width: 100%;
}

.order-summary, .payment-form {
  flex: 1;
  background: white;
  padding: 25px 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.course-card {
    display: flex;
    width: 800px;
    align-items: center;
    background-color: white;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    padding: 20px 10px; 
  }
.course-item {
  border-bottom: 1px solid white !important; 
}

h2 {
  font-size: 24px;
  color: #333;
  margin-bottom: 24px;
}

.course-item {
  padding: 15px 0;
  border-bottom: 1px solid #eee;
}

.course-info {
  width: 100%;
}

.price-details {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 2px solid #eee;
}

.line-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  color: #666;
}

.total {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #eee;
}

.form-group {
  margin-bottom: 20px;
}

.form-row {
  display: flex;
  gap: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  color: #666;
  font-size: 14px;
}

input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
}

input:focus {
  outline: none;
  border-color: #6c9d8f;
}

.pay-button {
  width: 100%;
  padding: 16px;
  background-color: #6c9d8f;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s;
}

.pay-button:hover {
  background-color: #5a8b7d;
}

.pay-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

/* Add to style section */
.voucher-header {
  margin-bottom: 12px;
}

.voucher-title {
  font-size: 16px;
  color: #333;
  padding-bottom: 4px;
}

.voucher-dropdown {
  position: relative;
  width: 100%;
  margin-bottom: 16px;
}

.voucher-select {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
}

.voucher-list {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  margin-top: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.voucher-item {
  padding: 12px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid #eee;
}

.voucher-item:last-child {
  border-bottom: none;
}

.voucher-item:hover {
  background-color: #f5f5f5;
}

.voucher-code {
  font-weight: 500;
  color: #333;
}

.voucher-discount {
  color: #6c9d8f;
  font-weight: 500;
}

.arrow-down {
  border: solid #666;
  border-width: 0 2px 2px 0;
  display: inline-block;
  padding: 3px;
  transform: rotate(45deg);
  margin-top: -4px;
}

@media (max-width: 768px) {
  .payment-content {
    flex-direction: column;
  }
  
  .form-row {
    flex-direction: column;
    gap: 0;
  }
}
</style>