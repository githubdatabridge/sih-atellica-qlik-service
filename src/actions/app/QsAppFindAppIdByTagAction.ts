import { autoInjectable, injectable } from 'tsyringe';
import { BaseAction } from '../BaseAction';
import { QrsService, ConfigService } from '../../services';
import * as Entities from '../../entities';
import * as Lib from '../../lib';

@injectable()
@autoInjectable()
export class QsAppFindAppIdByTagAction extends BaseAction<string[]> {
    constructor(
        private qrsService?: QrsService,
        private configService?: ConfigService
    ) {
        super();
    }

    public async run(
        requestData: Entities.QlikAppByTagRequest
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
                `app/full?filter=((publishTime ne '1753-01-01T00:00:00.000Z') and tags.name so '${requestData.tagName}')`
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
            throw error;
        }
    }
}
