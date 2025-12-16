import { autoInjectable, injectable, container } from 'tsyringe';
import { BaseAction } from '../BaseAction';
import { QrsService } from '../../services';
import * as Entities from '../../entities';
import * as Lib from '../../lib';
import { QsCustomPropertyQrsResponse } from '../../entities';
import { QsCustomPropertyGetAction } from './QsCustomPropertyGetAction';

@injectable()
@autoInjectable()
export class QsCustomPropertyUpdateAction extends BaseAction<QsCustomPropertyQrsResponse> {
    constructor(
        private qrsService?: QrsService,
        private qsCustomPropertyGetAction?: QsCustomPropertyGetAction
    ) {
        super();
    }

    public async run(
        requestData: Entities.QlikCustomPropertyActionRequest
    ): Promise<QsCustomPropertyQrsResponse> {
        try {
            const oldCustomProperty = await this.qsCustomPropertyGetAction.run({
                extId: requestData.extId,
                userInfo: requestData.userInfo,
                qsInfo: requestData.qsInfo,
                qsCustomPropGuid: requestData.qsCustomPropGuid,
            });

            // check if extId is already in the choiceValues
            let cpChoices = oldCustomProperty.choiceValues;
            const index = cpChoices.indexOf(requestData.extId);
            if (index > -1) {
                // add customer id to the choiceValues
                cpChoices.splice(index, 1);
                await this.qrsService.putResource(
                    requestData.userInfo,
                    requestData.qsInfo,
                    `custompropertydefinition/${requestData.qsCustomPropGuid}`,
                    {
                        choiceValues: cpChoices,
                        modifiedDate: '2199-12-31T12:59:59.999Z',
                    }
                );
            }
            return await this.qsCustomPropertyGetAction.run({
                extId: requestData.extId,
                userInfo: requestData.userInfo,
                qsInfo: requestData.qsInfo,
                qsCustomPropGuid: requestData.qsCustomPropGuid,
            });
        } catch (error) {
            throw error;
        }
    }
}
