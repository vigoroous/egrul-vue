import { getSearch } from '@src/api/egrul/getSearch';
import { getVyp } from '@src/api/egrul/getVyp';
import { getVypDownload } from '@src/api/egrul/getVypDownload';
import { getVypStatus } from '@src/api/egrul/getVypStatus';
import { postInn } from '@src/api/egrul/postInn';
import { chunk, delay } from '@src/utils';
import { checkINN } from 'ru-validation-codes';
import { Ref } from 'vue';

async function enshureVypStatus(fileHash: string, wait?: number) {
    for (;;) {
        const vypStatusRes = await getVypStatus(fileHash);
        if (!vypStatusRes) return false;
        if (vypStatusRes.status === 'ready') return true;
        if (wait) await delay(wait);
    }
}

async function downloadChunk(innChunk: string[], page: number, wait?: number) {
    if (wait) await delay(wait);
    const innRequest = innChunk.join(' ');
    const innRes = await postInn(innRequest, page);
    if (!innRes || innRes.captchaRequired) return;

    if (wait) await delay(wait);
    const searchRes = await getSearch(innRes.t);
    if (!searchRes || !searchRes.rows) return;
    if (!searchRes.rows.length) return { total: 0 };

    for (const row of searchRes.rows) {
        if (wait) await delay(wait);
        const vypRes = await getVyp(row.t);
        if (!vypRes || vypRes.captchaRequired) return;

        if (wait) await delay(wait);
        const vypStatus = await enshureVypStatus(row.t, wait);
        if (!vypStatus) return;

        if (wait) await delay(wait);
        const companyName = row.c ?? row.n ?? row.k ?? 'undefined';
        const fileName = companyName.replace(/[" ]/g, '_') + `_${row.i}_${row.o}.pdf`;
        await getVypDownload(row.t, fileName);
    }

    return { total: Number(searchRes.rows[0]?.tot) };
}

const refetchChunk = async (innChunk: string[], page: number, wait?: number) => {
    for (;;) {
        const res = await downloadChunk(innChunk, page, wait);
        if (res) return res.total;
        if (wait) await delay(wait);
    }
};

export class EgrulService {
    static async getStatements(innArr: string[], progress: Ref<number>, wait?: number, perPage = 20) {
        const innChunks = chunk(
            innArr.filter((x) => checkINN(x)),
            perPage,
        );

        for (const [key, chunk] of innChunks.entries()) {
            progress.value = Math.round((key / innChunks.length) * 100);

            const res = await downloadChunk(chunk, 1, wait);

            const pagesCount = res ? Math.ceil(res.total / perPage) : await refetchChunk(chunk, 1, wait);
            if (pagesCount > 1) {
                for (let page = 2; page <= pagesCount; page++) {
                    await refetchChunk(chunk, page, wait);
                }
            }
        }
    }
}
