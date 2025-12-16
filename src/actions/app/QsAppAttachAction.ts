import { autoInjectable, injectable } from 'tsyringe';
import { BaseAction } from '../BaseAction';
import { LogService, QrsService } from '../../services';
import * as Entities from '../../entities';
import * as Lib from '../../lib';

@injectable()
@autoInjectable()
export class QsAppAttachAction extends BaseAction<Entities.QlikAppAttachActionResponse> {
    constructor(
        //private qixService?: QixService,
        private qrsService?: QrsService,
        private logService?: LogService
    ) {
        super();
    }

    public async run(
        appId: string,
        requestData: Entities.QlikAppAttachActionRequest
    ): Promise<Entities.QlikAppAttachActionResponse> {
        try {
            this.logService
                .get()
                .info(`File "${requestData.fileName}" read. Now posting ...`);
            this.logService
                .get()
                .info(
                    'post: ',
                    `appcontent/${appId}/uploadfile?externalpath=${requestData.fileName}&overwrite=true`
                );

            const resultAttachFile = await this.qrsService.postResource(
                {
                    userDirectory: requestData.qrsUserInfo.userDirectory,
                    userId: requestData.qrsUserInfo.userId,
                },
                {
                    host: requestData.qsInfo.host,
                    qrsPort: requestData.qsInfo.qrsPort,
                },
                `appcontent/${appId}/uploadfile?externalpath=${requestData.fileName}&overwrite=true`,
                Buffer.from(requestData.file),
                // Excel Files have their own content-type
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            );
            if (resultAttachFile.statusCode !== 201) {
                throw new Lib.Errors.InternalError('No file attached!', {
                    action: 'QsAppAttachAction',
                    request: requestData,
                });
            }

            // make another call to find out the url for the newly uploaded file
            const resultPathFile = await this.qrsService.getResource(
                {
                    userDirectory: requestData.qrsUserInfo.userDirectory,
                    userId: requestData.qrsUserInfo.userId,
                },
                {
                    host: requestData.qsInfo.host,
                    qrsPort: requestData.qsInfo.qrsPort,
                },
                `app/content/full?filter=app.id eq ${appId}`
            );
            let path = '';
            resultPathFile.body[0].references.forEach((attmt) => {
                if (
                    attmt.logicalPath.substr(
                        -1 * requestData.fileName.length
                    ) == requestData.fileName
                ) {
                    path = attmt.externalPath;
                }
            });
            return { path };
        } catch (error) {
            throw new Lib.Errors.NotFoundError('An error has occured', {
                action: 'QsAppAttachAction',
                request: requestData,
                error,
            });
        }
    }
}
