import * as Lib from '../../lib';

export class DbService {
    constructor(
        protected host: string,
        protected port: number
    ) {}

    protected getUrl() {
        return `${this.host}:${this.port}`;
    }

    protected parseError(tag: string, data) {
        if (data.statusCode === 401) {
            throw new Lib.Errors.Unauthorized('Unauthorized', {
                method: tag,
                data: data,
            });
        } else if (data.statusCode === 500) {
            throw new Lib.Errors.InternalError('Internal Server Error', {
                method: tag,
                data: data,
            });
        } else if (data.statusCode === 400) {
            throw new Lib.Errors.ValidationError('Bad Request', {
                method: tag,
                data: data,
            });
        } else if (data.statusCode === 404) {
            throw new Lib.Errors.NotFoundError('Not Found', {
                method: tag,
                data: data,
            });
        } else {
            throw new Lib.Errors.InternalError('Internal Error', {
                method: tag,
                data: data,
            });
        }
    }
}
