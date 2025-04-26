<template>
  <div class="sidebar">
    <ul>
      <li :class="{ active: isActive('/admin') }">
        <router-link to="/admin">
          <img src="../../assets/home-black.png" alt="Dashboard" class="icon" />
          Dashboard
        </router-link>
      </li>
      <li :class="{ active: isActive('/usersmanager') }">
        <router-link to="/usersmanager">
          <img src="../../assets/users-black.png" alt="Users Management" class="icon" />
          Users Management
        </router-link>
      </li>
      <li :class="{ active: isActive('/teachersmanager') }">
        <router-link to="/teachersmanager">
          <img src="../../assets/teachers-black.png" alt="Teacher Management" class="icon" />
          Teacher Management
        </router-link>
      </li>
      <li :class="{ active: isActive('/coursesmanager') }">
        <router-link to="/coursesmanager">
          <img src="../../assets/courses-black.png" alt="Course Management" class="icon" />
          Course Management
        </router-link>
      </li>
    </ul>
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
.sidebar {
  top: 60px;
  width: 230px;
  height: 100vh;
  background: white;
  color: black;
  box-shadow: 6px 0 20px rgba(0, 0, 0, 0.2);
}

.sidebar ul {
  list-style: none;
  padding: 0;
}

.sidebar li {
  padding: 15px 10px; /* Adjusted padding for better spacing */
  display: flex;
  align-items: center; /* Vertically align items in the center */
  justify-content: flex-start; /* Align text and icon to the left */
}

.sidebar li a {
  color: black;
  text-decoration: none;
  display: flex;
  align-items: center; /* Vertically center the icon and text */
}

.sidebar li.active {
  background: #1abc9c;
  border-radius: 5px;
}

.icon {
  width: 20px;  /* Set width */
  height: 20px; /* Set height */
  margin-right: 10px; /* Space between icon and text */
}

</style>
