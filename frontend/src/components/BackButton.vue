<template>
  <div class="back-button-container">
    <button class="back-button" @click="goBack">
      <font-awesome-icon :icon="[faArrowLeft]" class="mr-2" />
      {{ text }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
const router = useRouter();

const props = defineProps<{
  to?: string;
  text?: string;
}>();

const { to, text = 'Back' } = props;

const goBack = () => {
  if (to) {
    router.push(to);
  } else {
    router.back();
  }
};
</script>

<style scoped>
.back-button-container {
  margin-bottom: 20px;
}
.back-button {
  padding: 8px 16px;
  border: none;
  background-color: #6c9d8f;
  color: white;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: background-color 0.3s ease;

}
.back-button:hover {
  background-color: #5a8a7d;
}
</style>
