<template>
  <div class="content-sidebar">
  <div class="sidebar">
    <ul>
      <li :class="{ active: isActive('/admin') }">
        <router-link to="/admin">
          <img src="../../assets/home-black.png" alt="Dashboard" class="icon" />
          <span>Dashboard</span>
        </router-link>
      </li>
      <li :class="{ active: isActive('/usersmanager') }">
        <router-link to="/usersmanager">
          <img src="../../assets/users-black.png" alt="Users Management" class="icon" />
          <span>Users</span>
        </router-link>
      </li>
      <li :class="{ active: isActive('/teachersmanager') }">
        <router-link to="/teachersmanager">
          <img src="../../assets/teachers-black.png" alt="Teacher Management" class="icon" />
          <span>Teachers</span>
        </router-link>
      </li>
      <li :class="{ active: isActive('/coursesmanager') }">
        <router-link to="/coursesmanager">
          <img src="../../assets/courses-black.png" alt="Course Management" class="icon" />
          <span>Courses</span>
        </router-link>
      </li>
    </ul>
  </div>
</div>
</template>

<script>
export default {
  methods: {
    isActive(route) {
      return this.$route.path === route;
    },
  },
};
</script>

<style scoped>
.content-sidebar{
  width: 250px;
  height: 500px;

}
.sidebar {
  position: relative;
  left: 10px;
  top: 20px;
  width: 250px;
  height: 250px;
  color: black;
  box-shadow: 6px 0 20px rgba(0, 0, 0, 0.2);
  align-content: center;
  background: #ffffff;
  color: #333;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  z-index: 100;
  border-radius: 3%;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.sidebar-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.sidebar ul {
  list-style: none;
  padding: 15px 0;
  margin: 0;
}

.sidebar li {
  margin: 5px 15px;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.sidebar li a {
  color: #555;
  text-decoration: none;
  display: flex;
  align-items: center;
  padding: 12px 15px;
  font-size: 15px;
  font-weight: 500;
}

.sidebar li:hover {
  background: #f5f5f5;
}

.sidebar li.active {
  background: #1abc9c;
}

.sidebar li.active a {
  color: white;
}

.sidebar li.active .icon {
  filter: brightness(0) invert(1);
}

.icon {
  width: 18px;
  height: 18px;
  margin-right: 12px;
}

span {
  flex-grow: 1;
}
</style>