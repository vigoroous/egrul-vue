import { egrulBaseUrl } from '@src/config/env';
import axios, { AxiosError } from 'axios';

type VypStatusResponse = {
    status: 'wait' | 'ready';
};

export const getVypStatus = async (token: string) => {
    try {
        const timestamp = Date.now();

        const res = await axios.request<VypStatusResponse>({
            method: 'get',
            url: `${egrulBaseUrl}/vyp-status/${token}?r=${timestamp}&_=${timestamp}`,
        });

        return res.data;
    } catch (e) {
        const { code, message } = e as AxiosError;
        console.log({
            context: 'getVypStatus',
            params: { token },
            message: message,
            code: code,
        });

        return null;
    }
};
