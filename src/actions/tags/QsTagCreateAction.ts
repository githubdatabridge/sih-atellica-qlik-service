import { autoInjectable, injectable, container } from 'tsyringe';
import { BaseAction } from '../BaseAction';
import { QrsService } from '../../services';
import * as Entities from '../../entities';

@injectable()
@autoInjectable()
export class QsTagCreateAction extends BaseAction<Entities.QsTagQrsResponse> {
    constructor(private qrsService?: QrsService) {
        super();
    }

    public async run(
        requestData: Entities.QlikTagsActionRequest
    ): Promise<Entities.QsTagQrsResponse> {
        return (
            await this.qrsService.postResource(
                requestData.userInfo,
                requestData.qsInfo,
                'tag',
                {
                    name: requestData.name,
                }
            )
        ).body as Entities.QsTagQrsResponse;
    }
}
