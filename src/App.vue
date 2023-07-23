<script setup lang="ts">
import { NMessageProvider } from 'naive-ui';
import MessagesNotifier from './views/components/feedback/MessagesNotifier.vue';
</script>

<template>
    <NMessageProvider placement="top-right">
        <MessagesNotifier />
        <RouterView />
    </NMessageProvider>
</template>
