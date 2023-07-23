<script lang="ts" setup>
import { onMounted } from 'vue';
import { useMessage } from 'naive-ui';
import { notifier } from '@src/config/notifier';

const notify = useMessage();

onMounted(() =>
    notifier
        .on('notify::info', (msg, options) => notify.info(msg, options))
        .on('notify::success', (msg, options) => notify.success(msg, options))
        .on('notify::warning', (msg, options) => notify.warning(msg, options))
        .on('notify::error', (msg, options) => notify.error(msg, options)),
);
</script>

<template>
    <div id="notifier-messages"></div>
</template>
@src/notifier/notifier
