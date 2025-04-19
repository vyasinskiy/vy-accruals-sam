import { APIGatewayProxyResult } from 'aws-lambda';

class Response<T> implements APIGatewayProxyResult {
    statusCode: number;
    body: string;
    headers?: { [header: string]: string | number | boolean } | undefined;

    constructor(isSuccess: boolean, data?: T) {
        this.statusCode = 200;
        this.body = JSON.stringify({
            isSuccess: isSuccess,
            data: data,
        });
        this.headers = {
            'Access-Control-Allow-Origin': '*', // или твой конкретный домен
            'Access-Control-Allow-Methods': 'POST, OPTIONS', // поддерживаемые методы
            'Access-Control-Allow-Headers': 'Content-Type, X-Amz-Date, Authorization, X-Api-Key', // допустимые заголовки
        };
    }
}

export class SuccessResponse<T> extends Response<T> {
    constructor(data?: T) {
        super(true, data);
    }
}

export class ErrorResponse<T> extends Response<T> {
    constructor(error: T) {
        super(false, error);
    }
}
