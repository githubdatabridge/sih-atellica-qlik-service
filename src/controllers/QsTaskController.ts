import { controller, options, post } from 'hapi-decorators';
import { BaseController } from './BaseController';
import { Request } from '@hapi/hapi';
import { autoInjectable } from 'tsyringe';
import { QsTaskStartAction } from '../actions/task/QsTaskStartAction';
import * as QsTaskValidator from '../validators/QsTaskValidator';
import * as Entities from '../entities';
import * as Lib from '../lib';
import { QsTaskStatusAction } from '../actions';

@autoInjectable()
@controller('/task')
export class QsTaskController extends BaseController {
    constructor(
        private qsTaskStartAction?: QsTaskStartAction,
        private qsTaskStatusAction?: QsTaskStatusAction
    ) {
        super();
    }

    @options({
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
        description: 'Start Qlik Task based on the Task Id',
        tags: ['api', 'task'],
        validate: {
            payload: QsTaskValidator.qsTaskStartRequest,
        },
        response: {
            schema: QsTaskValidator.qsTaskStartResponse,
        },
    })
    @post('/start/')
    @Lib.Errors.handleError
    async startQlikTask(request: Request) {
        const requestData = request.payload as Entities.QlikTaskStartRequest;

        return await this.qsTaskStartAction.run(requestData);
    }

    @options({
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
        description: 'Status Task',
        tags: ['api', 'task'],
        validate: {
            payload: QsTaskValidator.qsTaskStatusRequest,
        },
        response: {
            schema: QsTaskValidator.qsTaskStatusResponse,
        },
    })
    @post('/status/')
    @Lib.Errors.handleError
    async get(request: Request) {
        const requestData = request.payload as Entities.QlikTaskStatusRequest;

        return await this.qsTaskStatusAction.run(requestData);
    }
}
