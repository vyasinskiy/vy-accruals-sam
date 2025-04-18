import { Connection } from 'mysql2/promise';
import { SuccessResponse } from '../helpers/response';

export const updateAccruals = async (connection: Connection, records: any[]) => {
    const values = records.map((item) => [
        item.accountId,
        item.periodName,
        item.periodId,
        item.inBalance,
        item.sum,
        item.fine,
        item.toPay,
        item.payed,
        item.invoiceExists,
    ]);

    const sql = `
INSERT IGNORE INTO accruals (
account_external_id,
period_name,
period_id,
in_balance,
total_sum,
fine,
to_pay,
payed,
invoice_exists
) VALUES ?
`;

    await connection.query(sql, [values]);
    return new SuccessResponse();
};
