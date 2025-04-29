<template>
  <div class="teacher-container">
    <SideBar/>
    <div class="teacher-management">
      <h1>Teacher Management</h1>
      
      <div class="search-container">
        <input 
          v-model="searchQuery" 
          @input="debouncedSearch" 
          placeholder="Search by name or email..." 
          class="search-input"
        />
      </div>
      
      <div v-if="isLoading" class="loading">Loading applications...</div>
      <div v-if="error" class="error">{{ error }}</div>
      
      <table class="user-table" v-if="!isLoading && !error">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="application in filteredApplications" :key="application.id">
            <td>{{ application.id }}</td>
            <td>{{ application.name }}</td>
            <td>{{ application.user.email }}</td>
            <td class="role-user">
              <span :class="roleClass(application.user.role.name)">
                {{ capitalizeFirstLetter(application.user.role.name)}}
              </span>
            </td>
            <td :class="{
              'status-pending': application.status === 'pending',
              'status-approved': application.status === 'approved',
              'status-disapproved': application.status === 'disapproved'
            }">
              {{ capitalizeFirstLetter(application.status )}}
            </td>
            <td>
              <button @click="showDetails(application)" class="details-btn">View Details</button>
              <button 
                v-if="application.status === 'pending'" 
                @click="approveApplication(application.id)" 
                class="approve-btn"
              >
                Approve
              </button>
              <button 
                v-if="application.status === 'pending'" 
                @click="disapproveApplication(application.id)" 
                class="disapprove-btn"
              >
                Disapprove
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      
      <!-- Details Modal -->
      <div v-if="selectedApplication" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content">
          <button class="close-btn" @click="closeModal">×</button>
          <h2>Application Details</h2>
          
          <div class="detail-section">
            <h3>Basic Information</h3>
            <p><strong>ID:</strong> {{ selectedApplication.id }}</p>
            <p><strong>Name:</strong> {{ selectedApplication.name }}</p>
            <p><strong>Email:</strong> {{ selectedApplication.user.email }}</p>
            <p><strong>Username:</strong> {{ selectedApplication.user.userName }}</p>
            <p><strong>Role:</strong> {{ selectedApplication.user.role.name }}</p>
            <p><strong>Status:</strong> {{ selectedApplication.status }}</p>
          </div>
          
          <div class="detail-section">
            <h3>Contact Information</h3>
            <p><strong>Phone:</strong> {{ selectedApplication.phone }}</p>
            <p><strong>Facebook:</strong> 
              <a :href="selectedApplication.facebook" target="_blank">{{ selectedApplication.facebook }}</a>
            </p>
            <p><strong>CV:</strong> 
              <a :href="selectedApplication.cv" target="_blank" v-if="selectedApplication.cv">View CV</a>
              <span v-else>Not provided</span>
            </p>
          </div>
          
          <div class="detail-section">
            <h3>Description</h3>
            <p>{{ selectedApplication.description }}</p>
          </div>
          
          <div class="detail-section" v-if="selectedApplication.fields.length > 0">
            <h3>Fields of Interest</h3>
            <ul>
              <li v-for="field in selectedApplication.fields" :key="field.id">{{ field.name }}</li>
            </ul>
          </div>
          
          <div class="modal-actions" v-if="selectedApplication.status === 'pending'">
            <button @click="approveApplication(selectedApplication.id)" class="approve-btn modal-approve-btn">
              Approve
            </button>
            <button @click="disapproveApplication(selectedApplication.id)" class="disapprove-btn modal-disapprove-btn">
              Disapprove
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import axios from 'axios';
import { debounce } from 'lodash-es';
import SideBar from '../../components/admin/SideBar.vue';

interface Role {
  id: number;
  name: string;
}

interface User {
  id: number;
  email: string;
  userName: string;
  role: Role;
}

interface Field {
  id: number;
  name: string;
}

interface Application {
  id: number;
  name: string;
  phone: string;
  facebook: string;
  userId: number;
  cv: string;
  description: string;
  status: string;
  fields: Field[];
  user: User;
}

