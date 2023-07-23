import { dadataApiKey } from '@src/config/env';
import axios, { AxiosError } from 'axios';

type BranchType = 'MAIN' | 'BRANCH';
export type OrgStatus = 'ACTIVE' | 'LIQUIDATING' | 'LIQUIDATED' | 'BANKRUPT' | 'REORGANIZING';
type OrgType = 'LEGAL' | 'INDIVIDUAL';

export const OrgStatusDescription: Record<OrgStatus, string> = {
    ACTIVE: 'Действующая',
    BANKRUPT: 'Признано несостоятельным (банкротом)',
    LIQUIDATED: 'Ликвидирована',
    LIQUIDATING: 'Находится в стадии ликвидации',
    REORGANIZING: 'Находится в процессе реорганизации в форме присоединения к другому юрлицу',
};

type Suggestion = {
    value: string;
    unrestricted_value: string;
    data: {
        kpp: string;
        capital: null;
        management: {
            name: string;
            post: string;
            disqualified: null;
        };
        founders: null;
        managers: null;
        predecessors: null;
        successors: null;
        branch_type: BranchType;
        branch_count: number;
        source: null;
        qc: null;
        hid: string;
        type: OrgType;
        state: {
            status: OrgStatus;
            actuality_date: number;
            registration_date: number;
            liquidation_date?: number;
        };
        opf: {
            type: string;
            code: string;
            full: string;
            short: string;
        };
        name: {
            full_with_opf: string;
            short_with_opf: string;
            latin: null;
            full: string;
            short: string;
        };
        inn: string;
        ogrn: string;
        okato: string;
        oktmo: string;
        okpo: string;
        okogu: string;
        okfs: string;
        okved: string;
        okveds: null;
        authorities: null;
        documents: null;
        licenses: null;
        finance: null;
        address: {
            value: string;
            unrestricted_value: string;
        };
        phones: null;
        emails: null;
        ogrn_date: number;
        okved_type: string;
        employee_count: null;
    };
};

type SuggestionsResponse = {
    suggestions: Array<Suggestion>;
};

export const postSuggestions = async (query: string): Promise<SuggestionsResponse | null> => {
    try {
        const res = await axios.request<SuggestionsResponse>({
            method: 'post',
            url: 'https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/party',
            data: { query: query },
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: 'Token ' + dadataApiKey,
            },
        });

        return res.data;
    } catch (e) {
        const { code, message } = e as AxiosError;
        console.log({
            context: 'postSuggestions',
            params: { query },
            message: message,
            code: code,
        });

        return null;
    }
};
