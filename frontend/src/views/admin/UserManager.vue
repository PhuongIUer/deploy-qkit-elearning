<template>
  <div class="user-container">
    <SideBar></SideBar>
    <div class="user-management">
      <div class="header-section">
        <h1>User Management</h1>
        <p class="subtitle">Manage user accounts, roles, and permissions</p>
      </div>
      
      <!-- Search and Filter Controls -->
      <div class="controls">
        <div class="search-box">
          <svg class="search-icon" viewBox="0 0 24 24" width="18" height="18">
            <path fill="currentColor" d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 0 0 1.48-5.34c-.47-2.78-2.79-5-5.59-5.34a6.505 6.505 0 0 0-7.27 7.27c.34 2.8 2.56 5.12 5.34 5.59a6.5 6.5 0 0 0 5.34-1.48l.27.28v.79l4.25 4.25c.41.41 1.08.41 1.49 0 .41-.41.41-1.08 0-1.49L15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Search users..."
            @input="handleSearch"
            class="search-input"
          />
        </div>
        
        <div class="filter-box">
          <label for="role-filter">Filter by Role:</label>
          <select
            id="role-filter"
            v-model="roleFilter"
            @change="applyFilters"
            class="filter-select"
          >
            <option value="">All Roles</option>
            <option v-for="role in roles" :key="role.id" :value="role.id">
              {{ role.name }}
            </option>
          </select>
        </div>
      </div>
      
      <!-- Loading state -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading users...</p>
      </div>
      
      <!-- Error state -->
      <div v-else-if="error" class="error-state">
        <svg viewBox="0 0 24 24" width="24" height="24" class="error-icon">
          <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
        </svg>
        <div>
          <p class="error-message">Error loading users: {{ error }}</p>
          <button @click="fetchUsers" class="retry-button">
            Retry
          </button>
        </div>
      </div>
      
      <!-- Data loaded state -->
      <div v-else>
        <!-- User table -->
        <div class="table-container">
          {{  }}
          <table class="user-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Verification</th>
                <th>State</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in filteredUsers" :key="user.id">
                <td>{{ user.id }}</td>
                <td>{{ user.userName }}</td>
                <td class="email">{{ user.email }}</td>
                <td class="role-user">
                  <span :class="roleClass(user.role.name)">
                    {{ user.role.name.toUpperCase() }}
                  </span>
                </td>
                <td class="verification">
                  <span :class="isVerified(user.isVerified)">
                    {{ isVerified(user.isVerified) }}
                  </span>
                </td>
                <td class="status">
                  <span :class="isActive(user.isBlocked)">
                    {{ isActive(user.isBlocked) }}
                  </span>
                </td>
                <td>
                  <button 
                    @click="openEditModal(user)"
                    class="edit-button"
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" class="edit-icon">
                      <path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                    </svg>
                     Edit
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination Controls -->
        <div class="pagination-controls">
          <div class="page-size-selector">
            <label for="items-per-page">Items per page:</label>
            <select
              id="items-per-page"
              v-model="itemsPerPage"
              @change="handlePageSizeChange"
              class="page-size-select"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
              <option value="20">20</option>
            </select>
          </div>
          
          <div class="page-navigation">
            <button
              @click="prevPage"
              :disabled="currentPage === 1 || loading"
              class="page-button prev-button"
            >
              <svg viewBox="0 0 24 24" width="16" height="16">
                <path fill="currentColor" d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z"/>
              </svg>
              Previous
            </button>
            <span class="page-info">
              Page {{ currentPage }} of {{ totalPages }}
            </span>
            <button
              @click="nextPage"
              :disabled="currentPage === totalPages || loading"
              class="page-button next-button"
            >
              Next
              <svg viewBox="0 0 24 24" width="16" height="16">
                <path fill="currentColor" d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Edit User Modal -->
        <div v-if="showEditModal" class="modal-overlay" @click.self="closeEditModal">
          <div class="modal-content">
            <div class="modal-header">
              <h2>Edit User Profile</h2>
              <button @click="closeEditModal" class="close-button">
              </button>
            </div>
            <form @submit.prevent="updateUser" class="modal-form">
              <div class="form-group">
                <label for="userName">Username:</label>
                <input
                  id="userName"
                  v-model="editForm.userName"
                  type="text"
                  required
                  class="form-input"
                />
              </div>
              
              <div class="form-group">
                <label for="role">Role:</label>
                <select
                  id="role"
                  v-model="editForm.roleId"
                  required
                  class="form-select"
                >
                  <option v-for="role in roles" :key="role.id" :value="role.id">
                    {{ role.name }}
                  </option>
                </select>
              </div>
              
              <div class="form-group">
                <label for="isBlocked">State:</label>
                <select
                  id="isBlocked"
                  v-model="editForm.isBlocked"
                  required
                  class="form-select"
                >
                  <option v-for="state in status" :key="state.state" :value="state.isBlocked">
                    {{ state.state }}
                  </option>
                </select>
              </div>
              <div class="form-actions">
                <button type="button" @click="closeEditModal" class="cancel-button">
                  Cancel
                </button>
                <button type="submit" :disabled="updating" class="save-button">
                  <span v-if="updating" class="button-loader"></span>
                  {{ updating ? 'Saving...' : 'Save Changes' }}
                </button>
              </div>
            </form>
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
import type { IUser, Role, State } from '@/types/user';
import type { Meta } from '../../types/index';


