import { autoInjectable, injectable } from 'tsyringe';
import { BaseAction } from '../BaseAction';
import { QpsService, QrsService } from '../../services';
import * as Entities from '../../entities';
import * as Lib from '../../lib';

@injectable()
@autoInjectable()
export class QsUserSessionEndAction extends BaseAction<void> {
    constructor(
        private qpsService?: QpsService,
        private qrsService?: QrsService
    ) {
        super();
    }

    public async run(
        requestData: Entities.QlikUserSessionRequest
    ): Promise<void> {
        try {
            const userSession = (await this.qpsService.getSession(
                requestData.sessionId,
                requestData.qsInfo
            )) as Entities.QlikUserSessionResponse;

            if (!userSession) {
                throw new Lib.Errors.NotFoundError(
                    `User with session ${requestData.sessionId} not found!`,
                    {
                        method: 'QsUserSessionEndAction@run',
                        request: requestData,
                    }
                );
            }

            const result = await this.qpsService.deleteSession(
                requestData.sessionId,
                requestData.qsInfo
            );

            return;
        } catch (error) {
            throw error;
        }
    }
}
