import { Connection } from 'mysql2/promise';
import { SuccessResponse } from '../helpers/response';
import { UpdateDto } from '../helpers/types';

interface ParsingResult {
    parsingId: number;
    step: string;
    isSuccess: boolean;
    message: string;
}

export const updateParsingResult = async (connection: Connection, body: UpdateDto<ParsingResult>) => {
    const { parsingId, step, isSuccess, message } = body.data;

    const sql = `
INSERT INTO parsing_results (parsing_id, step_id, is_success, message)
VALUES (?, (SELECT id FROM steps WHERE name = ?), ?, ?)
`;

    await connection.query(sql, [parsingId, step, isSuccess, message]);
    return new SuccessResponse();
};
