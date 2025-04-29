<!-- eslint-disable no-irregular-whitespace -->
<template>
  <div>
    <div class="login-page">
      <!-- Left -->
      <div class="login-container">
        <div class="illustration">
          <img src="../../assets/illustration.png" alt="Welcome" />
        </div>
      </div>

      <!-- Right -->
      <div class="login-form">
        <div class="logo">
          <img src="../../assets/logo.png" alt="Logo" />
        </div>
        <h2>Login</h2>

          <!-- Error message display -->
          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>

          <!-- <div v-if="errorMessage" class="error-message">
            <span class="error-text">❌ {{ errorMessage }}</span>
          </div> -->

          <form @submit.prevent="handleLogin">  
            <div class="form-group">
              <label>Email Address</label>
              <input type="email" v-model="email" placeholder="Enter your email address" required />
            </div>
            <div class="form-group password-group">
              <label>Password</label>
              <input :type="showPassword ? 'text' : 'password'" v-model="password" placeholder="Enter your password" required />
              <span class="toggle-password" @click="togglePassword">
                <FontAwesomeIcon :icon="showPassword ? faEyeSlash : faEye" />
              </span>
            </div>
            <div class="options">
              <label class="remember-me">
                <input 
                  type="checkbox" 
                  v-model="rememberMe"
                  class="remember-checkbox"
                /> 
                  Remember me
              </label>
              <router-link to="/forgot-password" class="forgot-link">Forgot Password?</router-link>
            </div>
            <button type="submit" class="login-btn">Login</button>
          </form>

          
          <p class="register-link">
            Don't have an account? <router-link to="/signup">Sign up</router-link>
          </p>
          <p class="register-link">
            Don't verify email yet? <router-link to="/verify-email">Verify email</router-link>
          </p>
        </div>
      </div>
    </div>
  </template>

  <script setup lang="ts">
  import { ref, onMounted } from "vue";
  import { useRouter } from 'vue-router';
  import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
  import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
  import axios from 'axios';



  interface RememberedUser {
  email: string;
  password: string;
  rememberMe: boolean;
}

  const router = useRouter();
  const email = ref("");
  const password = ref("");
  const showPassword = ref(false);
  const errorMessage = ref("");
  const rememberMe = ref(false);



  const togglePassword = () => (showPassword.value = !showPassword.value);

  const validateForm = (): boolean => {
    if (!email.value || !password.value) {
      errorMessage.value = "Please fill in all fields";
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.value)) {
      errorMessage.value = "Please enter a valid email address";
      return false;
    }

    return true;
  };

  const handleLogin = async () => {
  try {
    if (!validateForm()) return;

    const response = await axios.post('http://localhost:3000/api/auth/login', {
      email: email.value,
      password: password.value
    });

    const accessToken = response.data.access_token;
    // Lưu access_token
    localStorage.setItem('authToken', accessToken);
    localStorage.setItem('isLoggedIn', 'true');
    
    // Lưu thông tin nếu "Remember Me" được chọn
    if (rememberMe.value) {
      localStorage.setItem('rememberedUser', JSON.stringify({ email: email.value, password: password.value, rememberMe: true }));
    } else {
      localStorage.removeItem('rememberedUser');
    }

    // Chuyển hướng sau khi đăng nhập thành công
    router.push('/');
  } catch (error) {
  console.error("Registration Error:", error);
  
  // Error handling with specific cases
  const err = error as { response?: { data: { message: string } } };
  errorMessage.value = err.response 
    ? err.response.data.message || "An error occurred. Please try again."
    : "Server is unreachable. Please try again later.";
}
};
  // Check for remembered user
  const checkRememberedUser = () => {
  const remembered = localStorage.getItem('rememberedUser');
  if (remembered) {
    const rememberedUser: RememberedUser = JSON.parse(remembered);
    email.value = rememberedUser.email;
    rememberMe.value = rememberedUser.rememberMe;
  }
};


  onMounted(() => {
    checkRememberedUser();
  });
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

  .login-page {
    display: flex;
    justify-content: space-between;
    align-items: center;
    min-height: calc(100vh - 120px);
    background: #ffffff;
    padding: 32px;
    gap: 32px;
  }

  .login-container,
  .login-form {
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

  .login-form {
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
  }

  .toggle-password:hover {
    color: #6c9d8f;
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

  .remember-me {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
  }

  .remember-checkbox {
    width: 16px;
    height: 16px;
    cursor: pointer;
  }

  .login-btn {
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

  .login-btn:hover {
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
    .login-page {
      flex-direction: column;
      gap: 32px;
    }
  }
  </style>