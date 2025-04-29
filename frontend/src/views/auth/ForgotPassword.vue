<template>
    <div>
      <div class="forgot-page">
        <!-- Left -->
        <div class="forgot-container">
          <div class="illustration">
            <img src="../../assets/illustration.png" alt="Reset Password" />
          </div>
        </div>
  
        <!-- Right -->
        <div class="forgot-form">
          <div class="logo">
            <img src="../../assets/logo.png" alt="Logo" />
          </div>
          <h2>Reset Password</h2>
  
          <div v-if="errorMessage" class="error-message">
            <span class="error-text">❌ {{ errorMessage }}</span>
          </div>
  
          <div v-if="successMessage" class="success-message">
            <span class="success-text">✅ {{ successMessage }}</span>
          </div>
  
          <form @submit.prevent="handleForgotPassword">
            <div class="form-group">
              <label>Email Address</label>
              <input 
                type="email" 
                v-model="email" 
                placeholder="Enter your registered email address" 
                required 
              />
            </div>
  
            <button type="submit" class="reset-btn">Reset Password</button>
          </form>
  
          <p class="login-link">
            Remember your password? <router-link to="/login">Login</router-link>
          </p>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";

const router = useRouter();
const email = ref("");
const errorMessage = ref("");
const successMessage = ref("");

const apiEndpoint = "http://localhost:3000/api/auth/forgot-password";

const validateEmail = (): boolean => {
  if (!email.value) {
    errorMessage.value = "Please enter your email address";
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.value)) {
    errorMessage.value = "Please enter a valid email address";
    return false;
  }

  return true;
};

const handleForgotPassword = async () => {
  errorMessage.value = "";
  successMessage.value = "";

  if (!validateEmail()) return;

  try {
  const response = await axios.post(apiEndpoint, { 
    email: email.value 
  });

  // Success case
  if (response.status === 201) {
    successMessage.value = response.data.message;
    email.value = ""; // Clear the email field

    // Redirect after 3 seconds
    setTimeout(() => {
      router.push("/login");
    }, 3000);
  }
} catch (error) {
  console.error("Registration Error:", error);
  
  // Error handling with specific cases
  const err = error as { response?: { data: { message: string } } };
  errorMessage.value = err.response 
    ? err.response.data.message || "An error occurred. Please try again."
    : "Server is unreachable. Please try again later.";
}
};
</script>
  
  <style scoped>
  .forgot-page {
    display: flex;
    justify-content: space-between;
    align-items: center;
    min-height: calc(100vh - 120px);
    background: #ffffff;
    padding: 32px;
    gap: 32px;
  }
  
  .forgot-container,
  .forgot-form {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    max-width: 50%;
    height: 100%;
    padding: 0 32px;
  }
  
  .illustration img {
    width: 100%;
    max-width: 800px;
    object-fit: contain;
    animation: fadeIn 1s ease-in-out;
  }
  
  .forgot-form {
    flex-direction: column;
    max-width: 800px;
    width: 100%;
    display: flex;
    align-items: center;
    margin-right: 50px;
    animation: slideInRight 1s ease-in-out;
  }
  
  .logo img {
    width: 180px;
    height: auto;
  }
  
  h2 {
    font-size: 32px;
    margin-bottom: 32px;
    font-weight: 600;
    color: #333;
    text-align: center;
  }
  
  form {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .form-group {
    text-align: left;
    margin-bottom: 32px;
    width: 100%;
  }
  
  .form-group label {
    display: block;
    font-weight: 500;
    margin-bottom: 8px;
    color: #444;
    font-size: 20px;
  }
  
  .form-group input {
    width: 95%;
    padding: 16px;
    border: 1.5px solid #e0e0e0;
    border-radius: 12px;
    font-size: 18px;
    transition: all 0.3s ease;
  }
  
  .reset-btn {
    width: 100%;
    padding: 16px;
    background: #6c9d8f;
    color: white;
    font-size: 16px;
    font-weight: 600;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    text-align: center;
  }
  
  .reset-btn:hover {
    background: #557d72;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(108, 157, 143, 0.2);
  }
  
  .login-link {
    margin-top: 24px;
    font-size: 16px;
    color: #666;
    text-align: center;
  }
  
  .login-link a {
    color: #046DCF;
  }
  
  .error-message {
    width: 100%;
    padding: 16px;
    margin-bottom: 24px;
    background-color: #ffe6e6;
    border: 1px solid #ffcccc;
    border-radius: 12px;
    text-align: center;
    animation: shake 0.5s ease-in-out;
  }
  
  .success-message {
    width: 100%;
    padding: 16px;
    margin-bottom: 24px;
    background-color: #e6ffe6;
    border: 1px solid #ccffcc;
    border-radius: 12px;
    text-align: center;
    animation: fadeIn 0.5s ease-in-out;
  }
  
  .error-text {
    color: #dc3545;
    font-weight: 500;
    font-size: 16px;
  }
  
  .success-text {
    color: #28a745;
    font-weight: 500;
    font-size: 16px;
  }
  
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-10px); }
    75% { transform: translateX(10px); }
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @media (max-width: 768px) {
    .forgot-page {
      flex-direction: column;
      gap: 32px;
    }
  }
  </style>