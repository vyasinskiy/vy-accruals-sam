import { Connection } from 'mysql2/promise';
import { SuccessResponse } from '../helpers/response';
import { UpdateDto } from '../helpers/types';

interface ExternalAccrual {
    accountId: number;
    periodName: string;
    periodId: number;
    inBalance: number;
    sum: number;
    fine: number;
    toPay: number;
    payed: number;
    invoiceExists: boolean;
}

export const updateAccruals = async (connection: Connection, body: UpdateDto<ExternalAccrual[]>) => {
    const values = body.data.map((accrual) => [
        accrual.accountId,
        accrual.periodName,
        accrual.periodId,
        accrual.inBalance,
        accrual.sum,
        accrual.fine,
        accrual.toPay,
        accrual.payed,
        accrual.invoiceExists,
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
