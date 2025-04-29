<template>
    <div>
      <Navbar />
      <div class="container mt-4">
        <router-view />
      </div>
      <Footer />
    </div>
  
  </template>
  
  <script lang="ts">
  import Navbar from '../components/Navbar.vue';
  import Footer from '../components/Footer.vue';
  
  
  export default {
    components: {
      Navbar,
      Footer
    },
  }
  </script>
  
  
  <style>
  .container {
      height: calc(100vh - 70px - );
  }
  </style>