import { get, controller, options } from 'hapi-decorators';
import { BaseController } from './BaseController';
import { Request } from '@hapi/hapi';
import { autoInjectable } from 'tsyringe';
import { PongService } from '../services';

import * as PingValidator from '../validators/PingValidator';

@autoInjectable()
@controller('/ping')
export class PingController extends BaseController {
    constructor(private pongService?: PongService) {
        super();
    }

    @options({
        description: 'Ping the service',
        tags: ['api'],
        response: {
            schema: PingValidator.response,
        },
        auth: false,
        plugins: {
            'hapi-swagger': {
                security: [],
            },
        },
    })
    @get('/')
    ping(request: Request) {
        return {
            ping: this.pongService.pong(),
        };
    }
}
