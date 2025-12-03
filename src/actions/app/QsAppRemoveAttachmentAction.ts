import { autoInjectable, injectable } from 'tsyringe';
import { BaseAction } from '../BaseAction';
import { QrsService } from '../../services';
import * as Entities from '../../entities';
import * as Lib from '../../lib';

@injectable()
@autoInjectable()
export class QsAppRemoveAttachmentAction extends BaseAction<Entities.QlikAppRemoveAttachmentActionResponse> {
    constructor(private qrsService?: QrsService) {
        super();
    }

    public async run(
        appId: string,
        requestData: Entities.QlikAppRemoveAttachmentActionRequest
    ): Promise<Entities.QlikAppRemoveAttachmentActionResponse> {
        try {
            const resultAttachement = await this.qrsService.getResource(
                {
                    userDirectory: requestData.qrsUserInfo.userDirectory,
                    userId: requestData.qrsUserInfo.userId,
                },
                {
                    host: requestData.qsInfo.host,
                    qrsPort: requestData.qsInfo.qrsPort,
                },
                'app/content/full?filter=' +
                    encodeURIComponent(
                        `references.logicalPath ew '${appId}/${requestData.fileName}'`
                    )
            );

            if (resultAttachement.body.length == 0) {
                // file attachment does not exist. Return a friendly error
                throw new Lib.Errors.NotFoundError('No such attachment found', {
                    action: 'QsAppRemoveAttachmentAction',
                    request: requestData,
                    message: `${appId}/${requestData.fileName}`,
                });
            } else {
                const resultRemoveAttachement =
                    await this.qrsService.deleteResource(
                        {
                            userDirectory:
                                requestData.qrsUserInfo.userDirectory,
                            userId: requestData.qrsUserInfo.userId,
                        },
                        {
                            host: requestData.qsInfo.host,
                            qrsPort: requestData.qsInfo.qrsPort,
                        },
                        `appcontent/${appId}/deletecontent?externalpath=${requestData.fileName}`
                    );

                return { result: resultRemoveAttachement.statusCode === 204 };
            }
        } catch (error) {
            throw new Lib.Errors.NotFoundError(
                `${error.message}: ${error.customData.message}`,
                {
                    action: 'QsAppRemoveAttachmentAction',
                    request: requestData,
                    error,
                }
            );
        }
    }
}
