import { egrulBaseUrl } from '@src/config/env';
import axios, { AxiosError } from 'axios';

type InnResponse = {
    t: string;
    captchaRequired: boolean;
};

export const postInn = async (query: string, page?: number) => {
    try {
        const res = await axios.request<InnResponse>({
            method: 'post',
            url: egrulBaseUrl,
            data: new URLSearchParams({
                query: query,
                page: page ? page.toString() : '',
            }),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });

        return res.data;
    } catch (e) {
        const { code, message } = e as AxiosError;
        console.log({
            context: 'postInn',
            params: { query, page },
            message: message,
            code: code,
        });

        return null;
    }
};
