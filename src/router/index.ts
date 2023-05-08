import { RouterOptions, createRouter, createWebHistory } from "vue-router";
import HomePageVue from "@/pages/HomePage.vue";
// import HelloWorld from '@/components/HelloWorld.vue'


const routes: RouterOptions["routes"] = [
    { path: '/', component: HomePageVue, },
    // { path: '/about', component: About },
];


const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;