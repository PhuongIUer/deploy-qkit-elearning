<template>
    <div>
      <nav-bar />
      <div class="verify-page">
        <!-- Left -->
        <div class="verify-container">
          <div class="illustration">
            <img src="../../assets/illustration.png" alt="Welcome" />
          </div>
        </div>
  
        <!-- Right -->
        <div class="verify-form">
          <div class="logo">
            <img src="../../assets/logo.png" alt="Logo" />
          </div>
          <h2>Verify Your Email</h2>
  
          <!-- Error message display -->
          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>
  
          <form @submit.prevent="handleVerify">
            <div class="form-group">
              <label>Email</label>
              <input type="email" v-model="email" placeholder="Enter your email" required />
            </div>
            <div class="form-group">
              <label>OTP</label>
              <input type="text" v-model="otp" placeholder="Enter OTP" required />
            </div>
            <button type="submit" class="verify-btn">Veryfi email</button>
          </form>
  
          <p class="register-link">
            Didn't receive OTP? <span @click="resendOTP" class="resend-link">Resend</span>
          </p>
        </div>
      </div>
      <FooterVue />
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from "vue";
  import { useRouter } from "vue-router";
  import axios from "axios";
  
  const router = useRouter();
  const email = ref("");
  const otp = ref("");
  const errorMessage = ref("");
  const isLoading = ref(false);
  
  const handleVerify = async () => {
    if (!email.value || !otp.value) {
      errorMessage.value = "Please enter both email and OTP.";
      return;
    }
  
    isLoading.value = true;
    errorMessage.value = "";
  
    try {
      const response = await axios.post("http://localhost:3000/api/auth/verify-email", {
        email: email.value,
        otp: otp.value,
      });
  
      if (response.status === 201) {
        alert("Email verified successfully! Redirecting to login...");
        router.push("/login"); // Chuyển hướng về trang login
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
  
  const resendOTP = async () => {
  if (!email.value) {
    errorMessage.value = "Please enter your email before requesting a new OTP.";
    return;
  }

  isLoading.value = true;
  errorMessage.value = "";

  try {
    const response = await axios.post(`http://localhost:3000/api/auth/resend-verification/${email.value}`);

    if (response.status === 200) {
      alert("A new OTP has been sent to your email.");
    }
    if (response.status === 201) {
      alert("Email already verify.");
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
  
    .verify-page {
      display: flex;
      justify-content: space-between;
      align-items: center;
      min-height: calc(100vh - 120px);
      background: #ffffff;
      padding: 32px;
      gap: 32px;
    }
    .resend-link {
    color: #007bff;
    cursor: pointer;
    text-decoration: underline;
    }
    .verify-container,
    .verify-form {
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
      height: auto;
      max-width: 100%;
      object-fit: contain;
    }
  
    .verify-form {
      flex-direction: column;
      max-width: 800px;
      width: 100%;
      display: flex;
      align-items: center;
      margin-right: 50px;
    }
  
  .logo img {
    padding-top: 30px;
    width: 180px;
    height: auto;
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
  
    .options {
      display: flex;
      justify-content: space-between;
      width: 100%;
      margin: 24px 0;
      font-size: 14px;
    }
  
    .options a {
      margin-left: auto;
      text-align: right;
    }
  
    .remember-checkbox {
      width: 16px;
      height: 16px;
      cursor: pointer;
    }
  
    .verify-btn {
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
  
    .verify-btn:hover {
      background: #557d72;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(108, 157, 143, 0.2);
    }
  
    .register-link {
      margin-top: 24px;
      font-size: 16px;
      color: #666;
      text-align: center;
    }
  
    .register-link a {
      color: #046DCF;
    }
  
    .error-message {
      color: #dc3545;
      background-color: #ffe6e6;
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 16px;
      width: 100%;
      text-align: center;
    }
  
  
    @media (max-width: 768px) {
      .verify-page {
        flex-direction: column;
        gap: 32px;
      }
    }
    </style>