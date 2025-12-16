import { controller, options, post, del } from 'hapi-decorators';
import { BaseController } from './BaseController';
import { Request } from '@hapi/hapi';
import { autoInjectable } from 'tsyringe';
import { QsAppRemoveAction } from '../actions/app/QsAppRemoveAction';
import { QsAppArchiveAction } from '../actions/app/QsAppArchiveAction';
import { QsAppCopyDesignAction } from '../actions/app/QsAppCopyDesignAction';
import { QsAppAttachAction } from '../actions/app/QsAppAttachAction';
import { QsAppRemoveAttachmentAction } from '../actions/app/QsAppRemoveAttachmentAction';
import { QsAppFindAppIdByFilterAction } from '../actions/app/QsAppFindAppIdByFilterAction';
import { QsAppFindAppIdByTagAction } from '../actions/app/QsAppFindAppIdByTagAction';
import * as QsAppValidators from '../validators/QsAppValidator';
import * as Entities from '../entities';
import * as Lib from '../lib';
import Joi from 'joi';
@autoInjectable()
@controller('/app')
export class QsAppController extends BaseController {
    constructor(
        private qsAppRemoveAction?: QsAppRemoveAction,
        private qsAppArchiveAction?: QsAppArchiveAction,
        private qsAppCopyDesignAction?: QsAppCopyDesignAction,
        private qsAppAttachAction?: QsAppAttachAction,
        private qsAppRemoveAttachmentAction?: QsAppRemoveAttachmentAction,
        private qsAppFindAppIdByFilterAction?: QsAppFindAppIdByFilterAction,
        private qsAppFindAppIdByTagAction?: QsAppFindAppIdByTagAction
    ) {
        super();
    }
    // /app/archive ----------------------------------------------------------------------
    @options({
        description: 'archive the apps of a customer',
        notes: 'App will be emptied and archived to a stream (not deleted)',
        tags: ['api', 'app'],
        validate: {
            payload: QsAppValidators.appArchiveRequestPayload,
            query: QsAppValidators.appArchiveRequestQuery,
        },
        response: {
            schema: QsAppValidators.appArchiveResponsePayload,
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
    @post('/archive')
    @Lib.Errors.handleError
    async archive(request: Request) {
        const requestData = request.payload as any;
        requestData.simulate = request.query.simulate;
        return await this.qsAppArchiveAction.run(
            requestData as Entities.QlikAppArchiveRequest
        );
    }
    // /app/remove ----------------------------------------------------------------------
    @options({
        description: 'remove the app of a customer',
        notes: 'App is removed from the Qlik Sense Server',
        tags: ['api', 'app'],
        validate: {
            payload: QsAppValidators.appRemoveRequestPayload,
        },
        response: {
            schema: QsAppValidators.appRemoveResponsePayload,
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
    @del('/remove')
    @Lib.Errors.handleError
    async remove(request: Request) {
        const requestData = request.payload as Entities.QlikAppRemoveRequest;
        return await this.qsAppRemoveAction.run(requestData);
    }
    // /app/copy -----------------------------------------------------------------------------------
    @options({
        description: 'Copy app design from a source app to target apps',
        notes: 'Returns a result confirming the target app has been refreshed',
        tags: ['api', 'qrs'],
        validate: {
            query: QsAppValidators.appCopyDesignRequestQuery,
            payload: QsAppValidators.appCopyDesignRequestPayload,
        },
    })
    @post('/copy')
    @Lib.Errors.handleError
    async setCopyDesign(request: Request) {
        const query = request.query as any;
        const payload = request.payload as any;

        return await this.qsAppCopyDesignAction.run({
            qsHost: payload.qsInfo.host,
            qrsPort: payload.qsInfo.qrsPort,
            qixPort: payload.qsInfo.qixPort,
            qixUserInfo: payload.qsInfo.qixUserInfo,
            qrsUserInfo: payload.qsInfo.qrsUserInfo,
            fromApp: query.fromApp.toString(),
            toApps: query.toApps.toString(),
            copyScript: query.copyScript,
            connection: query.connection,
        });
    }
    // /app/attach -----------------------------------------------------------------------------
    @options({
        /*  payload: {
            output: 'stream',
            parse: false,
            maxBytes: 2 * 1000 * 1000,
            multipart: {
                output: 'stream',
            },
        }, */
        description: 'Attaches a file to a given app',
        notes: 'Returns the relative link to the uploaded attachment',
        tags: ['api', 'qrs'],
        validate: {
            query: QsAppValidators.appAttachRequestQuery,
        },
        response: {
            schema: QsAppValidators.appAttachResponsePayload,
        },
    })
    @post('/attach')
    @Lib.Errors.handleError
    async attach(request: Request) {
        const appId = request.query.appId.toString();
        const payload = request.payload as Entities.QlikAppAttachActionRequest;

        return await this.qsAppAttachAction.run(appId, {
            file: payload.file,
            qsInfo: payload.qsInfo,
            qrsUserInfo: payload.qrsUserInfo,

            fileName: payload.fileName.toString(),
        });
    }
    // /app/remove attachment ----------------------------------------------------------------------
    @options({
        description: 'Removes a file from a given app',
        notes: 'Returns true if the file could be removed from the given app',
        tags: ['api', 'qrs'],
        validate: {
            query: QsAppValidators.appAttachRequestQuery,
            payload: QsAppValidators.appRemoveAttachmentRequestPayload,
        },
        response: {
            schema: QsAppValidators.appRemoveAttachmentResponsePayload,
        },
        plugins: {
            'hapi-swagger': {
                responses: {
                    200: {
                        description: 'Success',
                    },
                    404: {
                        description: 'Attachment not found',
                    },
                },
            },
        },
    })
    @del('/remove/attachment')
    @Lib.Errors.handleError
    async removeAttachment(request: Request) {
        const appId = request.query.appId as string;
        const payload =
            request.payload as Entities.QlikAppRemoveAttachmentActionRequest;

        return await this.qsAppRemoveAttachmentAction.run(appId, {
            qsInfo: payload.qsInfo,
            qrsUserInfo: payload.qrsUserInfo,
            fileName: payload.fileName,
        });
    }

    // /app/filter app----- ----------------------------------------------------------------------
    @options({
        description: 'Retrieve apps by filter',
        tags: ['api', 'qrs'],
        validate: {
            query: QsAppValidators.appFilterRequestQuery,
            payload: QsAppValidators.appFilterRequestPayload,
        },
        response: {
            schema: Joi.array()
                .items(Joi.string().required().label('QsAppFilterResponse'))
                .label('QsAppFilterArrayResponse'),
        },
        plugins: {
            'hapi-swagger': {
                responses: {
                    200: {
                        description: 'Success',
                    },
                    404: {
                        description: 'App not found',
                    },
                },
            },
        },
        //auth: false,
    })
    @post('/filter')
    @Lib.Errors.handleError
    async filter(request: Request) {
        const filter = request.query.filter as string;
        const requestData = request.payload as Entities.QlikAppFilterRequest;
        requestData.filter = filter;

        return await this.qsAppFindAppIdByFilterAction.run(requestData);
    }

    // /app/tag app----- ----------------------------------------------------------------------
    @options({
        description: 'Retrieve apps by tag name',
        tags: ['api', 'qrs'],
        validate: {
            query: QsAppValidators.appTagRequestQuery,
            payload: QsAppValidators.appTagRequestPayload,
        },
        response: {
            schema: Joi.array()
                .items(Joi.string().required().label('QsAppTagResponse'))
                .label('QsAppTagArrayResponse'),
        },
        plugins: {
            'hapi-swagger': {
                responses: {
                    200: {
                        description: 'Success',
                    },
                    404: {
                        description: 'App not found',
                    },
                },
            },
        },
        //auth: false,
    })
    @post('/tag')
    @Lib.Errors.handleError
    async findAppByTagName(request: Request) {
        const tagName = request.query.tag as string;
        const requestData = request.payload as Entities.QlikAppByTagRequest;
        requestData.tagName = tagName;
        return await this.qsAppFindAppIdByTagAction.run(requestData);
    }
}
