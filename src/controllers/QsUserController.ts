import { controller, options, get, del, post } from 'hapi-decorators';
import { BaseController } from './BaseController';
import { Request, ResponseToolkit } from '@hapi/hapi';
import { autoInjectable } from 'tsyringe';
import { QsUserLicenseDeallocationAction } from '../actions/user/QsUserLicenseDeallocationAction';
import * as Entities from '../entities';
import * as Lib from '../lib';
import * as QsUserValidator from '../validators/QsUserValidator';
import { QsUserRemoveAction } from '../actions';
import { QsUserSessionAuthAction } from '../actions/user/QsUserSessionAuthAction';
import { QSyncUserPropertiesAction } from '../actions/user/QsUserSyncUserPropertiesAction';
import { QsUserSessionAction } from '../actions/user/QsUserSessionAction';
import { QsUserListAction } from '../actions/user/QsUserListAction';
import { QsUserLightListAction } from '../actions/user/QsUserLightListAction';
import { QsUserSessionEndAction } from '../actions/user/QsUserSessionEndAction';
import { QsUserIsSessionActiveAction } from '../actions/user/QsUserIsSessionActiveAction';
@autoInjectable()
@controller('/user')
export class QsUserController extends BaseController {
    constructor(
        private qsUserSessionAuthAction?: QsUserSessionAuthAction,
        private qsUserSessionAction?: QsUserSessionAction,
        private qsUserSessionEndAction?: QsUserSessionEndAction,
        private qsUserListAction?: QsUserListAction,
        private qsUserLightListAction?: QsUserLightListAction,
        private qsUserLicenseDeallocateAction?: QsUserLicenseDeallocationAction,
        private qsUserLicenseRemoveAction?: QsUserRemoveAction,
        private qSyncUserPropertiesAction?: QSyncUserPropertiesAction,
        private qsUserIsSessionActiveAction?: QsUserIsSessionActiveAction
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
        description: 'Remove user license allocations from Qlik Sense',
        notes: 'Removes user allocation of both, professional and/or analyzer access types. If needed, you can simulate without deleting.',
        tags: ['api', 'user', 'deallocate'],
        validate: {
            query: QsUserValidator.qsUserLicenseDeallocateQuery,
            payload: QsUserValidator.qsUserLicenseDeallocateRequestPayload,
        },
        response: {
            schema: QsUserValidator.qsUserLicenseDeallocateResponseBody,
        },
    })
    @del('/deallocate')
    @Lib.Errors.handleError
    async deallocate(request: Request) {
        const query = request.query as any;
        const payload = request.payload as any;

        return await this.qsUserLicenseDeallocateAction.run({
            qsInfo: payload.qsInfo,
            userInfo: payload.userInfo,
            removeUserInfo: payload.removeUserInfo,
            simulate: query.simulate,
        });
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
        description: 'Remove user from Qlik Sense Site',
        notes: 'Removes user from Qlik Sense Site',
        tags: ['api', 'user', 'remove'],
        validate: {
            payload: QsUserValidator.qsUserRemovePayload,
        },
    })
    @del('/')
    @Lib.Errors.handleError
    async remove(request: Request) {
        const payload = request.payload as any;

        return await this.qsUserLicenseRemoveAction.run({
            qsInfo: payload.qsInfo,
            userInfo: payload.userInfo,
            removeUserInfo: payload.removeUserInfo,
        });
    }

    @options({
        description: 'User Authentication',
        tags: ['api', 'user'],
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
        validate: {
            payload: QsUserValidator.qsSessionAuthRequestPayload,
            query: QsUserValidator.qsSyncUserPropertiesRequestQuery,
        },
        response: { schema: QsUserValidator.qsSessionAuthResponse },
    })
    @post('/auth')
    @Lib.Errors.handleError
    async authSession(request: Request) {
        const query = request.query as any;
        const requestData = request.payload as Entities.QlikUserAuthRequest;

        return await this.qsUserSessionAuthAction.run(requestData, query.sync);
    }

    @options({
        description: 'Sync User Properties',
        tags: ['api', 'user'],
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
        validate: {
            payload: QsUserValidator.qsSyncUserPropertiesRequestPayload,
        },
    })
    @post('/sync')
    @Lib.Errors.handleError
    async syncUser(request: Request) {
        const requestData = request.payload as Entities.QlikUserSyncRequest;
        return await this.qSyncUserPropertiesAction.run(requestData);
    }

    @options({
        description: 'Get logged in user based on session id',
        tags: ['api', 'user'],
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
        validate: {
            params: QsUserValidator.qsUserSessionRequestParams,
            payload: QsUserValidator.qsUserSessionRequestPayload,
        },
        response: {
            schema: QsUserValidator.qsUserResponsePayload,
        },
        //auth: false,
    })
    @post('/{sessionId}')
    @Lib.Errors.handleError
    async getUserBySessionId(request: Request) {
        const sessionId = request.params.sessionId;
        const requestData = request.payload as Entities.QlikUserSessionRequest;
        requestData.sessionId = sessionId;
        return await this.qsUserSessionAction.run(requestData);
    }

    @options({
        description: 'Get User list based with minimal user information',
        tags: ['api', 'user'],
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
        validate: {
            params: QsUserValidator.qsUserListRequestParams,
            payload: QsUserValidator.qsUserListLightRequestPayload,
        },
        response: {
            schema: QsUserValidator.qsUserLightArrayResponsePayload,
        },
        //auth: false,
    })
    @post('/list/{qsAppGuid}')
    @Lib.Errors.handleError
    async getUserList(request: Request) {
        const qsAppGuid = request.params.qsAppGuid;
        const requestData = request.payload as Entities.QlikUserListRequest;
        requestData.qsAppGuid = qsAppGuid;
        return await this.qsUserLightListAction.run(requestData);
    }

    @options({
        description: 'Get User based on active session Id',
        tags: ['api', 'user'],
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
        validate: {
            params: QsUserValidator.qsUserListRequestParams,
            payload: QsUserValidator.qsUserFullListRequestPayload,
        },
        response: {
            schema: QsUserValidator.qsUserArrayResponsePayload,
        },
        //auth: false,
    })
    @post('/full/list/{qsAppGuid}')
    @Lib.Errors.handleError
    async getUserListFull(request: Request) {
        const qsAppGuid = request.params.qsAppGuid;
        const requestData = request.payload as Entities.QlikUserListRequest;
        requestData.qsAppGuid = qsAppGuid;
        return await this.qsUserListAction.run(requestData);
    }

    @options({
        description: 'End session of logged user based on session id',
        tags: ['api', 'user'],
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
        validate: {
            params: QsUserValidator.qsUserSessionRequestParams,
            payload: QsUserValidator.qsUserSessionRequestPayload,
        },
        //auth: false,
    })
    @post('/{sessionId}/end')
    @Lib.Errors.handleError
    async ensUserSessionBySessionId(request: Request, h: ResponseToolkit) {
        const sessionId = request.params.sessionId;
        const requestData = request.payload as Entities.QlikUserSessionRequest;
        requestData.sessionId = sessionId;
        await this.qsUserSessionEndAction.run(requestData);
        return h.response().code(204);
    }

    @options({
        description: 'Is given session id active',
        tags: ['api', 'user'],
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
                    }
                },
            },
        },
        validate: {
            params: QsUserValidator.qsUserSessionRequestParams,
            payload: QsUserValidator.qsUserSessionRequestPayload,
        },
        //auth: false,
    })
    @post('/{sessionId}/is-active')
    @Lib.Errors.handleError
    async IsSessionActive(request: Request, h: ResponseToolkit) {
        const sessionId = request.params.sessionId;
        const requestData = request.payload as Entities.QlikUserSessionRequest;
        requestData.sessionId = sessionId;
        await this.qsUserIsSessionActiveAction.run(requestData);
        return h.response().code(200);
    }
}
