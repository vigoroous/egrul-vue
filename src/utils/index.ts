import XLSX from 'xlsx';

export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const chunk = <T>(array: T[], size = 1): T[][] => {
    const cache: T[][] = [];
    const tmp = [...array];
    if (size <= 0) return cache;
    while (tmp.length) cache.push(tmp.splice(0, size));
    return cache;
};

export const readColumnXlsx = (buffer: ArrayBuffer, columnName = 'B') => {
    const workbook = XLSX.read(buffer);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];

    const column: string[] = [];

    for (let z in worksheet) {
        if (z.toString()[0] === columnName) {
            column.push(worksheet[z].v);
        }
    }

    return column;
};

export const createReportXslx = async (rows: any, errors: string[]) => {
    /* generate worksheet and workbook */
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Dates');

    const worksheet_error = XLSX.utils.aoa_to_sheet(chunk(errors, 1));
    XLSX.utils.book_append_sheet(workbook, worksheet_error, 'Errors');

    /* fix headers */
    XLSX.utils.sheet_add_aoa(
        worksheet,
        [['Наименование ЮЛ / ФИО ИП', 'ИНН', 'ОГРН', 'Адрес', 'Статус', 'Дата прекращения деятельности', 'Примечание']],
        { origin: 'A1' },
    );

    /* calculate column width */
    // @ts-ignore
    const max_width = rows.reduce((w, r) => Math.max(w, r.name.length), 10);
    worksheet['!cols'] = [{ wch: max_width }];

    XLSX.writeFile(workbook, `data/Report_${Date.now()}.xlsx`, { compression: true });
};
