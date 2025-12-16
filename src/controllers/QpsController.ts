import { del, post, controller, options } from 'hapi-decorators';
import { Boom } from '@hapi/boom';

import { BaseController } from './BaseController';
import { Request, ResponseToolkit } from '@hapi/hapi';
import { autoInjectable } from 'tsyringe';
import { QpsService } from '../services';

import * as QsValidator from '../validators/QsValidator';

@autoInjectable()
@controller('/qps')
export class QpsController extends BaseController {
    constructor(private qpsService?: QpsService) {
        super();
    }

    @options({
        description: 'Ticket Authentication',
        tags: ['api', 'qps'],
        validate: {
            payload: QsValidator.qpsTicketSchema,
        },
    })
    @post('/ticket/authentication')
    async getTicket(request: Request, h: ResponseToolkit) {
        const r = await this.qpsService.authTicket(
            request.payload['userInfo'],
            request.payload['qsInfo'],
            request.payload['redirectUrl']
        );
        return h.response(r).code(200);
    }

    @options({
        description: 'Create User Session',
        tags: ['api', 'qps'],
        validate: {
            payload: QsValidator.qpsSessionSchema,
        },
    })
    @post('/session/create')
    async createSession(request: Request, h: ResponseToolkit) {
        let r = null;
        let sId = null;

        try {
            r = await this.qpsService.createSession(
                request.payload['userInfo'],
                request.payload['qsInfo']
            );
            sId = r.sessionId;
            h.state(
                request.payload['cookie'].name,
                sId,
                request.payload['cookie'].settings
            );

            return h.response({ qps: sId }).code(200);
        } catch (error) {
            throw new Boom(error);
        }
    }

    @options({
        description: 'Get Session by Id',
        tags: ['api', 'qps'],
        validate: {
            params: QsValidator.sessionSchema,
            payload: QsValidator.qpsSchema,
        },
    })
    @post('/session/{id}')
    async getSession(request: Request, _h: ResponseToolkit) {
        return {
            qps: await this.qpsService.getSession(
                request.params.id,
                request.payload['qsInfo']
            ),
        };
    }

    @options({
        description: 'Delete Session by Id',
        tags: ['api', 'qps'],
        validate: {
            params: QsValidator.sessionSchema,
            payload: QsValidator.qpsSchema,
        },
        response: {
            schema: QsValidator.removeSessionResponse,
        },
    })
    @del('/session/{id}')
    async deleteSession(request: Request, _h: ResponseToolkit) {
        return {
            qps: await this.qpsService.deleteSession(
                request.params.id,
                request.payload['qsInfo']
            ),
        };
    }

    @options({
        description: 'Check Session by Id',
        tags: ['api', 'qps'],
        validate: {
            params: QsValidator.sessionSchema,
            payload: QsValidator.qpsSchema,
        },
        response: {
            schema: QsValidator.checkSessionResponse,
        },
    })
    @post('/session/exists/{id}')
    async existsSession(request: Request, _h: ResponseToolkit) {
        return {
            qps: await this.qpsService.existsSession(
                request.params.id,
                request.payload['userInfo'],
                request.payload['qsInfo']
            ),
        };
    }
}
