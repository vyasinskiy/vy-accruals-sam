import { Connection } from 'mysql2/promise';
import { SuccessResponse } from '../helpers/response';

export const updateParsingResult = async (
    connection: Connection,
    payload: {
        parsingId: number;
        step: string;
        isSuccess: boolean;
        message: string;
    },
) => {
    const { parsingId, step, isSuccess, message } = payload;

    const sql = `
INSERT INTO parsing_results (parsing_id, step_id, is_success, message)
VALUES (?, (SELECT id FROM steps WHERE name = ?), ?, ?)
`;

    await connection.query(sql, [parsingId, step, isSuccess, message]);
    return new SuccessResponse();
};
