import { Connection } from 'mysql2/promise';
import { SuccessResponse } from '../helpers/response';

export const updateAccounts = async (connection: Connection, records: any[]) => {
    const sql = `INSERT IGNORE INTO accounts (
    account_external_id, organization_name, organization_id, 
    address, type, debt, apartment_id
  ) VALUES ?`;

    const values = records.map((r) => [
        r.id,
        r.organizationName,
        r.organizationId,
        r.address,
        r.type,
        r.debt,
        r.apartmentId,
    ]);

    await connection.query(sql, [values]);
    return new SuccessResponse();
};
