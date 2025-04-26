<template>
  <div>
    <Navbar />
    <div class="container">
      <router-view />
    </div>
    <Footer/>
  </div>
</template>

<script lang="ts">
import Navbar from '../components/shared/Navbar.vue'
import Footer from '../components/shared/Footer.vue'

export default {
  name: 'ParentComponent',
  components: {
    Navbar,
    // eslint-disable-next-line vue/no-reserved-component-names
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
