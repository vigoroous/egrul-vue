<script setup lang="ts">
import Layout from '@src/views/components/layout/Layout.vue';
import { NH1, NRadioGroup, NRadio, NTabs, NTabPane } from 'naive-ui';
import { NUpload, NUploadDragger, NP, NText, NIcon, NButton, NProgress } from 'naive-ui';
import type { UploadProps } from 'naive-ui';
import { ArchiveOutline } from '@vicons/ionicons5';
import { DadataService } from '@src/services/dadata.service';
import { EgrulService } from '@src/services/egrul.service';
import { reactive, ref } from 'vue';
import { readColumnXlsx } from '@src/utils';

const loading = reactive({
    generateReport: false,
    getStatements: false,
});
const innArray = ref<string[]>([]);
const progress = ref(0);
const statementNaming = ref<StatementNamingType>('by_inn');

type StatementNamingType = 'by_index' | 'by_inn';

const radioOptions: { label: string; value: StatementNamingType }[] = [
    {
        label: 'По порядковому номеру',
        value: 'by_index',
    },
    {
        label: 'НАЗВАНИЕ_ИНН_ОГРН',
        value: 'by_inn',
    },
];

const handleChange: UploadProps['onChange'] = async (data) => {
    try {
        const file = data.fileList[0]?.file;
        if (!file) {
            innArray.value = [];
            return;
        }

        const buffer = await file.arrayBuffer();
        innArray.value = readColumnXlsx(buffer).flatMap((line: string | number) => {
            return line.toString().split(/[ ;]/g);
        });
    } catch (e) {
        console.log(e);
    }
};

const generateReport = async () => {
    loading.generateReport = true;
    progress.value = 0;
    await DadataService.getData(innArray.value, progress, 50);
    loading.generateReport = false;
};

const getStatements = async () => {
    loading.getStatements = true;
    progress.value = 0;
    await EgrulService.getStatements(innArray.value, progress, 300);
    loading.getStatements = false;
};
</script>

<template>
    <Layout>
        <NH1>Загрузка входных данных</NH1>
        <div class="col" style="margin-bottom: 24px">
            <NUpload
                directory-dnd
                accept=".xlsx"
                :default-upload="false"
                @change="handleChange"
                :max="1"
                style="margin-bottom: 8px"
            >
                <NUploadDragger>
                    <div style="margin-bottom: 12px">
                        <NIcon size="48" :depth="3">
                            <ArchiveOutline />
                        </NIcon>
                    </div>
                    <NText style="font-size: 16px"> Click or drag a file to this area to upload </NText>
                    <NP depth="3" style="margin: 8px 0 0 0"> Only XLSX files accepted. </NP>
                </NUploadDragger>
            </NUpload>

            <NTabs type="line" animated>
                <NTabPane name="report" tab="Отчет">
                    <div class="box">
                        <NButton :disabled="!innArray.length" @click="generateReport" :loading="loading.generateReport">
                            Получить отчет
                        </NButton>
                    </div>
                </NTabPane>
                <NTabPane name="statements" tab="Выписки">
                    <div class="col box">
                        <span>Название выписки</span>
                        <NRadioGroup v-model:value="statementNaming" class="button-group">
                            <div v-for="item of radioOptions">
                                <NRadio :key="item.value" :value="item.value" :label="item.label" />
                            </div>
                        </NRadioGroup>

                        <div>
                            <NButton
                                :disabled="!innArray.length"
                                @click="getStatements"
                                :loading="loading.getStatements"
                            >
                                Получить выписки
                            </NButton>
                        </div>
                    </div>
                </NTabPane>
            </NTabs>
        </div>
        <NProgress
            v-if="loading.generateReport || loading.getStatements"
            type="line"
            :height="24"
            :border-radius="4"
            :percentage="progress"
            indicator-placement="inside"
            processing
        />
    </Layout>
</template>

<style scoped lang="scss">
.box {
    padding: 24px 16px;
}

.col {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.row {
    display: flex;
    gap: 16px;
}

.button-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 16px;
}
</style>
@src/utils
