<template>
    <a :href="link" target="_blank" rel="noopener noreferrer" class="roadmap-card">
      <div class="card-icon">{{ icon }}</div>
      <h3>{{ title }}</h3>
      <p>{{ description }}</p>
      <div class="card-footer">
        <span>View Roadmap</span>
        <span>→</span>
      </div>
    </a>
  </template>
  
  <script setup lang="ts">
  defineProps({
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    icon: {
      type: String,
      required: true
    },
    link: {
      type: String,
      required: true
    }
  });
  </script>
  
  <style scoped>
  .roadmap-card {
    display: block;
    padding: 1.5rem;
    border-radius: 8px;
    background-color: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s, box-shadow 0.2s;
    text-decoration: none;
    color: inherit;
  }
  
  .roadmap-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  .card-icon {
    font-size: 2rem;
    margin-bottom: 1rem;
  }
  
  h3 {
    font-size: 1.25rem;
    margin-bottom: 0.75rem;
    color: #2c3e50;
  }
  
  p {
    color: #7f8c8d;
    margin-bottom: 1.5rem;
    line-height: 1.5;
  }
  
  .card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #3498db;
    font-weight: 500;
  }
  </style>