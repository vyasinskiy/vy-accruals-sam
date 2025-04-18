import { APIGatewayProxyHandler } from 'aws-lambda';
import { createParsing } from './functions/createParsing';
import { updateApartments } from './functions/updateApartments';
import { updateAccounts } from './functions/updateAccounts';
import { updateAccruals } from './functions/updateAccruals';
import { updateParsingResult } from './functions/updateParsingResult';
import { getConnection } from './db';
import { ErrorResponse } from './helpers/response';

export const handler: APIGatewayProxyHandler = async (event) => {
    const body = JSON.parse(event.body || '{}');
    let connection;
    let response;

    try {
        connection = await getConnection();
        switch (body.action) {
            case 'createParsing':
                response = await createParsing(connection);
                break;
            case 'updateApartments':
                response = await updateApartments(connection, body);
                break;
            case 'updateAccounts':
                response = await updateAccounts(connection, body);
                break;
            case 'updateAccruals':
                response = await updateAccruals(connection, body);
                break;
            case 'updateParsingResult':
                response = await updateParsingResult(connection, body);
                break;
            default:
                response = new ErrorResponse('Unknown action');
                break;
        }

        return response;
    } catch (error) {
        console.error('Error:', error);
        return new ErrorResponse(error);
    } finally {
        await connection?.end();
    }
};
