import { createApp } from 'vue'
import '@/styles/normalize.min.css'
import router from './router'
import App from "./App.vue"
import { create } from 'naive-ui'

const app = createApp(App)
const naive = create();

app.use(naive);
app.use(router);

app.mount('#app');
