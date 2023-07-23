<script setup lang="ts">
import Layout from '@src/views/components/layout/Layout.vue';
import { NH1, NRadioGroup, NRadio, NSwitch } from 'naive-ui';
import { NUpload, NUploadDragger, NP, NText, NIcon, NButton, NProgress } from 'naive-ui';
import type { UploadFileInfo, UploadProps } from 'naive-ui';
import { ArchiveOutline } from '@vicons/ionicons5';

import { ref } from 'vue';
import { first } from 'lodash';
import { checkINN } from 'ru-validation-codes';
import { createReportXslx, readColumnXlsx } from '@src/utils/workbook.utils';
import { postSuggestions } from '@src/api/dadata/postSuggestions';
import { OrgStatusDescription } from '@src/api/dadata/postSuggestions';

type CompanyRecord = {
    name: string;
    inn: string;
    ogrn: string;
    status: string;
    liquidationDate?: string;
    annotation: string;
};

const fileList = ref<UploadFileInfo[]>([]);
const loading = ref(false);
const progress = ref(0);
const statementNaming = ref<StatementNamingType>('by_index');
const downloadStatement = ref(false);

type StatementNamingType = 'by_index' | 'by_inn';

const radioOptions: { label: string; value: StatementNamingType }[] = [
    {
        label: 'По порядковому номеру',
        value: 'by_index',
    },
    {
        label: 'ИНН_ОГРН_НАЗВАНИЕ',
        value: 'by_inn',
    },
];

const handleChange: UploadProps['onChange'] = (data) => {
    fileList.value = data.fileList;
};

// TODO: Immutable js Map (with complex key)
const generateReport = async () => {
    loading.value = true;
    progress.value = 0;

    const file = first(fileList.value)?.file;
    if (!file) return;

    const buffer = await file.arrayBuffer();

    const innArray = readColumnXlsx(buffer).flatMap((line: string | number) => {
        return line.toString().split(/[ ;]/g);
    });
    progress.value = 10;

    const errArray: string[] = [];
    const rows: CompanyRecord[] = [];

    for (const [key, inn] of innArray.entries()) {
        progress.value = Math.round((key / innArray.length) * 100);

        if (checkINN(inn)) {
            const res = await postSuggestions(inn);

            if (!res) {
                console.log('Api error');
                continue;
            }

            if (!res.suggestions.length) {
                rows.push({
                    name: '',
                    inn: inn,
                    ogrn: '',
                    status: '',
                    liquidationDate: '',
                    annotation: 'Нет данных в ЕГРЮЛ',
                });
                continue;
            }

            for (const suggestion of res.suggestions) {
                if (
                    (suggestion.data.type === 'LEGAL' && suggestion.data.branch_type === 'MAIN') ||
                    suggestion.data.type === 'INDIVIDUAL'
                ) {
                    rows.push({
                        name: suggestion.value,
                        inn: suggestion.data.inn,
                        ogrn: suggestion.data.ogrn,
                        status: OrgStatusDescription[suggestion.data.state.status],
                        liquidationDate: (suggestion.data.state.liquidation_date
                            ? new Date(suggestion.data.state.liquidation_date)
                            : null
                        )?.toLocaleDateString('ru-RU'),
                        annotation: '',
                    });
                }
            }
        } else {
            errArray.push(inn);
        }
    }

    await createReportXslx(rows, errArray);

    loading.value = false;
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

            <div class="row" style="margin-bottom: 8px">
                <span>Скачать выписки</span>
                <NSwitch v-model:value="downloadStatement" />
            </div>
            <div v-show="downloadStatement" class="col" style="margin-bottom: 8px">
                <span>Название выписки</span>
                <NRadioGroup v-model:value="statementNaming">
                    <NRadio v-for="item of radioOptions" :key="item.value" :value="item.value" :label="item.label" />
                </NRadioGroup>
            </div>
            <div>
                <NButton :disabled="!fileList.length" @click="generateReport" :loading="loading">
                    Получить отчет
                </NButton>
            </div>
        </div>
        <NProgress
            v-if="loading"
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
.col {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.row {
    display: flex;
    gap: 8px;
}
</style>
