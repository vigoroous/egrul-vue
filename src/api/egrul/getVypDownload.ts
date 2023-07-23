import { egrulBaseUrl } from '@src/config/env';
import axios, { AxiosError } from 'axios';
// import { Stream } from 'stream';
// import { createWriteStream } from 'fs';

export const getVypDownload = async (token: string, fileName: string) => {
    try {
        const res = await axios.request<Blob>({
            method: 'get',
            url: `${egrulBaseUrl}/vyp-download/${token}`,
            responseType: 'blob',
        });

        const a = document.createElement('a');
        const url = URL.createObjectURL(res.data);
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        setTimeout(function () {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 0);
    } catch (e) {
        const { code, message } = e as AxiosError;
        console.log({
            context: 'getVypDownload',
            params: { token },
            message: message,
            code: code,
        });

        return;
    }
};
