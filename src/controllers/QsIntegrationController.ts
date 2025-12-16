import { controller, options, post, del } from 'hapi-decorators';

import { BaseController } from './BaseController';
import { Request } from '@hapi/hapi';
import { autoInjectable } from 'tsyringe';
import { QsIntegrationCreateAction } from '../actions/integration/QsIntegrationCreateAction';
import * as QsAppValidators from '../validators/QsAppValidator';
import * as Entities from '../entities';
import * as Lib from '../lib';

@autoInjectable()
@controller('/integration')
export class QsIntegrationController extends BaseController {
    constructor(private qsIntegrationCreateAction?: QsIntegrationCreateAction) {
        super();
    }

    @options({
        description: 'Create an Integration with all the needed resources',
        tags: ['api', 'integration'],
        validate: {
            payload: QsAppValidators.appRequestPayload,
        },
        response: {
            schema: QsAppValidators.appResponsePayload,
        },
        plugins: {
            'hapi-swagger': {
                responses: {
                    200: {
                        description: 'Success',
                    },
                    400: {
                        description: 'Bad request',
                    },
                    401: {
                        description: 'Unauthorized',
                    },
                    404: {
                        description: 'Resource not found',
                    },
                    409: {
                        description: 'Resource already exists',
                    },
                    412: {
                        description: 'Precondition Failed',
                    },
                },
            },
        },
    })
    @post('/')
    @Lib.Errors.handleError
    async create(request: Request) {
        const requestData =
            request.payload as Entities.QlikIntegrationCreateRequest;

        return await this.qsIntegrationCreateAction.run(requestData);
    }

    @options({
        description: 'Remove an Integration including all the linked resources',
        tags: ['api', 'integration'],
        validate: {
            payload: QsAppValidators.appRequestPayload,
        },
        response: {
            schema: QsAppValidators.appResponsePayload,
        },
        plugins: {
            'hapi-swagger': {
                responses: {
                    200: {
                        description: 'Success',
                    },
                    400: {
                        description: 'Bad request',
                    },
                    401: {
                        description: 'Unauthorized',
                    },
                    404: {
                        description: 'Resource not found',
                    },
                    409: {
                        description: 'Resource already exists',
                    },
                    412: {
                        description: 'Precondition Failed',
                    },
                },
            },
        },
    })
    @del('/')
    @Lib.Errors.handleError
    async delete(request: Request) {
        const _requestData =
            request.payload as Entities.QlikUIntegrationRemoveActionRequest;

        return true;
    }
}
