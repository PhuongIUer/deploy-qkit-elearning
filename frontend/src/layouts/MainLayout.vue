<template>
  <div>
    <Navbar />
    <div class="container">
      <router-view />
    </div>
    <Footer />
  </div>
</template>

<script lang="ts">
import Navbar from '../components/shared/Navbar.vue'
import Footer from '../components/shared/Footer.vue'

export default {
  components: {
    Navbar,
    Footer,
  },
}
</script>

<style>
.--pos-relative {
  position: relative;
}
.container {
  height: calc(100% - 160px);
}
</style>
