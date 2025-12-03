import { autoInjectable, injectable, container } from 'tsyringe';
import { BaseAction } from '../BaseAction';
import { ConfigService, QpsService, QrsService } from '../../services';
import * as Entities from '../../entities';
import * as Lib from '../../lib';
import { qrsAppAccessRights } from '../../definitions/qrs-def-app-access-rights';

@injectable()
@autoInjectable()
export class QsUserLightListAction extends BaseAction<
    Entities.QlikUserLight[]
> {
    constructor(
        private qrsService?: QrsService,
        private configService?: ConfigService
    ) {
        super();
    }

    public async run(
        requestData: Entities.QlikUserListRequest
    ): Promise<Entities.QlikUserLight[]> {
        const users: Entities.QlikUserLight[] = [];
        try {
            const payLoad = qrsAppAccessRights(requestData.qsAppGuid);

            const response = await this.qrsService.postResource(
                {
                    userDirectory: this.configService.get(
                        'QS_REPOSITORY_USER_DIRECTORY'
                    ),
                    userId: this.configService.get('QS_REPOSITORY_USER_ID'),
                },
                {
                    host: requestData.qsInfo.host,
                    qrsPort: requestData.qsInfo.qrsPort,
                },
                'SystemRule/Security/audit/matrix',
                payLoad,
                'json'
            );

            if ((response.statusCode = 201)) {
                const obj = response.body.subjects;
                for (let prop in obj) {
                    if (Object.prototype.hasOwnProperty.call(obj, prop)) {
                        const u = response.body.subjects[prop]
                            .subjectProperties as Entities.QlikUserLight;
                        u.id = prop;

                        u.userId = u['userid'];
                        u.userDirectory = u['userdirectory'];

                        delete u['userid'];
                        delete u['userdirectory'];

                        users.push(u);
                    }
                }
            }

            return users;
        } catch (error) {
            throw error;
        }
    }
}
