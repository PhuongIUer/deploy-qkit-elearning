<template>
  <div>
    <div class="signup-page">
      <!-- Left -->
      <div class="signup-container">
        <div class="illustration">
          <img src="../../assets/illustration.png" alt="Welcome" />
        </div>
      </div>

      <!-- Right -->
      <div class="signup-form">
        <div class="logo">
          <img src="../../assets/logo.png" alt="Logo" />
        </div>
        <h2>Sign Up</h2>

        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <form @submit.prevent="handleSignUp">
          <div class="form-group">
            <label>User name</label>
            <input type="text" v-model="userName" placeholder="Enter your user name" required />
          </div>
          <div class="form-group">
            <label>Email Address</label>
            <input type="email" v-model="email" placeholder="Enter your email address" required />
          </div>

          <!-- Password field -->
          <div class="form-group password-group">
            <label>Password</label>
            <input 
              :type="showPassword ? 'text' : 'password'" 
              v-model="password" 
              placeholder="Enter your password" 
              required 
            />
            <span class="toggle-password" @click="togglePassword">
              <FontAwesomeIcon :icon="showPassword ? faEyeSlash : faEye" />
            </span>
          </div>

          <!-- Confirm Password field -->
          <div class="form-group password-group">
            <label>Confirm Password</label>
            <input 
              :type="showConfirmPassword ? 'text' : 'password'" 
              v-model="confirmPassword" 
              placeholder="Confirm your password" 
              required 
            />
            <span class="toggle-password" @click="toggleConfirmPassword">
              <FontAwesomeIcon :icon="showConfirmPassword ? faEyeSlash : faEye" />
            </span>
          </div>

          <button type="submit" class="signup-btn">Sign Up</button>
        </form>
        <p class="login-link">
          Already have an account? <router-link to="/login">Log in</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "vue-router";
import axios from "axios";

const router = useRouter();
const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const userName = ref("");
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const errorMessage = ref("");
const isLoading = ref(false);

const togglePassword = () => (showPassword.value = !showPassword.value);
const toggleConfirmPassword = () => (showConfirmPassword.value = !showConfirmPassword.value);

const validateForm = (): boolean => {
  if (!email.value || !password.value || !confirmPassword.value || !userName.value) {
    errorMessage.value = "Please fill in all fields";
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.value)) {
    errorMessage.value = "Invalid email address";
    return false;
  }

  if (password.value.length < 6) {
    errorMessage.value = "Password must be at least 6 characters";
    return false;
  }

  if (password.value !== confirmPassword.value) {
    errorMessage.value = "Passwords do not match";
    return false;
  }

  return true;
};

const handleSignUp = async () => {
  if (!validateForm()) return;

  isLoading.value = true;
  errorMessage.value = "";

  try {
    const response = await axios.post(
      "http://14.225.217.42:5000/api/auth/register",
      {
        email: email.value,
        password: password.value,
        userName: userName.value,
      },
      { headers: { "Content-Type": "application/json" }, timeout: 5000 }
    );

    if (response.status === 201) {
      alert("Registration successful! Please verify your email.");
      router.push("/verify-email");
  }

  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 409) {
        errorMessage.value = "This email is already registered. Please try logging in.";
      } else {
        errorMessage.value = `Error: ${error.response?.data?.message || "Something went wrong"}`;
      }
    } else {
      errorMessage.value = "An unexpected error occurred. Please try again.";
    }
  } finally {
    isLoading.value = false;
  }
};
</script>


<style scoped>
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}

.signup-page {
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: calc(100vh - 120px);
  background: #ffffff;
  padding: 32px;
  gap: 32px;
  margin-top: 80px;
}

.signup-container,
.signup-form {
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

.signup-form {
  flex-direction: column;
  max-width: 800px;
  width: 100%;
  display: flex;
  align-items: center;
  margin-right: 50px;
}

.logo img {
  width: 150px;
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
  max-width: 800px;
}

.form-group label {
  display: block;
  font-weight: 500;
  margin-bottom: 8px;
  color: #444;
  font-size: 20px;
}

.form-group input {
  width: 100%;
  padding: 16px;
  border: 1.5px solid #e0e0e0;
  border-radius: 12px;
  font-size: 18px;
  transition: all 0.3s ease;
}

.password-group {
  position: relative;
}

.toggle-password {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(50%);
  cursor: pointer;
  color: #666;
  z-index: 1;
}

.toggle-password:hover {
  color: #6c9d8f;
}

.options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin: 24px 0;
  font-size: 14px;
}

.options a {
  margin-left: auto;
  text-align: right;
}

.signup-btn {
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

.signup-btn:hover {
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
  color: #dc3545;
  background-color: #ffe6e6;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 16px;
  width: 100%;
  text-align: center;
}

@media (max-width: 768px) {
  .signup-page {
    flex-direction: column;
    gap: 32px;
    margin-top: 60px;
  }
}
</style>