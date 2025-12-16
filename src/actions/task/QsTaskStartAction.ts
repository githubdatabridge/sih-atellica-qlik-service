import { autoInjectable, injectable } from 'tsyringe';
import { BaseAction } from '../BaseAction';
import { QrsService, ConfigService } from '../../services';
import { container } from 'tsyringe';
import * as Entities from '../../entities';

const config = container.resolve(ConfigService);
@injectable()
@autoInjectable()
export class QsTaskStartAction extends BaseAction<Entities.QlikTaskStartResponse> {
    constructor(private qrsService?: QrsService) {
        super();
    }

    public async run(
        requestData: Entities.QlikTaskStartRequest
    ): Promise<Entities.QlikTaskStartResponse> {
        const response = await this.qrsService.postResource(
            requestData.userInfo,
            requestData.qsInfo,
            `task/${requestData.qlikTaskGuid}/start/synchronous`
        );

        return {
            qlikTaskGuid: requestData.qlikTaskGuid,
            qlikTaskExecutionGuid: response.body?.value,
        };
    }
}
