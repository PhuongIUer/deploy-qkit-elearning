<template>
  <div class="profile-page">
    <div class="main-container">
      <!-- Sidebar Navigation -->
      <div class="sidebar-layout">
        <div class="menu-container">
          <button 
            v-for="menu in menuItems"
            :key="menu.id"
            class="menu-btn"
            :class="{ 'active': menu.id === 'settings' }"
            @click="handleNavigation(menu.id)"
          >
            <font-awesome-icon :icon="[menu.icon]" />
            {{ menu.label }}
          </button>
        </div>
      </div>

      <!-- Settings Content -->
      <div class="content-container">
        <div class="settings-grid">
          <!-- Form Section -->
          <div class="settings-section">
            <h2 class = "section-title" >My Profile</h2>
            <div class="settings-content">
              <div class="settings-form">
                <div class="form-group">
                  <label for="userName">userName</label>
                  <div class="input-wrapper">
                    <input 
                      id="userName"
                      type="text" 
                      v-model="formData.userName" 
                    />
                                      </div>
                  
                </div>
                
                <div class="form-group">
                  <label>Email</label>
                  <span>{{ formData.email }}</span>
                </div>

                <button 
                  type="button"
                  class="save-btn"
                  @click="handleSubmitProfile"
                >
                  Save Changes
                </button>
              </div>
            </div>
            <h2 class="section-title">Change password</h2>
            <div class="settings-content">
              <div class="form-group">
                  <label for="current-password">Current Password</label>
                  <div class="input-wrapper">
                    <input 
                      id="current-password"
                      type="password" 
                      v-model="formData.currentPassword"
                      placeholder="Enter current password"
                    />
                                      </div>
                </div>

                <div class="form-group">
                  <label for="new-password">New Password</label>
                  <div class="input-wrapper">
                    <input 
                      id="new-password"
                      type="password" 
                      v-model="formData.newPassword"
                      placeholder="Enter new password"
                    />
                  </div>
              </div>


                <div class="form-group">
                  <label for="confirmPassword">Confirm Password</label>
                  <div class="input-wrapper">
                    <input 
                      id="confirmPassword"
                      type="password" 
                      v-model="formData.confirmPassword"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>

                <button 
                  type="button"
                  class="save-btn"
                  @click="handleSubmitPassword"
                >
                  Save Changes
                </button>
            </div>
          </div>

          <!-- Avatar Section -->
          <div class="avatar-wrapper">
            <div class="avatar-section">
              <div class="avatar-container">
                <img 
                  :src="currentAvatar"
                  :alt="formData.userName + '\'s avatar'"
                  class="avatar-preview"
                  @error="handleImageError"
                />
                <div class="avatar-upload">
                  <label for="avatar-input" class="upload-btn">
                    <font-awesome-icon :icon="faUpload" />
                    Upload Photo
                  </label>
                  <input 
                    type="file"
                    id="avatar-input"
                    class="file-input"
                    accept="image/*"
                    @change="handleAvatarChange"
                  />
                </div>
                <p class="upload-hint">Allowed formats: JPG, PNG</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useAuthStore } from "../../store/auth.ts";
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faBook, faGear, faUpload } from '@fortawesome/free-solid-svg-icons';
import defaultAvatar from '../../assets/ava.jpg';
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';
const authStore = useAuthStore();
const { isLoggedIn, userName, userAvatar, email } = storeToRefs(authStore);

interface MenuItem {
  id: string;
  icon: typeof faBook | typeof faGear;
  label: string;
}

interface FormData {
  userName: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const formData = ref<FormData>({
  userName: '',
  email: '',
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
});

const router = useRouter();
const tempAvatarFile = ref<File | null>(null);
const tempAvatarUrl = ref<string>('');

const menuItems: MenuItem[] = [
  { id: 'course', icon: faBook, label: 'Course' },
  { id: 'settings', icon: faGear, label: 'Settings' }
];
  
const currentAvatar = computed(() => {
  return tempAvatarUrl.value || userAvatar.value || defaultAvatar;
});

const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement;
  target.src = defaultAvatar;
};

const handleAvatarChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  if (file) {
    if (file.size > 5000000) { // 5MB limit
      toast.warning('File size should not exceed 5MB');
      return;
    }

    if (!file.type.match('image.*')) {
      alert('Only image files are allowed');
      return;
    }

    tempAvatarFile.value = file;
    
    // Create a preview URL for the selected image
    const reader = new FileReader();
    reader.onload = (e) => {
      tempAvatarUrl.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
};

const handleNavigation = (section: string) => {
  if (section === 'course') {
    router.push('/course-student');
  }
};

const loadUserData = () => {
  formData.value = {
          userName: authStore.userName || '',
          email: authStore.email || '',
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        };
};

const handleSubmitPassword = async () => {
  try {
    // Check if the new password and confirm password match
    if (formData.value.newPassword !== formData.value.confirmPassword) {
      alert('New password and confirm password do not match!');
      return;
    }

    // Prepare the payload for the API request
    const passwordData = {
      currentPassword: formData.value.currentPassword,
      newPassword: formData.value.newPassword,
      confirmPassword: formData.value.confirmPassword,
    };

    // API call to change the password
    const response = await fetch('http://14.225.217.42:5000/api/auth/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`, // Use auth token for authorization
      },
      body: JSON.stringify(passwordData),
    });

    const data = await response.json();

    if (response.ok) {
      toast.success('Password has been changed successfully!');
      
      // Reset password fields after successful change
      formData.value.currentPassword = '';
      formData.value.newPassword = '';
      formData.value.confirmPassword = '';
    } else {
      toast.error(`Error: ${data.message}`);
    }
  } catch (error) {
    console.error('Error changing password:', error);
    toast.error('Error changing password. Please try again.');
  }
};

const handleSubmitProfile = async () => {
  try {
    const formDataToSend = new FormData();
    formDataToSend.append('userName', formData.value.userName);
    
    if (tempAvatarFile.value) {
      formDataToSend.append('avatar', tempAvatarFile.value);
    }

    const response = await fetch('http://14.225.217.42:5000/api/users/current-profile', {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
      body: formDataToSend,
    });

    const data = await response.json();
    if (response.ok) {
      // Update local storage and store
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      currentUser.userName = formData.value.userName;
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      
      // Refresh user data
      await authStore.fetchUserProfile();
      
      // Reset temp avatar
      tempAvatarFile.value = null;
      tempAvatarUrl.value = '';

      alert('Profile updated successfully!');
    } else {
      toast.error(`Error: ${data.message}`);
      localStorage.setItem('profileUpdated', 'false');
    }
  } catch (error) {
    console.error('Error updating profile:', error);
    alert('Error saving changes. Please try again.');
  }finally{
    window.location.reload();
  }
};


onMounted(() => {
  const profileUpdated = localStorage.getItem('profileUpdated');
  if (profileUpdated === 'true') {
    toast.success('Profile updated successfully!');
    localStorage.removeItem('profileUpdated'); 
  } else if (profileUpdated === 'false') {
    toast.error('Error saving changes. Please try again.');
    localStorage.removeItem('profileUpdated'); 
  }

  authStore.fetchUserProfile();
  loadUserData();
});

</script>

  <style scoped>
