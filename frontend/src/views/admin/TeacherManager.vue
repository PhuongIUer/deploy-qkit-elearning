<template>
  <div class="teacher-container">
    <SideBar/>
    <div class="teacher-management">
      <h1>Teacher Management</h1>
      <button @click="fetchApplications" class="reload-button" :disabled="isLoading">
            <span v-if="!isLoading">Reload Data</span>
            <span v-else>Loading...</span>
      </button>
      <div class="search-box">
          <svg class="search-icon" viewBox="0 0 24 24" width="18" height="18">
            <path fill="currentColor" d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 0 0 1.48-5.34c-.47-2.78-2.79-5-5.59-5.34a6.505 6.505 0 0 0-7.27 7.27c.34 2.8 2.56 5.12 5.34 5.59a6.5 6.5 0 0 0 5.34-1.48l.27.28v.79l4.25 4.25c.41.41 1.08.41 1.49 0 .41-.41.41-1.08 0-1.49L15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Search users..."
            class="search-input"
          />
        </div>

      <div v-if="isLoading" class="loading">Loading applications...</div>
      <div v-if="error" class="error">{{ error }}</div>
      <div class="table-container">
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
            <td >
            <span :class="{
              'status-pending': application.status === 'pending',
              'status-approved': application.status === 'approved',
              'status-rejected': application.status === 'rejected'
            }">{{ capitalizeFirstLetter(application.status )}}</span>
              
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
    </div>
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
      baseURL: 'http://localhost:3000/api',
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
      }finally{
        fetchApplications()
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
      }finally{
        fetchApplications()
      }
    };

    onMounted(() => {
      fetchApplications();
    });

    return {
      fetchApplications,
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
.search-box {
  position: relative;
  flex: 1;
  min-width: 250px;
}
.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
}
.search-input {
  width: 100%;
  padding: 0.625rem 1rem 0.625rem 2.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.95rem;
  background-color: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: border-color 0.2s, box-shadow 0.2s;
}

.table-container {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  margin-bottom: 2rem;
  background-color: #fff;
  overflow-x: auto;
}

.user-table {
  width: 100%;
  border-collapse: collapse;
}
.user-table th {
  background-color: #f1f5f9;
  color: #334155;
  font-weight: 600;
  text-align: center;
  padding: 1rem;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}


.user-table th {
  background-color: #f8fafc;
  color: #334155;
  font-weight: 600;
  text-align: center;
  padding: 1rem;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  position: sticky;
  top: 0;
  z-index: 10;
}

.user-table td {
  text-align: center ;
  padding: 1rem;
  border-top: 1px solid #e2e8f0;
  color: #334155;
  font-size: 0.95rem;
}

.user-table tr:not(:last-child) td {
  border-bottom: 1px solid #f1f5f9;
}

.user-table tr:hover td {
  background-color: #f8fafc;
}

/* Status badges */
.status-pending,
.status-approved,
.status-rejected {
  display: inline-block;
  padding: 0.35rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-pending {
  background-color: #fffbeb;
  color: #b45309;
}

.status-approved {
  background-color: #ecfdf5;
  color: #065f46;
}

.status-rejected {
  background-color: #fef2f2;
  color: #b91c1c;
}

/* Role badges */
.role-admin,
.role-teacher,
.role-student,
.role-default {
  display: inline-block;
  padding: 0.35rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 500;
}

.role-admin {
  background-color: #fef2f2;
  color: #b91c1c;
}

.role-teacher {
  background-color: #eff6ff;
  color: #1d4ed8;
}

.role-student {
  background-color: #ecfdf5;
  color: #065f46;
}

.role-default {
  background-color: #f8fafc;
  color: #64748b;
}

/* Button styles */
.details-btn,
.approve-btn,
.disapprove-btn {
  display: inline-block;
  padding: 0.35rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 500;
  align-content: center;
}

.details-btn {
  background-color: #e0f2fe;
  color: #0369a1;
}

.details-btn:hover {
  background-color: #bae6fd;
}

.approve-btn {
  background-color: #dcfce7;
  color: #166534;
}

.approve-btn:hover {
  background-color: #bbf7d0;
}

.disapprove-btn {
  background-color: #fee2e2;
  color: #b91c1c;
}

.disapprove-btn:hover {
  background-color: #fecaca;
}

.loading, 
.error {
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
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
  animation: fadeIn 0.3s ease-out;
}

.modal-content {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 2rem;
  position: relative;
  animation: slideUp 0.3s ease-out;
}

.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.8rem;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.close-btn:hover {
  color: #1f2937;
  background-color: #f3f4f6;
  transform: scale(1.1);
}

h2 {
  color: #111827;
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.detail-section {
  margin-bottom: 1.8rem;
  padding: 1.2rem;
  background-color: #f9fafb;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.detail-section h3 {
  color: #111827;
  font-size: 1.2rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
}

.detail-section h3::before {
  content: "";
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #3b82f6;
  margin-right: 8px;
}

.detail-section p {
  color: #4b5563;
  margin: 0.6rem 0;
  line-height: 1.6;
  display: flex;
  flex-wrap: wrap;
}

.detail-section strong {
  color: #111827;
  min-width: 120px;
  display: inline-block;
  font-weight: 500;
}

.detail-section a {
  color: #3b82f6;
  text-decoration: none;
  transition: all 0.2s;
  word-break: break-all;
}

.detail-section a:hover {
  color: #2563eb;
  text-decoration: underline;
}

.detail-section ul {
  list-style-type: none;
  padding: 0;
  margin: 0.8rem 0 0;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.detail-section li {
  background-color: #e0e7ff;
  color: #3b82f6;
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
}
.reload-button{
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  background-color: #e0f2fe;
  color: #0369a1;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  justify-content: center;
}
.reload-button:hover {
  background-color: #bae6fd;
  transform: translateY(-1px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
}
.reload-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.modal-actions button {
  padding: 0.7rem 1.5rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  font-size: 1rem;
}

.modal-approve-btn {
  background-color: #10b981;
  color: white;
}

.modal-approve-btn:hover {
  background-color: #059669;
  transform: translateY(-1px);
}

.modal-disapprove-btn {
  background-color: #f9fafb;
  color: #ef4444;
  border: 1px solid #ef4444 !important;
}

.modal-disapprove-btn:hover {
  background-color: #fee2e2;
  transform: translateY(-1px);
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(20px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .user-table {
    display: block;
    overflow-x: auto;
  }
  
  .teacher-management {
    padding: 10px;
  }
  
  .modal-content {
    width: 95%;
    padding: 1.5rem;
  }
  
  .detail-section {
    padding: 1rem;
  }
  
  .detail-section strong {
    min-width: 100%;
    margin-bottom: 0.2rem;
  }
  
  .modal-actions {
    flex-direction: column;
    gap: 0.8rem;
  }
  
  .modal-actions button {
    width: 100%;
  }
}
</style>