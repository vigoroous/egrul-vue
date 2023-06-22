<script setup lang="ts">
import { ref } from "vue";
import {
  NUpload,
  NUploadDragger,
  NP,
  NText,
  NIcon,
  NButton,
  NProgress,
} from "naive-ui";
import { ArchiveOutline } from "@vicons/ionicons5";
import type { UploadInst, UploadFileInfo } from "naive-ui";
import { createReportXslx, readColumnXlsx } from "@/utils/workbook.utils";
import { first } from "lodash";
import { postSuggestions } from "@/api/dadata/postSuggestions";
import { checkINN } from "ru-validation-codes";
import { OrgStatusDescription } from "@/api/dadata/postSuggestions";

type CompanyRecord = {
  name: string;
  inn: string;
  ogrn: string;
  status: string;
  liquidationDate?: string;
  annotation: string;
};

const fileList = ref<UploadFileInfo[]>([]);
const upload = ref<UploadInst | null>(null);
const loading = ref(false);
const progress = ref(0);

const handleChange = (data: { fileList: UploadFileInfo[] }) => {
  fileList.value = data.fileList;
};

// TODO: Immutable js Map (with complex key)
const handleClick = async () => {
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
        console.log("Api error");
        continue;
      }

      if (!res.suggestions.length) {
        rows.push({
          name: "",
          inn: inn,
          ogrn: "",
          status: "",
          liquidationDate: "",
          annotation: "Нет данных в ЕГРЮЛ",
        });
        continue;
      }

      for (const suggestion of res.suggestions) {
        if (
          (suggestion.data.type === "LEGAL" &&
            suggestion.data.branch_type === "MAIN") ||
          suggestion.data.type === "INDIVIDUAL"
        ) {
          rows.push({
            name: suggestion.value,
            inn: suggestion.data.inn,
            ogrn: suggestion.data.ogrn,
            status: OrgStatusDescription[suggestion.data.state.status],
            liquidationDate: (suggestion.data.state.liquidation_date
              ? new Date(suggestion.data.state.liquidation_date)
              : null
            )?.toLocaleDateString("ru-RU"),
            annotation: "",
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
  <NUpload
    ref="upload"
    directory-dnd
    accept=".xlsx"
    :default-upload="false"
    @change="handleChange"
    :max="1"
  >
    <NUploadDragger>
      <div style="margin-bottom: 12px">
        <NIcon size="48" :depth="3">
          <ArchiveOutline />
        </NIcon>
      </div>
      <NText style="font-size: 16px">
        Click or drag a file to this area to upload
      </NText>
      <NP depth="3" style="margin: 8px 0 0 0">
        Strictly prohibit from uploading sensitive information. For example,
        your bank card PIN or your credit card expiry date.
      </NP>
    </NUploadDragger>
  </NUpload>
  <NButton
    :disabled="!fileList.length"
    style="margin-bottom: 12px"
    @click="handleClick"
    :loading="loading"
  >
    Получить отчет
  </NButton>

  <NProgress
    v-if="loading"
    type="line"
    :height="24"
    :border-radius="4"
    :percentage="progress"
    :indicator-placement="'inside'"
    processing
  />
</template>

<style scoped></style>
