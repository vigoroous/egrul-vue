import axios, { AxiosError } from 'axios';
// import { createWriteStream } from "fs";
import { Stream } from 'stream';
import path from 'path';
import { existsSync, mkdirSync, createWriteStream } from 'fs';

// import { DOWNLOAD_DIR } from '../../config/env';

export const getVypDownload = async (token: string, fileName: string) => {
    // if (!existsSync(DOWNLOAD_DIR)) mkdirSync(DOWNLOAD_DIR, { recursive: true });
    // const downloadFilePath = path.resolve(DOWNLOAD_DIR, fileName);
    const writer = createWriteStream(fileName);

    try {
        const res = await axios.request<Stream>({
            method: 'get',
            url: `https://egrul.nalog.ru/vyp-download/${token}`,
            responseType: 'stream',
        });

        res.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });
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
