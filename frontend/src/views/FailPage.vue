<template>
  <div class="fail-page">
    <div class="fail-content">
      <div class="fail-icon">
        <i class="crossmark">✗</i>
      </div>
      <h1>Payment Failed!</h1>
      <p>We couldn't process your payment. Please try again.</p>
      
      <div class="suggestion-box">
        <h2>What to do next?</h2>
        <ul>
          <li>Check your payment details and try again</li>
          <li>Contact your bank if there's an issue</li>
          <li>Try using a different payment method</li>
        </ul>
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
import { useRouter } from 'vue-router';

const router = useRouter();

const goToHome = () => {
  router.push('/');
};
</script>

<style scoped>
.fail-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20px;
}

.fail-content {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 1000px;
  width: 100%;
}

.fail-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  border-radius: 50%;
  background: #e74c3c;
  display: flex;
  align-items: center;
  justify-content: center;
}

.crossmark {
  color: white;
  font-size: 40px;
  line-height: 1;
  font-weight: bold;
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

.suggestion-box {
  text-align: left;
  padding: 20px;
  background: #f8f8f8;
  border-radius: 8px;
  margin: 20px 0;
}

.suggestion-box h2 {
  font-size: 20px;
  margin-bottom: 15px;
  color: #333;
}

.suggestion-box ul {
  color: #666;
  padding-left: 20px;
}

.suggestion-box li {
  margin-bottom: 8px;
}

.action-buttons {
  display: flex;
  gap: 15px;
  margin-top: 30px;
  justify-content: center;
}

.home-btn {
  width: 300px;
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  background-color: #e74c3c;
  color: white;
  border: none;
}

.home-btn:hover {
  background-color: #c0392b;
}

@media (max-width: 480px) {
  .fail-content {
    padding: 20px;
  }
}
</style>