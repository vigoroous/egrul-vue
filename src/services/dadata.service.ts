import { OrgStatusDescription, postSuggestions } from '@src/api/dadata/postSuggestions';
import { notifier } from '@src/config/notifier';
import { createReportXslx, delay } from '@src/utils';
import { checkINN } from 'ru-validation-codes';
import { Ref } from 'vue';

type CompanyRecord = {
    name: string;
    inn: string;
    ogrn: string;
    address: string;
    status: string;
    liquidationDate?: string;
    annotation: string;
};

export class DadataService {
    static async getData(innArr: string[], progress: Ref<number>, wait?: number) {
        const errArray: string[] = [];
        const rows: CompanyRecord[] = [];

        for (const [key, inn] of innArr.entries()) {
            progress.value = Math.round((key / innArr.length) * 100);

            if (checkINN(inn)) {
                if (wait) await delay(wait);
                const res = await postSuggestions(inn);

                if (!res) {
                    notifier.error('Api error');
                    continue;
                }

                if (!res.suggestions.length) {
                    rows.push({
                        name: '',
                        inn: inn,
                        ogrn: '',
                        address: '',
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
                            address: suggestion.data.address.data.source,
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
    }
}
