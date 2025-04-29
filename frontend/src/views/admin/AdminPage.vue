<template>
  <div class="admin-dashboard">
    <SideBar />
    
    <div class="main-content">
      <header class="dashboard-header">
        <h1>Dashboard Overview</h1>
        <div class="header-actions">
        </div>
      </header>

      <div class="dashboard-grid">
        <!-- Summary Cards -->
        <div class="summary-card revenue">
          <div class="card-content">
            <div class="card-icon">
              <img src="../../assets/admin/revenue.png" alt="Users icon" class="icon-users">
            </div>
            <div class="card-text">
              <h3>Total Revenue</h3>
              <p class="value">{{ totalRevenue }}$</p>
              <p class="change positive">
                <i class="fas fa-arrow-up"></i> 12.5% from last month
              </p>
            </div>
          </div>
        </div>

        <div class="summary-card users">
          <div class="card-content">
            <div class="card-icon">
              <img src="../../assets/admin/users.png" alt="Users icon" class="icon-users">
            </div>
            <div class="card-text">
              <h3>Total Users</h3>
              <p class="value">{{totalUsers}}</p>
              <p class="change positive">
                <i class="fas fa-arrow-up"></i> See all users
              </p>
            </div>
          </div>
        </div>

        <div class="summary-card orders">
          <div class="card-content">
            <div class="card-icon">
              <img src="../../assets/admin/oder.png" alt="Users icon" class="icon-users">
            </div>
            <div class="card-text">
              <h3>Total Orders</h3>
              <p class="value">{{ totalOrders }}</p>
              <p class="change negative">
                <i class="fas fa-arrow-down"></i> See all orders
              </p>
            </div>
          </div>
        </div>

        <div class="summary-card conversion">
          <div class="card-content">
            <div class="card-icon">
              <img src="../../assets/admin/course.png" alt="Users icon" class="icon-users">
            </div>
            <div class="card-text">
              <h3>Total courses</h3>
              <p class="value">{{ totalCourses }}</p>
              <p class="change positive">
                <i class="fas fa-arrow-up"></i> See all courses
              </p>
            </div>
          </div>
        </div>

        <!-- Recent Orders -->
        <div class="table-card">
          <div class="card-header">
            <h3>Recent Orders</h3>
            <div class="pagination-controls">
              <div class="items-per-page">
                <span>Items per page:</span>
                <select v-model="itemsPerPage" @change="fetchOrders">
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="15">15</option>
                </select>
              </div>
            </div>
          </div>
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>User</th>
                  <th>Date</th>
                  <th>Courses</th>
                  <th>Price</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="order in Orders" :key="order.id">
                  <td class="text-mono">#{{ order.id }}</td>
                  <td>
                    <div class="customer-cell">
                    <img v-if="order.user?.avatar" :src="order.user.avatar" :alt="order.user.userName" class="customer-avatar">
                    <span class="customer-name">{{ order.user?.userName || "Unknown" }}</span>
                  </div>
                  </td>
                  <td>{{ formatDate(order.createdAt) }}</td>
                  <td>
                    <span v-for="course in order.courses" :key="course.id" class="course-tag">
                     Course #{{ course.id }} : {{ course.name }}
                    </span>
                  </td>
                  <td>{{ order.totalPrice }}$</td>
                  <td>
                    <span :class="'status-badge status-' + order.status.toLowerCase()">
                      {{ capitalizeFirstLetter(order.status) }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="pagination-footer">
            <span class="showing-items">
              Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to 
              {{ Math.min(currentPage * itemsPerPage, totalOrders) }} of 
              {{ totalOrders }} entries
            </span>
            <div class="pagination-buttons">
              <button 
                @click="previousPage" 
                :disabled="currentPage === 1"
                class="pagination-button"
              >
                Previous
              </button>
              <button 
                @click="nextPage" 
                :disabled="currentPage * itemsPerPage >= totalOrders"
                class="pagination-button"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue';
import SideBar from '../../components/admin/SideBar.vue';
import { Chart, registerables } from 'chart.js';
import { userStore } from '../../store/userStore';
import { courseStore } from '../../store/courseStore';
import { orderStore } from '../../store/orderStore';
import type { IOrder} from '../../types/order';
Chart.register(...registerables);

export default defineComponent({
  methods: {
    capitalizeFirstLetter(string: string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    }
  },
  components: { SideBar },
  setup() {
    const store = userStore();
    const courses = courseStore();
    const order = orderStore();
    // Mock data for recent orders
    const totalUsers = ref(0);
    const totalCourses = ref(0);
    const totalOrders = ref(0);
    const currentPage = ref(1);
    const itemsPerPage = ref(10);
    const totalPages = computed(() => Math.ceil(totalOrders.value / itemsPerPage.value));
    const Orders = ref<IOrder[]>([])
    const fetchTotalUsers = async () => {
      await store.fetchUsersAll();
      totalUsers.value = store.numberOfUsers;
    };


    // Add pagination methods
    const nextPage = () => {
      if (currentPage.value < totalPages.value) {
        currentPage.value++;
        fetchOrders();
      }
    };

    const previousPage = () => {
      if (currentPage.value > 1) {
        currentPage.value--;
        fetchOrders();
      }
    };
    const fetchCoursses = async () => {
      await courses.fetchCoursesAll();
      totalCourses.value = courses.numberOfCourses;
    };
    const totalRevenue = computed<number>(() => {
      return Orders.value.reduce((acc, order) => order.status=="completed"?acc + order.totalPrice:acc, 0);
    });
    const fetchOrders = async () => {
      await order.fetchOrder(
        currentPage.value,
        itemsPerPage.value
      );
      Orders.value = order.Orders;
      totalOrders.value = order.Meta?.totalItems || 0;
    };
    

    const formatDate = (dateString: string) => {
      const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    };

    onMounted(() => {
      fetchTotalUsers();
      fetchCoursses();
      fetchOrders();
    });
    return {
      totalOrders,
      totalUsers,
      totalCourses,
      Orders,
      totalRevenue,
      formatDate,
      currentPage,
      itemsPerPage,
      nextPage,
      previousPage,
      fetchOrders
    };
  }
});
</script>

<style scoped>
.admin-dashboard {
  display: flex;
  min-height: 100vh;
  background-color: #f3f4f6;
}

.main-content {
  flex: 1;
  padding: 2rem;
  overflow-x: hidden;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.dashboard-header h1 {
  font-size: 1.75rem;
  font-weight: 600;
  color: #111827;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}
.pagination-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.items-per-page {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.items-per-page select {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.pagination-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-top: 1px solid #eee;
}

.pagination-buttons {
  display: flex;
  gap: 0.5rem;
}

.pagination-button {
  padding: 0.5rem 1rem;
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}

.pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-button:hover:not(:disabled) {
  background-color: #e9e9e9;
}

.showing-items {
  color: #666;
  font-size: 0.9rem;
}
.user-profile {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
}

.profile-img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn.primary {
  background-color: #4f46e5;
  color: white;
}

.btn.primary:hover {
  background-color: #4338ca;
}

.btn.small {
  padding: 0.25rem 0.75rem;
  font-size: 0.875rem;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 1.5rem;
}
.summary-card {
  grid-column: span 6;
  border-radius: 0.5rem;
  padding: 1.5rem;
  color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.summary-card.revenue {
  background: linear-gradient(135deg, #4f46e5, #8b5cf6);
}

.summary-card.users {
  background: linear-gradient(135deg, #10b981, #34d399);
}

.summary-card.orders {
  background: linear-gradient(135deg, #f59e0b, #fbbf24);
}

.summary-card.conversion {
  background: linear-gradient(135deg, #3b82f6, #60a5fa);
}

.card-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.card-text h3 {
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.25rem;
  opacity: 0.9;
}

.card-text .value {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.card-text .change {
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.change.positive {
  opacity: 0.9;
}

.change.negative {
  opacity: 0.9;
}

.chart-card {
  grid-column: span 8;
  background-color: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.pie-chart-card {
  grid-column: span 4;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.card-header h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
}

.time-filter {
  display: flex;
  gap: 0.5rem;
}

.time-filter button {
  padding: 0.25rem 0.75rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  background-color: transparent;
  border: 1px solid #e5e7eb;
  color: #6b7280;
  cursor: pointer;
}

.time-filter button.active {
  background-color: #4f46e5;
  border-color: #4f46e5;
  color: white;
}

.chart-container {
  height: 300px;
  position: relative;
}

.chart-container.pie {
  height: 250px;
}

.table-card {
  grid-column: span 12;
  background-color: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.activity-card {
  grid-column: span 4;
  background-color: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.table-container {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 0.75rem 1rem;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
  white-space: nowrap;
}

th {
  font-size: 0.75rem;
  font-weight: 500;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.customer-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.customer-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge.completed {
  background-color: #ecfdf5;
  color: #059669;
}

.status-badge.processing {
  background-color: #eff6ff;
  color: #1d4ed8;
}

.status-badge.pending {
  background-color: #fef3c7;
  color: #b45309;
}

.action-btn {
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.activity-item {
  display: flex;
  gap: 1rem;
}

.activity-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
}
.course-tag {
  display: inline-block;
  background: #f0f0f0;
  border-radius: 4px;
  padding: 2px 6px;
  margin: 2px;
  font-size: 0.8em;
}

.customer-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.customer-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8em;
  font-weight: 500;
}

.status-pending {
  background: #fff3cd;
  color: #856404;
}

.status-completed {
  background: #d4edda;
  color: #155724;
}

.status-cancelled {
  background: #f8d7da;
  color: #721c24;
}

/* Add other status colors as needed */
.course-tag {
  display: inline-block;
  background: #f0f0f0;
  border-radius: 4px;
  padding: 2px 6px;
  margin: 2px;
  font-size: 0.8em;
}

.customer-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.customer-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8em;
  font-weight: 500;
}

.status-pending {
  background: #fff3cd;
  color: #856404;
}

.status-completed {
  background: #d4edda;
  color: #155724;
}

.status-cancelled {
  background: #f8d7da;
  color: #721c24;
}

/* Add other status colors as needed */
.activity-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.activity-content {
  flex: 1;
}

.activity-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.25rem;
}

.user-name {
  font-weight: 500;
  color: #111827;
}

.activity-time {
  font-size: 0.75rem;
  color: #6b7280;
}

.activity-text {
  font-size: 0.875rem;
  color: #4b5563;
  line-height: 1.5;
}
.icon-users{
  width: 35px;
  height: 35px;
}
.icon-users{
  width: 35px;
  height: 35px;
}

/* Responsive adjustments */
@media (max-width: 1600px) {
  .summary-card {
    grid-column: span 6;
  }
  
  .chart-card {
    grid-column: span 12;
  }
  
  .table-card, .activity-card {
    grid-column: span 12;
  }
}

@media (max-width: 1024px) {
  .summary-card {
    grid-column: span 12;
  }
}
</style>