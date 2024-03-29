import { egrulBaseUrl } from '@src/config/env';
import axios, { AxiosError } from 'axios';

type CompanyType = {
    a: string; //'115088, ГОРОД МОСКВА, УГРЕШСКАЯ УЛИЦА, ДОМ 2, СТРОЕНИЕ 25, КОМНАТА 26',
    c: string; //'ООО КОМПАНИЯ "ФРУИТ ФИЛОСОФИЯ"',
    e: string; //'02.03.2023',
    g: string; //'Конкурсный управляющий: Начева Юлия Степановна',
    cnt: string; //'1',
    i: string; //'9723011265',
    k: string; //'ul',
    n: string; //'ОБЩЕСТВО С ОГРАНИЧЕННОЙ ОТВЕТСТВЕННОСТЬЮ КОМПАНИЯ "ФРУИТ ФИЛОСОФИЯ"',
    o: string; //'1177746164529',
    p: string; //'772301001',
    r: string; //'17.02.2017',
    t: string; //'3C9B00EAD5FB967A7964FBB0E787C534C699D55864A0F20B7968070545B1D6F556C48DA9104B8E706D8DB833F59E94373021190B1042281B57AD26E7A25872B3',
    pg: string; //'1',
    tot: string; //'1'
};

export type SearchResponse = {
    rows?: Array<CompanyType>;
};

export const getSearch = async (token: string) => {
    try {
        const timestamp = Date.now();

        const res = await axios.request<SearchResponse>({
            method: 'get',
            url: `${egrulBaseUrl}/search-result/${token}?r=${timestamp}&_=${timestamp}`,
        });

        return res.data;
    } catch (e) {
        const { code, message } = e as AxiosError;
        console.log({
            context: 'getSearch',
            params: { token },
            message: message,
            code: code,
        });

        return null;
    }
};