interface ApiResponse {
    items: IUser[]
    meta: Meta
  }

interface EditForm {
  id: number | null;
  userName: string;
  roleId: number;
  isBlocked: boolean;
}

export default defineComponent({
  components: { SideBar },
  name: 'UserManagement',
  setup() {
    // Raw API data
        // Create axios instance with base URL
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
    
    const apiData = ref<IUser[]>([]);
    const loading = ref(true);
    const error = ref<string | null>(null);
    const updating = ref(false);
    const showEditModal = ref(false);
    const editForm = ref<EditForm>({
      id: null,
      userName: '',
      roleId: 0,
      isBlocked: false
    });

    // Pagination
    const currentPage = ref(1);
    const itemsPerPage = ref(10);
    const totalItems = ref(0);
    const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value));

    // Search and filter
    const searchQuery = ref('');
    const roleFilter = ref('');
    const debouncedSearch = debounce(() => applyFilters(), 300);

    // Available roles
    const roles = ref<Role[]>([
      { id: 1, name: 'Admin' },
      { id: 2, name: 'Teacher' },
      { id: 3, name: 'Student' }
    ]);
    const status = ref<State[]>([
      { isBlocked: true, state: 'Blocked' },
      { isBlocked: false, state: 'Active' }
    ])

    
    const roleClass = (roleName: string) => {
  switch(roleName.toLowerCase()) {
    case 'admin': return 'role-admin';
    case 'teacher': return 'role-teacher';
    case 'student': return 'role-student';
    default: return 'role-default';
  }
};
  const transformedUsers = computed(() => {
  const rolePriority = {
    'admin': 1,
    'teacher': 2,
    'student': 3
  };
  return apiData.value
    .map(user => ({
      id: user.id,
      userName: user.userName,
      email: user.email,
      role: {
        id: user.role.id,
        name: user.role.name
      },
      isBlocked: user.isBlocked,
      isVerified: user.isVerified,
    }))
    .sort((a, b) => {
      const priorityA = rolePriority[a.role.name.toLowerCase()] || 4; 
      const priorityB = rolePriority[b.role.name.toLowerCase()] || 4; 
      return priorityA - priorityB;
    });
});
    const isActive = (isBlocked: boolean) =>{
      if(!isBlocked) return 'Active'
      return 'Blocked'
    };
    const isVerified = (isVerified: boolean) =>{
      if(isVerified) return 'Verified'
      return 'Non-Verify'
    };
    const filteredUsers = computed(() => {
      let result = transformedUsers.value;
      
      // Apply role filter
      if (roleFilter.value) {
        result = result.filter(user => user.role.id === Number(roleFilter.value));
      }
      
      // Apply search query
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        result = result.filter(user => 
          user.userName.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          user.role.name.toLowerCase().includes(query)
        );
      }
      
      return result;
    });
    const totalUsers = ref
    // Fetch users from API with pagination
    const fetchUsers = async () => {
      try {
        loading.value = true;
        error.value = null;
        
        const response = await api.get<ApiResponse>(
          `/users?page=${currentPage.value}&limit=${itemsPerPage.value}`
        );
        apiData.value = response.data.items;
        totalItems.value = response.data.meta.totalItems;
      } catch (err) {
        error.value = axios.isAxiosError(err) 
          ? err.response?.data?.message || err.message 
          : 'Unknown error occurred';
        console.error('Error fetching users:', err);
      } finally {
        loading.value = false;
      }
    };

    // Handle page size change
    const handlePageSizeChange = () => {
      currentPage.value = 1; // Reset to first page when changing page size
      fetchUsers();
    };

    // Navigate to previous page
    const prevPage = () => {
      if (currentPage.value > 1) {
        currentPage.value--;
        fetchUsers();
      }
    };

    // Navigate to next page
    const nextPage = () => {

        currentPage.value++;
        fetchUsers();
      
    };

    // Handle search input with debounce
    const handleSearch = () => {
      debouncedSearch();
    };

    // Apply both filters
    const applyFilters = () => {
      // Computed property handles the filtering automatically
    };

    // Open edit modal with user data
    const openEditModal = (user: any) => {
      editForm.value = {
        id: user.id,
        userName: user.userName,
        roleId: user.role.id,
        isBlocked: user.isBlocked,
      };
      showEditModal.value = true;
    };

    // Close edit modal
    const closeEditModal = () => {
      showEditModal.value = false;
      editForm.value = {
        id: null,
        userName: '',
        roleId: 0,
        isBlocked: false,
      };
    };
    
    // Update user profile and role
    const updateUser = async () => {
      if (!editForm.value.id) return;

      try {
        updating.value = true;
        
        // Update profile (username)
        await api.patch(
          `/users/${editForm.value.id}/profile`,
          {
            userName: editForm.value.userName
          }
        );

        // Update role
        await api.patch(
          `/users/${editForm.value.id}/role`,
          {
            roleId: editForm.value.roleId
          }
        );
        await api.patch(
          `/users/${editForm.value.id}/block`,
          {
            isBlocked: editForm.value.isBlocked
          }
        );
        // Refresh user data
        await fetchUsers();
        closeEditModal();
      } catch (err) {
        error.value = axios.isAxiosError(err) 
          ? err.response?.data?.message || err.message 
          : 'Failed to update user';
        console.error('Error updating user:', err);
      } finally {
        updating.value = false;
      }
    };

    // Fetch users when component mounts
    onMounted(() => {
      fetchUsers();
    });

    return {
        loading,
      error,
      updating,
      showEditModal,
      editForm,
      roles,
      status,
      searchQuery,
      roleFilter,
      currentPage,
      itemsPerPage,
      totalPages,
      transformedUsers,
      filteredUsers,
      isVerified,
      isActive,
      roleClass,
      fetchUsers,
      handlePageSizeChange,
      prevPage,
      nextPage,
      handleSearch,
      applyFilters,
      openEditModal,
      closeEditModal,
      updateUser,
    };
  },
});
</script>

