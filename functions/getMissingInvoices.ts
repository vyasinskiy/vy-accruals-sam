import { Connection } from 'mysql2/promise';
import { SuccessResponse } from '../helpers/response';

export const getMissingInvoices = async (connection: Connection) => {
    const sql = `SELECT id, account_external_id, period_id FROM accruals
        WHERE invoice_exists = TRUE AND s3_invoice_url IS NULL;`;

    const [result] = await connection.query(sql);
    return new SuccessResponse(JSON.parse(JSON.stringify(result)));
};
