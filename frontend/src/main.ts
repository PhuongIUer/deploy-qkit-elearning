import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import "@fontsource/baloo-2/index.css";
import { createPinia } from 'pinia';
// Vuetify
import "@mdi/font/css/materialdesignicons.css";
import "vuetify/dist/vuetify.min.css";
import "@mdi/font/css/materialdesignicons.css";
import 'vue3-toastify/dist/index.css'
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";

const vuetify = createVuetify({
    components,
    directives,
    icons: {
      defaultSet: "mdi",
    },
    
  });

const app = createApp(App);
app.use(createPinia());  // <-- Register Pinia
app.use(router);
app.use(vuetify);
app.mount('#app');