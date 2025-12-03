import { autoInjectable, injectable, container } from 'tsyringe';
import { BaseAction } from '../BaseAction';
import { QrsService } from '../../services';
import * as Entities from '../../entities';
import * as Lib from '../../lib';
import { QsTagQrsResponse } from '../../entities';

@injectable()
@autoInjectable()
export class QsTagGetAction extends BaseAction<QsTagQrsResponse> {
    constructor(private qrsService?: QrsService) {
        super();
    }

    public async run(
        requestData: Entities.QlikTagsActionRequest
    ): Promise<QsTagQrsResponse> {
        // 1. Get Tag from Qlik Sense
        const tagResponse = await this.qrsService.getResource(
            requestData.userInfo,
            requestData.qsInfo,
            `tag/full?filter=(name eq '${requestData.name}')`
        );

        if (!tagResponse.body || !tagResponse.body.length) {
            throw new Lib.Errors.NotFoundError('No tag found!', {
                action: 'QsTagsGetAction',
                request: requestData,
            });
        }

        const tag = tagResponse.body;

        return tag;
    }
}
