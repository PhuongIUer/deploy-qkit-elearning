<template>
    <div class="not-found">
      <h1>404</h1>
      <p>Oops! The page you're looking for doesn't exist.</p>
      <router-link to="/">Go back home</router-link>
    </div>
  </template>
  
  <script setup>
  </script>
  
  <style scoped>
  .not-found {
    text-align: center;
    padding: 50px;
  }
  
  h1 {
    font-size: 5rem;
    color: #ff4757;
  }
  
  p {
    font-size: 1.5rem;
    margin-bottom: 20px;
  }
  
  a {
    font-size: 1.2rem;
    color: #3498db;
    text-decoration: none;
    font-weight: bold;
  }
  
  a:hover {
    text-decoration: underline;
  }
  </style>
  