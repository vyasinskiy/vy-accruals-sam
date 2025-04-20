import { Connection } from 'mysql2/promise';
import { SuccessResponse } from '../helpers/response';
import { UpdateDto } from '../helpers/types';

interface ExternalAccount {
    id: number;
    organizationName: string;
    organizationId: string;
    address: string;
    type: string;
    debt: number;
    apartmentId: number;
}

export const updateAccounts = async (connection: Connection, body: UpdateDto<ExternalAccount[]>) => {
    const sql = `INSERT IGNORE INTO accounts (
    account_external_id, organization_name, organization_id, 
    address, type, debt, apartment_id
  ) VALUES ?`;

    const values = body.data.map((account) => [
        account.id,
        account.organizationName,
        account.organizationId,
        account.address,
        account.type,
        account.debt,
        account.apartmentId,
    ]);

    await connection.query(sql, [values]);
    return new SuccessResponse();
};
