import { autoInjectable, injectable } from 'tsyringe';
import { BaseAction } from '../BaseAction';
import { QrsService, ConfigService, LogService } from '../../services';
import * as Entities from '../../entities';
import * as Lib from '../../lib';

@injectable()
@autoInjectable()
export class QsAppFindAppIdByFilterAction extends BaseAction<string[]> {
    constructor(
        private qrsService?: QrsService,
        private configService?: ConfigService,
        private logger?: LogService
    ) {
        super();
    }

    public async run(
        requestData: Entities.QlikAppFilterRequest
    ): Promise<string[]> {
        try {
            const apps = await this.qrsService.getResource(
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
                `app/full?filter=${requestData.filter}`
            );

            if (!apps?.body || apps?.body?.length == 0) {
                throw new Lib.Errors.NotFoundError(`No app found!`, {
                    method: 'QsAppFilterByTagAction@run',
                    request: requestData,
                });
            }

            const appIds = (apps.body as any[]).map((app) => {
                return app.id;
            });

            return appIds;
        } catch (error) {
            this.logger.get().error(error.message);
            throw error;
        }
    }
}