export default defineComponent({
  components: { SideBar },
  name: 'ApplicationManagement',
  methods: {
    capitalizeFirstLetter(string: string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    }
  },
  setup() {
    const applications = ref<Application[]>([]);
    const searchQuery = ref('');
    const selectedApplication = ref<Application | null>(null);
    const isLoading = ref(false);
    const error = ref('');
    const api = axios.create({
      baseURL: 'http://14.225.217.42:5000/api',
    });
    api.interceptors.request.use((config) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
    const fetchApplications = async () => {
      try {
        isLoading.value = true;
        error.value = '';
        const response = await api.get<Application>('/applications', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        applications.value = response.data;
      } catch (err) {
        error.value = 'Failed to fetch applications';
        console.error('Error fetching applications:', err);
      } finally {
        isLoading.value = false;
      }
    };

    const filteredApplications = computed(() => {
      const query = searchQuery.value.toLowerCase();
      return applications.value.filter(app => 
        app.name.toLowerCase().includes(query) || 
        app.user.email.toLowerCase().includes(query)
      );
    });

    const debouncedSearch = debounce(() => {}, 300);

    const showDetails = (application: Application) => {
      selectedApplication.value = application;
    };

    const closeModal = () => {
      selectedApplication.value = null;
    };
    const roleClass = (roleName: string) => {
      switch(roleName.toLowerCase()) {
        case 'admin': return 'role-admin';
        case 'teacher': return 'role-teacher';
        case 'student': return 'role-student';
        default: return 'role-default';
      }
  };
    const approveApplication = async (id: number) => {
      try {
        const response = await api.post(`/applications/${id}/approve`, {}, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        // Update local data
        const index = applications.value.findIndex(app => app.id === id);
        if (index !== -1) {
          applications.value[index] = response.data;
        }
        
        if (selectedApplication.value && selectedApplication.value.id === id) {
          selectedApplication.value = response.data;
        }
      } catch (err) {
        error.value = 'Failed to approve application';
        console.error('Error approving application:', err);
      }
    };

    const disapproveApplication = async (id: number) => {
      try {
        const response = await api.post(`/applications/${id}/reject`, {}, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        // Update local data
        const index = applications.value.findIndex(app => app.id === id);
        if (index !== -1) {
          applications.value[index] = response.data;
        }
        
        if (selectedApplication.value && selectedApplication.value.id === id) {
          selectedApplication.value = response.data;
        }
      } catch (err) {
        error.value = 'Failed to disapprove application';
        console.error('Error disapproving application:', err);
      }
    };

    onMounted(() => {
      fetchApplications();
    });

    return {
      applications,
      searchQuery,
      filteredApplications,
      selectedApplication,
      isLoading,
      error,
      debouncedSearch,
      roleClass,
      showDetails,
      closeModal,
      approveApplication,
      disapproveApplication
    };
  },
});
</script>

<style scoped>
.teacher-container {
  display: flex;
  min-height: 100vh;
  background-color: #F5F6FA;
}

.teacher-management {
  flex: 1;
  padding: 20px;
  font-family: Arial, sans-serif;
  max-width: 1000px;
  margin: 0 auto;
}

h1 {
  color: #2c3e50;
  margin-bottom: 20px;
}

.search-container {
  margin-bottom: 20px;
}

.search-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.user-table {
  width: 100%;
  border-collapse: collapse;
  background-color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.user-table th, .user-table td {
  padding: 12px 15px;
  text-align: center;
  border-bottom: 1px solid #ddd;
}

.user-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #2c3e50;
}

.user-table tr:hover {
  background-color: #f5f5f5;
}

.status-pending {   
  color: #ff9800;
  font-weight: bold;
}

.status-approved {
  color: #4caf50;
  font-weight: bold;
}

.status-disapproved {
  color: #f44336;
  font-weight: bold;
}

.details-btn {
  background-color: #2196f3;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 5px;
  transition: background-color 0.3s;
}

.details-btn:hover {
  background-color: #0b7dda;
}
role-admin {
  color: #ff4444; /* Red for admin */
  font-weight: bold;
}

.role-teacher {
  color: #4285f4; /* Blue for teacher */
  font-weight: bold;
}

.role-student {
  color: #00c851; /* Green for student */
  font-weight: bold;
}

.role-default {
  color: #6c757d; /* Gray for other roles */
}
.approve-btn {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 5px;
  transition: background-color 0.3s;
}

.approve-btn:hover {
  background-color: #3e8e41;
}

.disapprove-btn {
  background-color: #f44336;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.disapprove-btn:hover {
  background-color: #d32f2f;
}

.loading, .error {
  padding: 15px;
  margin: 20px 0;
  border-radius: 4px;
}

.loading {
  background-color: #e3f2fd;
  color: #1976d2;
}

.error {
  background-color: #ffebee;
  color: #d32f2f;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 25px;
  border-radius: 8px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
}

.close-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  font-size: 24px;
  background: none;
  border: none;
  cursor: pointer;
  color: #777;
}

.detail-section {
  margin-bottom: 20px;
}

.detail-section h3 {
  color: #2c3e50;
  margin-bottom: 10px;
  border-bottom: 1px solid #eee;
  padding-bottom: 5px;
}

.detail-section p, .detail-section ul {
  margin-bottom: 8px;
}

.modal-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.modal-approve-btn, .modal-disapprove-btn {
  padding: 10px 15px;
  flex: 1;
}

@media (max-width: 768px) {
  .user-table {
    display: block;
    overflow-x: auto;
  }
  
  .teacher-management {
    padding: 10px;
  }
  
  .modal-actions {
    flex-direction: column;
  }
}
</style>