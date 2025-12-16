import { autoInjectable, injectable, container } from 'tsyringe';
import { BaseAction } from '../BaseAction';
import { QrsService } from '../../services';
import * as Entities from '../../entities';
import * as Lib from '../../lib';
import { QsCustomPropertyQrsResponse } from '../../entities';

@injectable()
@autoInjectable()
export class QsCustomPropertyGetAction extends BaseAction<QsCustomPropertyQrsResponse> {
    constructor(private qrsService?: QrsService) {
        super();
    }

    public async run(
        requestData: Entities.QlikCustomPropertyActionRequest
    ): Promise<QsCustomPropertyQrsResponse> {
        try {
            const customPropertyResponse = await this.qrsService.getResource(
                requestData.userInfo,
                requestData.qsInfo,
                `custompropertydefinition/${requestData.qsCustomPropGuid}`
            );

            if (!customPropertyResponse.body) {
                throw new Lib.Errors.NotFoundError(
                    'Custom property not found!',
                    {
                        action: 'QsCustomPropertyGetAction',
                        request: requestData,
                    }
                );
            }

            const customProperty =
                customPropertyResponse.body as QsCustomPropertyQrsResponse;

            return customProperty;
        } catch (error) {
            throw error;
        }
    }
}
