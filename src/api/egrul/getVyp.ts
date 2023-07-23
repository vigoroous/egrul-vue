import { egrulBaseUrl } from '@src/config/env';
import axios, { AxiosError } from 'axios';

type VypResponse = {
    t: string;
    captchaRequired: boolean;
};

export const getVyp = async (token: string) => {
    try {
        const timestamp = Date.now();

        const res = await axios.request<VypResponse>({
            method: 'get',
            url: `${egrulBaseUrl}/vyp-request/${token}?r=&_=${timestamp}`,
        });

        return res.data;
    } catch (e) {
        const { code, message } = e as AxiosError;
        console.log({
            context: 'getVyp',
            params: { token },
            message: message,
            code: code,
        });

        return null;
    }
};
