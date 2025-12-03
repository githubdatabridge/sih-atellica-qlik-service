import { autoInjectable, injectable, container } from 'tsyringe';
import { BaseAction } from '../BaseAction';
import { QrsService } from '../../services';
import * as Entities from '../../entities';
import { QsTagGetAction } from './QsTagGetAction';

@injectable()
@autoInjectable()
export class QsTagDeleteAction extends BaseAction<boolean> {
    constructor(
        private qrsService?: QrsService,
        private qsTagGetAction?: QsTagGetAction
    ) {
        super();
    }

    public async run(
        requestData: Entities.QlikTagsActionRequest
    ): Promise<boolean> {
        try {
            // 1. Get Tag from Qlik Sense
            const tag = await this.qsTagGetAction.run({
                qsInfo: requestData.qsInfo,
                userInfo: requestData.userInfo,
                name: requestData.name,
            });

            // 2. Delete Tag from Qlik Sense
            const removeTag = await this.qrsService.deleteResource(
                requestData.userInfo,
                requestData.qsInfo,
                `tag/${tag.id}`
            );

            return removeTag.statusCode === 204 || false;
        } catch (error) {
            throw error;
        }
    }
}
