<!-- eslint-disable vue/multi-word-component-names -->
<template>
    <div v-if="visible" :class="['notification', notificationType]" @click="closeNotification">
      <span>{{ message }}</span>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  
  const props = defineProps({
    message: { type: String, required: true },
    type: { type: String, default: 'success' }, 
    duration: { type: Number, default: 3000 },
  });
  
  const visible = ref(true);
  
  // eslint-disable-next-line no-undef
  const notificationType = computed(() => {
    return `notification-${props.type}`;
  });
  
  onMounted(() => {
    setTimeout(() => {
      visible.value = false;
    }, props.duration);
  });
  
  const closeNotification = () => {
    visible.value = false;
  };
  </script>
  
  <style scoped>
  .notification {
    padding: 10px 20px;
    margin: 10px;
    border-radius: 5px;
    color: white;
    font-weight: bold;
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 999;
    cursor: pointer;
    transition: opacity 0.3s ease;
  }
  
  .notification-success {
    background-color: #28a745;
  }
  
  .notification-error {
    background-color: #dc3545;
  }
  
  .notification-warning {
    background-color: #ffc107;
  }
  
  .notification span {
    display: inline-block;
    max-width: 300px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  </style>
  