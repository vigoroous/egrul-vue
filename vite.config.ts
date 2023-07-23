import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            '@src': resolve(__dirname, 'src'),
        },
    },
    server: {
        port: 5000,
        proxy: {
            '/egrul': {
                target: 'https://egrul.nalog.ru',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/egrul/, ''),
            },
        },
    },
});
