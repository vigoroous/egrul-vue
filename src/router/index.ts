import { RouterOptions, createRouter, createWebHistory } from 'vue-router';
import Home from '@src/views/pages/Home.vue';

const routes: RouterOptions['routes'] = [{ path: '/', component: Home }];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
