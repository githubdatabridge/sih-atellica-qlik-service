import { autoInjectable, injectable } from 'tsyringe';
import { BaseAction } from '../BaseAction';
import { LogService, QrsService } from '../../services';
import * as Entities from '../../entities';
import * as Lib from '../../lib';

@injectable()
@autoInjectable()
export class QsAppArchiveAction extends BaseAction<Entities.QlikAppArchiveResponse> {
    constructor(
        private qrsService?: QrsService,
        private logService?: LogService
    ) {
        super();
    }

    public async run(
        requestData: Entities.QlikAppArchiveRequest
    ): Promise<Entities.QlikAppArchiveResponse> {
        let msg = '';

        // preflight check 1) does app exist
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
                            method: 'QsOnboardArchiveAction@run',
                            request: JSON.stringify(requestData),
                        },
                    },
                ]);
            throw new Lib.Errors.NotFoundError(
                `App ${requestData.qsAppGuid} not found`,
                {
                    method: 'QsOnboardArchiveAction@run',
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
                                method: 'QsOnboardArchiveAction@run',
                                request: JSON.stringify(requestData),
                            },
                        },
                    ]
                );
            throw new Lib.Errors.NotFoundError(
                `App ${requestData.qsAppGuid} is not published to a stream`,
                { method: 'QsOnboardArchiveAction@run', request: requestData }
            );
        }

        // preflight check 2) does the archive-stream exist
        const streamFound = await this.qrsService.getResource(
            requestData.userInfo,
            requestData.qsInfo,
            `stream?filter=id eq ${requestData.qsArchiveStreamGuid}`
        );
        if (streamFound.body.length == 0) {
            this.logService
                .get()
                .error(`Stream ${requestData.qsArchiveStreamGuid} not found`, [
                    {
                        info: {
                            method: 'QsOnboardArchiveAction@run',
                            request: JSON.stringify(requestData),
                        },
                    },
                ]);
            throw new Lib.Errors.NotFoundError(
                `Stream ${requestData.qsArchiveStreamGuid} not found`,
                { method: 'QsOnboardArchiveAction@run', request: requestData }
            );
        }

        // move app to a recycle stream by putting the stream.id attribute of the app
        var movedApp;
        if (!requestData.simulate) {
            movedApp = await this.qrsService.putResource(
                requestData.userInfo,
                requestData.qsInfo,
                `app/${requestData.qsAppGuid}`,
                {
                    stream: { id: requestData.qsArchiveStreamGuid },
                    modifiedDate: '9999-12-31T23:59:59.000Z',
                }
            );
            msg += `Put the app '${appFound.body[0].name}' from stream '${appFound.body[0].stream.name}' into '${movedApp.body.stream.name}'.`;
        } else {
            msg += `**Simulation** Found the app '${appFound.body[0].name}' in stream '${appFound.body[0].stream.name}'.`;
        }

        // get a list of all tasks for the given app
        const tasks = await this.qrsService.getResource(
            requestData.userInfo,
            requestData.qsInfo,
            `reloadtask?filter=app.id eq ${requestData.qsAppGuid}`
        );
        if (!requestData.simulate) {
            // delete all tasks found
            tasks.body.forEach((task) => {
                this.qrsService.deleteResource(
                    requestData.userInfo,
                    requestData.qsInfo,
                    `reloadtask/${task.id}`
                );
            });
            msg += ` Deleted ${tasks.body.length} tasks that belonged to this app.`;
        } else {
            msg += ` Found ${tasks.body.length} tasks belonging to this app.`;
        }

        return {
            extId: requestData.extId,
            message: msg,
            deletedTasksCount: tasks.body.length,
            archivedToStreamId: requestData.qsArchiveStreamGuid,
            removedData: false,
            fileSize: appFound.body[0].fileSize,
        };
    }
}
