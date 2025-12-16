import { put, del, post, controller, options } from 'hapi-decorators';
import { BaseController } from './BaseController';
import { Request, ResponseToolkit } from '@hapi/hapi';
import { autoInjectable } from 'tsyringe';
import { QrsService } from '../services';

import * as QsValidator from '../validators/QsValidator';
import Joi from 'joi';

@autoInjectable()
@controller('/qrs')
export class QrsController extends BaseController {
    constructor(private qrsService?: QrsService) {
        super();
    }

    @options({
        description: 'Get Resource from QRS',
        tags: ['api', 'qrs'],
        validate: {
            payload: QsValidator.qrsCommandSchema,
        },
    })
    @post('/get')
    async get(request: Request, h: ResponseToolkit) {
        const r = await this.qrsService.getResource(
            request.payload['userInfo'],
            request.payload['qsInfo'],
            request.payload['command']
        );
        return h.response(r).code(200);
    }

    @options({
        description: 'Put Resource to QRS',
        tags: ['api', 'qrs'],
        validate: {
            payload: QsValidator.qrsPayloadSchema,
        },
    })
    @put('/put')
    async put(request: Request, h: ResponseToolkit) {
        const r = await this.qrsService.putResource(
            request.payload['userInfo'],
            request.payload['qsInfo'],
            request.payload['command'],
            request.payload['payload']
        );
        return h.response(r).code(200);
    }

    @options({
        description: 'Remove Resource from QRS',
        tags: ['api', 'qrs'],
        validate: {
            payload: QsValidator.qrsCommandSchema,
        },
    })
    @del('/delete')
    async delete(request: Request, h: ResponseToolkit) {
        const r = await this.qrsService.deleteResource(
            request.payload['userInfo'],
            request.payload['qsInfo'],
            request.payload['command']
        );
        return h.response(r).code(200);
    }

    @options({
        description: 'Update Resource from QRS',
        tags: ['api', 'qrs'],
        validate: {
            payload: QsValidator.qrsPayloadSchema,
        },
    })
    @post('/post')
    async post(request: Request, h: ResponseToolkit) {
        const r = await this.qrsService.postResource(
            request.payload['userInfo'],
            request.payload['qsInfo'],
            request.payload['command'],
            request.payload['payload']
        );
        return h.response(r).code(200);
    }

    @options({
        description: 'Check is alive QRS',
        tags: ['api', 'qrs'],
        validate: {
            payload: Joi.object({
                qsInfo: QsValidator.qsSchema.required(),
            }),
        },
    })
    @post('/alive')
    async isAlive(request: Request, _h: ResponseToolkit) {
        return await this.qrsService.isAlive(request.payload['qsInfo']);
    }
}
