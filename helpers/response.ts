import { APIGatewayProxyResult } from 'aws-lambda';

class Response<T> implements APIGatewayProxyResult {
    statusCode: number;
    body: string;

    constructor(isSuccess: boolean, data?: T) {
        this.statusCode = 200;
        this.body = JSON.stringify({
            isSuccess: isSuccess,
            data: data,
        });
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
