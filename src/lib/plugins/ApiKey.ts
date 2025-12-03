import { boomHandleError } from '../errors';
import { container } from 'tsyringe';
import { Plugin, Request, ResponseToolkit } from '@hapi/hapi';
import { Errors } from '..';
import { ConfigService } from '../../services';
import { ENV, HEADERS } from '../util';

const ApiKey: Plugin<any> = {
    name: 'ApiKey',
    version: '0.1',
    register: function (server, options) {
        const configService = container.resolve(ConfigService);
        const allowedKeys = (configService.get(ENV.API_KEY) as string).split(
            ' '
        );

        const ApiKeyScheme = function (server, options) {
            return {
                authenticate: async function (
                    request: Request,
                    h: ResponseToolkit
                ) {
                    try {
                        const key = request.headers[HEADERS.X_API_KEY];

                        if (!key) {
                            throw new Error('Api key not found in header.');
                        }

                        if (!allowedKeys.includes(key)) {
                            throw new Error('Api key not allowed.');
                        }

                        return h.authenticated({
                            artifacts: { apiKey: key },
                            credentials: {},
                        });
                    } catch (error) {
                        boomHandleError(
                            new Errors.Unauthorized('Unauthorized', {
                                innerErrorMessage: error.message,
                            })
                        );
                    }
                },
            };
        };
        server.auth.scheme('apiKeyScheme', ApiKeyScheme);
        server.auth.strategy('apiKey', 'apiKeyScheme');
        server.auth.default('apiKey');
    },
};
export { ApiKey };
