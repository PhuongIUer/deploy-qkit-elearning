<template>
  <div>
    <div class="reset-password-page">
      <!-- Left -->
      <div class="reset-container">
        <div class="illustration">
          <img src="../assets/illustration.png" alt="Reset Password Illustration" />
        </div>
      </div>

      <!-- Right -->
      <div class="reset-form">
        <div class="logo">
          <img src="../assets/logo.png" alt="Logo" />
        </div>
        <h2>Set New Password</h2>

        <div v-if="errorMessage" class="error-message">
          <span class="error-text">❌ {{ errorMessage }}</span>
        </div>

        <form @submit.prevent="handleResetPassword">
          <div class="form-group">
            <label>New Password</label>
            <input 
              type="password" 
              v-model="newPassword" 
              placeholder="Enter your new password" 
              required 
            />
          </div>

          <div class="form-group">
            <label>Confirm New Password</label>
            <input 
              type="password" 
              v-model="confirmPassword" 
              placeholder="Re-enter your new password" 
              required 
            />
          </div>

          <button type="submit" class="reset-btn">Reset Password</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";

const router = useRouter();
const newPassword = ref("");
const confirmPassword = ref("");
const errorMessage = ref("");

const apiEndpoint = "http://localhost:3000/api/auth/reset-password"; // API endpoint for resetting password

const handleResetPassword = async () => {
  errorMessage.value = "";

  if (newPassword.value.length < 6) {
    errorMessage.value = "Password must be at least 6 characters long.";
    return;
  }

  if (newPassword.value !== confirmPassword.value) {
    errorMessage.value = "Passwords do not match.";
    return;
  }

  try {
    await axios.post(apiEndpoint, {
      newPassword: newPassword.value,
      confirmPassword: confirmPassword.value,
    });

    // Success: Redirect to login page after successful reset
    router.push("/login");
  } catch (error) {
    console.error("Error:", error);
    errorMessage.value = error.response?.data?.message || "An error occurred. Please try again.";
  }
};
</script>

<style scoped>
.reset-password-page {
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: calc(100vh - 120px);
  background: #ffffff;
  padding: 32px;
  gap: 32px;
}

.reset-container,
.reset-form {
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

.reset-form {
  flex-direction: column;
  max-width: 800px;
  width: 100%;
  display: flex;
  align-items: center;
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

.error-text {
  color: #dc3545;
  font-weight: 500;
  font-size: 16px;
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

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}

@media (max-width: 768px) {
  .reset-password-page {
    flex-direction: column;
    gap: 32px;
  }
}
</style>
