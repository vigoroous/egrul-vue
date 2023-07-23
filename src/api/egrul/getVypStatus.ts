import axios, { AxiosError } from 'axios';

type VypStatusResponse = {
    status: 'wait' | 'ready';
};

export const getVypStatus = async (token: string) => {
    try {
        const timestamp = Date.now();

        const res = await axios.request<VypStatusResponse>({
            method: 'get',
            url: `https://egrul.nalog.ru/vyp-status/${token}?r=${timestamp}&_=${timestamp}`,
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
