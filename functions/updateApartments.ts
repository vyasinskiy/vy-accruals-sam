import { Connection } from 'mysql2/promise';
import { SuccessResponse } from '../helpers/response';

export const updateApartments = async (connection: Connection, records: any[]) => {
    const values = records.map((item) => [
        item.id,
        item.address,
        item.description || null,
        item.unitId || null,
        item.debt || null,
        item.invoiceDisabled,
        item.mustConfirm,
        item.gazType,
    ]);

    const sql = `
INSERT IGNORE INTO apartments (
apartment_external_id,
address,
description,
unit_id,
debt,
invoice_disabled,
must_confirm,
gaz_type
) VALUES ?
`;

    await connection.query(sql, [values]);
    return new SuccessResponse();
};
