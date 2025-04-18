import { Connection, RowDataPacket } from 'mysql2/promise';
import { SuccessResponse } from '../helpers/response';

interface CreateParsingRow extends RowDataPacket {
    id: number;
}

export const createParsing = async (connection: Connection) => {
    const [rows] = await connection.execute('CALL create_parsing()');

    // Приводим rows к нужному типу вручную:
    const resultSet = rows as CreateParsingRow[][];

    const newId = resultSet[0][0].id;

    return new SuccessResponse({ id: newId });
};
