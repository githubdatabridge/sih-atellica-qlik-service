import { controller, options, post, get } from 'hapi-decorators';

import { BaseController } from './BaseController';
import { Request } from '@hapi/hapi';
import { autoInjectable } from 'tsyringe';
import { QixDataAction } from '../actions/data/QixDataAction';
import * as QixValidator from '../validators/QixValidator';
import * as QsValidator from '../validators/QsValidator';
import { QixDataActionRequest } from '../entities';
import {Boom} from '@hapi/boom';

@autoInjectable()
@controller('/qix/interface/')
export class QixController extends BaseController {
    constructor(private qixDataAction?: QixDataAction) {
        super();
    }

    @options({
        description: 'Generic Data Interface',
        notes: 'Returns the data of a specific object in a qlik sense app',
        tags: ['api', 'qix'],
        validate: {
            params: QixValidator.qixObjectSchema,
            payload: QixValidator.qixDataRequestPayload,
        },
        response: {
            schema: QixValidator.qixDataResponse,
        },
    })
    @post('/object/data/{appId}/{objectId}')
    async getDataFromObject(request: Request) {
        try {
            const requestParams = request.params as any;
            const requestPayload = request.payload as QixDataActionRequest;

            return await this.qixDataAction.run(
                requestParams,
                requestPayload
            );
        } catch (error) {
            return new Boom(error);
        }
    }
}
