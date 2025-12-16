import { autoInjectable, injectable, container } from 'tsyringe';
import { BaseAction } from '../BaseAction';
import { LogService, QrsService } from '../../services';
import * as Entities from '../../entities';
import * as Lib from '../../lib';

@injectable()
@autoInjectable()
export class QsAppRemoveAction extends BaseAction<Entities.QlikAppRemoveResponse> {
    constructor(
        private qrsService?: QrsService,
        private logService?: LogService
    ) {
        super();
    }

    public async run(
        requestData: Entities.QlikAppRemoveRequest
    ): Promise<Entities.QlikAppRemoveResponse> {
        const appFound = await this.qrsService.getResource(
            requestData.userInfo,
            requestData.qsInfo,
            `app/full?filter=id eq ${requestData.qsAppGuid}`
        );

        if (appFound.body.length == 0) {
            this.logService
                .get()
                .error(`App ${requestData.qsAppGuid} not found`, [
                    {
                        info: {
                            method: 'QsAppRemoveAction@run',
                            request: JSON.stringify(requestData),
                        },
                    },
                ]);
            throw new Lib.Errors.NotFoundError(
                `App ${requestData.qsAppGuid} not found`,
                {
                    method: 'QsAppRemoveAction@run',
                    request: requestData,
                }
            );
        } else if (!appFound.body[0].published) {
            this.logService
                .get()
                .error(
                    `App ${requestData.qsAppGuid} is not published to a stream`,
                    [
                        {
                            info: {
                                method: 'QsAppRemoveAction@run',
                                request: JSON.stringify(requestData),
                            },
                        },
                    ]
                );
            throw new Lib.Errors.NotFoundError(
                `App ${requestData.qsAppGuid} is not published to a stream`,
                { method: 'QsAppRemoveAction@run', request: requestData }
            );
        }

        // delete app by GUD
        const app = await this.qrsService.deleteResource(
            requestData.userInfo,
            requestData.qsInfo,
            `/app/${requestData.qsAppGuid}`
        );

        return {
            extId: requestData.extId,
            appIsRemoved: app.statusCode === 204 || false,
        };
    }
}
