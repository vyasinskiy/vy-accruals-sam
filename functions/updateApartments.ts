import { Connection } from 'mysql2/promise';
import { SuccessResponse } from '../helpers/response';
import { UpdateDto } from '../helpers/types';

interface ExternalApartment {
    id: number;
    address: string;
    description: string;
    unitId: string;
    debt: number;
    isConfirmed: boolean;
    invoiceDisabled: boolean;
    mustConfirm: boolean;
    gazType: number;
}

export const updateApartments = async (connection: Connection, body: UpdateDto<ExternalApartment[]>) => {
    const values = body.data.map((item) => [
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
