import { defineStore } from 'pinia';
import axios from 'axios';
import { computed, ref } from 'vue';
import defaultAvatar from "../assets/ava.jpg";

export const useAuthStore = defineStore('auth', () => {
  const isLoggedIn = ref(false);
  const isBlocked = ref(false);
  const userId = ref(null);
  const userName = ref('');
  const userAvatar = ref(defaultAvatar);
  const userEmail = ref('');
  const email = ref('');
  const role = ref({ id: null, name: '' });
  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        isLoggedIn.value = false;
        return;
      }

      const response = await axios.get('http://localhost:3000/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        const userData = response.data;
        userId.value = userData.id || null;
        userName.value = userData.userName || '';
        userAvatar.value = userData.avatar || defaultAvatar;
        email.value = userData.email || '';
        role.value = userData.role || { id: null, name: '' };
        localStorage.setItem('userAvatar', userAvatar.value);
        localStorage.setItem('userName', userName.value);
        isLoggedIn.value = true;
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      isLoggedIn.value = false;
    }
  };
  const isAdmin = computed(() => {
    return role.value.name === 'admin';
  });
  const isTeacher = computed(() => {
    return role.value.name === 'teacher';
  });
  const logout = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/auth/logout', {
        method: 'POST',
        headers: {
          'Accept': '*/*',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
  
      if (response.ok) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        isLoggedIn.value = false;
        userId.value = null;
        userName.value = '';
        userAvatar.value = defaultAvatar;
        userEmail.value = '';
        email.value = '';
        role.value = { id: null, name: '' };
        console.log('Logout successful');
      } else {
        console.error('Logout failed:', response.statusText);
      }
    } catch (error) {
      console.error('Error during logout:', error);
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
      isLoggedIn.value = false;
      userId.value = null;
      userName.value = '';
      userAvatar.value = defaultAvatar;
      userEmail.value = '';
      email.value = '';
      role.value = { id: null, name: '' };
    }
  };

  return { 
    isLoggedIn, 
    userId, 
    userName, 
    userAvatar, 
    email, 
    role, 
    isAdmin,
    isTeacher,
    isBlocked,
    userEmail,
    fetchUserProfile, 
    logout,
  };
});