/* Layout Styles */
.profile-page {
  width: 100%;
  min-height: 120vh;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.main-container {
  display: flex;
  align-items: flex-start;
  min-height: calc(100vh - 160px);
  padding: 20px;
  width: 100%;
  max-width: 1200px; 
  box-sizing: border-box;
  margin: 0 auto; 
}

/* Sidebar Styles */
.sidebar-layout {
  position: sticky;
  top: 80px;
  height: fit-content;
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 220px;
}

.menu-container {
  background-color: #f5f5f5;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.menu-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 24px;
  border: 2px solid #6c9d8f;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 10px;
}

.menu-btn.active,
.menu-btn:hover {
  background-color: #6c9d8f;
  color: white;
}


.menu-btn:last-child {
  margin-bottom: 0;
}

/* Content Container Styles */
.content-container {
  flex: 1;
  margin-left: 40px;
}

.settings-title {
  font-size: 24px;
  color: #374259;
  margin-bottom: 24px;
  margin-left: 40px;
}

/* Settings Grid Layout */
.settings-grid {
  display: grid;
  grid-template-columns: 3fr 1fr;
  gap: 30px;
  align-items: start;
  max-width: 100%;
}

/* Form Section Styles */
.settings-section {
  max-width: 100%;
  padding: 0 40px;
}

.section-title {
  font-size: 24px;
  font-weight: bold;
  margin: 20px 0 10px;
  align-items: center;
  justify-content: space-between;
}

.settings-content {
  background: white;
  padding: 32px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.settings-form {
  flex: 1;
  max-width: 100%;
  width: 100%;
}

.form-group {
  margin-bottom: 24px;
  width: 100%;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #374259;
  font-size: 15px;
}

.form-group input {
  width: 100%;
  box-sizing: border-box;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s ease;
}

.form-group input:focus {
  border-color: #6c9d8f;
  outline: none;
}

.form-group input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.input-wrapper {
  position: relative;
}

.input-icon {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c9d8f;
  pointer-events: none;
}

/* Avatar Section Styles */
.avatar-wrapper {
  position: static;
  top: 20px;
  height: fit-content;
}

.avatar-section {
  margin-top: 60px;
  text-align: center;
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.avatar-container {
  padding: 15px;
  background: #f8f8f8;
  border-radius: 12px;
}

.avatar-preview {
  width: 180px; 
  height: 180px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 15px;
  border: 4px solid #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.avatar-upload {
  margin: 16px 0;
}

.upload-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background-color: #6c9d8f;
  color: white;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.upload-btn:hover {
  background-color: #5a8b7d;
}

.file-input {
  display: none;
}

.upload-hint {
  color: #666;
  font-size: 12px;
  margin-top: 8px;
}

/* Button Styles */
.save-btn {
  width: 100%;
  box-sizing: border-box; 
  padding: 14px;
  font-size: 16px;
  margin-top: 16px;
  background-color: #6c9d8f;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.3s ease;
}

.save-btn:hover {
  background-color: #5a8b7d;
}

input[type="tel"] {
  width: 100%;
  box-sizing: border-box;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s ease;
}

input[type="tel"]:focus {
  border-color: #6c9d8f;
  outline: none;
}


/* Responsive Design */
@media (max-width: 1240px) { /* Slightly larger than max-width to account for padding */
  .main-container {
    padding: 20px;
  }
}

@media (max-width: 1024px) {
  .settings-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .avatar-wrapper {
    position: static;
    order: -1;
  }

  .sidebar-layout {
    width: 200px; 

  .content-container {
    margin-left: 20px; 
  }  
}
}

@media (max-width: 768px) {
  .main-container {
    flex-direction: column;
    padding: 15px;
  }

  .sidebar-layout {
    width: 100%;
    margin-bottom: 20px;
  }

  .content-container {
    margin-left: 0;
  }

  .settings-section {
    padding: 15px;
  }

  .settings-content {
    padding: 16px;
  }

  .settings-grid {
    grid-template-columns: 1fr;
  }

  .avatar-preview {
    width: 120px;
    height: 120px;
  }
}

@media (max-width: 480px) {
  .main-container {
    padding: 10px;
  }

  .settings-section {
    padding: 10px;
  }

  .settings-content {
    padding: 12px;
  }

  .form-group input {
    padding: 10px 12px;
  }

  .menu-btn {
    padding: 8px 12px;
    font-size: 14px;
  }
}
  </style>