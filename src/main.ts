import { createApp } from 'vue';
import router from './router';
import App from './App.vue';
import 'normalize.css';
import '@src/assets/styles/global.css';
import '@src/assets/fonts/Inter/stylesheet.css';

createApp(App).use(router).mount('#app');
