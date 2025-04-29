<!-- eslint-disable vue/multi-word-component-names -->
<template>
    <button :class="buttonClasses" @click="handleClick">
      <slot></slot>
    </button>
  </template>
  
  <script setup>
  import { computed } from 'vue';
  
  const props = defineProps({
    type: { type: String, default: 'button' },
    variant: { type: String, default: 'primary' }, 
    disabled: { type: Boolean, default: false } 
  });
  
  const emit = defineEmits(['click']);
  
  const buttonClasses = computed(() => ({
    'base-button': true,
    [`btn-${props.variant}`]: true,
    'btn-disabled': props.disabled
  }));
  
  const handleClick = (event) => {
    if (!props.disabled) {
      emit('click', event);
    }
  };
  </script>
  
  <style scoped>
  .base-button {
    padding: 10px 16px;
    font-size: 1rem;
    font-weight: bold;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: 0.3s ease-in-out;
  }
  
  .btn-primary {
    background-color: #3498db;
    color: white;
  }
  
  .btn-secondary {
    background-color: #95a5a6;
    color: white;
  }
  
  .btn-danger {
    background-color: #e74c3c;
    color: white;
  }
  
  .btn-disabled {
    background-color: #bdc3c7;
    color: #2c3e50;
    cursor: not-allowed;
  }
  </style>
  