<style scoped>
.user-container {
  display: flex;
  min-height: 100vh;
  background-color: #f8fafc;
}

.user-management {
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.header-section {
  margin-bottom: 1.5rem;
}

.header-section h1 {
  font-size: 1.8rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.25rem;
}

.subtitle {
  color: #64748b;
  font-size: 0.95rem;
}

.controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  align-items: center;
  flex-wrap: wrap;
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

.search-input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.filter-box {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.filter-box label {
  font-weight: 500;
  color: #475569;
  font-size: 0.95rem;
}

.filter-select {
  padding: 0.625rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.95rem;
  background-color: #fff;
  cursor: pointer;
  transition: border-color 0.2s;
}

.filter-select:focus {
  outline: none;
  border-color: #6366f1;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  gap: 1rem;
}

.spinner {
  width: 2.5rem;
  height: 2.5rem;
  border: 3px solid #e2e8f0;
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-state {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background-color: #fef2f2;
  border-radius: 6px;
  color: #b91c1c;
}

.error-icon {
  flex-shrink: 0;
}

.error-message {
  margin-bottom: 0.75rem;
}

.retry-button {
  padding: 0.5rem 1rem;
  background-color: #dc2626;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.retry-button:hover {
  background-color: #b91c1c;
}

.table-container {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  margin-bottom: 1.5rem;
  background-color: #fff;
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

.user-table td {
  text-align: center ;
  padding: 1rem;
  border-top: 1px solid #e2e8f0;
  color: #334155;
  font-size: 0.95rem;
}

.user-table tr:hover {
  background-color: #f8fafc;
}

/* Badge styles */
.role-user span,
.verification span,
.status span {
  display: inline-block;
  padding: 0.35rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 500;
  text-align: right;
}

.role-user .role-admin {
  background-color: #e0e7ff;
  color: #4338ca;
}

.role-user .role-teacher {
  background-color: #dbeafe;
  color: #1d4ed8;
}

.role-user .role-student {
  background-color: #dcfce7;
  color: #166534;
}

.verification .Verified {
  background-color: #dcfce7;
  color: #166534;
}

.verification .Non-Verify {
  background-color: #fee2e2;
  color: #b91c1c;
}

.status .Active {
  background-color: #dcfce7;
  color: #166534;
}

.status .Blocked {
  background-color: #fee2e2;
  color: #b91c1c;
}

.edit-button{
  display: inline-block;
  padding: 0.35rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 500;
  text-align: right;
  background-color: #e0f2fe;
  color: #1d4ed8;
  align-items: center;
  transition: background-color 0.2s, color 0.2s;
}

.edit-button:hover {
  background-color: #c7d2fe;
}

.edit-icon {
  fill: currentColor;
}

.pagination-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 1rem 0;
}

.page-size-selector {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.page-size-selector label {
  font-size: 0.9rem;
  color: #64748b;
}

.page-size-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 0.9rem;
}

.page-navigation {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.page-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: #f1f5f9;
  color: #334155;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.page-button:hover:not(:disabled) {
  background-color: #e2e8f0;
}

.page-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.page-info {
  font-size: 0.9rem;
  color: #64748b;
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
  backdrop-filter: blur(2px);
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
  color: #1e293b;
}

.close-button {
  background: none;
  border: none;
  padding: 0.25rem;
  cursor: pointer;
  color: #64748b;
  transition: color 0.2s;
}

.close-button:hover {
  color: #475569;
}

.modal-form {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: #475569;
  font-weight: 500;
}

.form-input,
.form-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.95rem;
  transition: border-color 0.2s;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #6366f1;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.cancel-button {
  padding: 0.75rem 1.25rem;
  background-color: #f1f5f9;
  color: #475569;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.cancel-button:hover {
  background-color: #e2e8f0;
}

.save-button {
  position: relative;
  padding: 0.75rem 1.25rem;
  background-color: #6366f1;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.save-button:hover:not(:disabled) {
  background-color: #4f46e5;
}

.save-button:disabled {
  background-color: #a5b4fc;
  cursor: not-allowed;
}

.button-loader {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
  margin-right: 0.5rem;
}

@media (max-width: 768px) {
  .controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-box {
    min-width: auto;
  }
  
  .pagination-controls {
    flex-direction: column-reverse;
    align-items: stretch;
    gap: 1rem;
  }
  
  .page-navigation {
    justify-content: space-between;
  }
}
</style>