import { autoInjectable, injectable, container } from 'tsyringe';
import { BaseAction } from '../BaseAction';
import { ConfigService, QpsService } from '../../services';
import * as Entities from '../../entities';
import { QSyncUserPropertiesAction } from './QsUserSyncUserPropertiesAction';

const config = container.resolve(ConfigService);
@injectable()
@autoInjectable()
export class QsUserSessionAuthAction extends BaseAction<Entities.QlikUserAuthResponse> {
    constructor(
        private qpsService?: QpsService,
        private qsSyncUserPropertiesAction?: QSyncUserPropertiesAction
    ) {
        super();
    }

    public async run(
        requestData: Entities.QlikUserAuthRequest,
        hasToSync
    ): Promise<Entities.QlikUserAuthResponse> {
        let r = null;
        let sId = null;

        try {
            const activeSessions = await this.qpsService.getActiveSession(
                requestData.userInfo,
                requestData.qsInfo
            );

            for (const session of activeSessions) {
                const removeSession = await this.qpsService.deleteSession(
                    session.SessionId,
                    requestData.qsInfo
                );
            }

            if (hasToSync) {
                let request = { ...requestData };
                const user = await this.qsSyncUserPropertiesAction.run(
                    requestData as Entities.QlikUserSyncRequest
                );
            }

            r = await this.qpsService.createSession(
                requestData.userInfo,
                requestData.qsInfo
            );
            sId = r.sessionId;

            return { sessionId: sId };
        } catch (error) {
            throw error;
        }
    }
}
