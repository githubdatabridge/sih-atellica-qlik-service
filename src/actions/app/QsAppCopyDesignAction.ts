import { autoInjectable, injectable } from 'tsyringe';
import { BaseAction } from '../BaseAction';
import { QixService, QrsService } from '../../services';
import {
    QsAppCopyDesignActionRequest,
    QsAppCopyDesignActionResponse,
} from '../../entities';
import * as Lib from '../../lib';

@injectable()
@autoInjectable()
export class QsAppCopyDesignAction extends BaseAction<QsAppCopyDesignActionResponse> {
    constructor(
        private qixService?: QixService,
        private qrsService?: QrsService
    ) {
        super();
    }

    public async run(
        requestData: QsAppCopyDesignActionRequest
    ): Promise<QsAppCopyDesignActionResponse> {
        try {
            // Preflight check 1/3: does the source app exist?
            let fromAppsObj = await this.qrsService.getResource(
                {
                    userDirectory: requestData.qrsUserInfo.userDirectory,
                    userId: requestData.qrsUserInfo.userId,
                },
                { host: requestData.qsHost, qrsPort: requestData.qrsPort },
                `app/full?filter=id eq ${requestData.fromApp}`
            );

            if (fromAppsObj.body.length != 1) {
                throw new Lib.Errors.NotFoundError('From app id not found.', {
                    action: 'QsAppCopyDesignAction',
                    request: requestData,
                });
            }

            //If toApps is just a GUID make it a filter condition like "id eq <GIUD>"
            if (
                requestData.toApps.match(
                    /^[a-fA-F0-9]{8}-([a-fA-F0-9]{4}-){3}[a-fA-F0-9]{12}$/g
                )
            ) {
                requestData.toApps = 'id eq ' + requestData.toApps;
            }

            let toAppsObj = await this.qrsService.getResource(
                {
                    userDirectory: requestData.qrsUserInfo.userDirectory,
                    userId: requestData.qrsUserInfo.userId,
                },
                { host: requestData.qsHost, qrsPort: requestData.qrsPort },
                `app/full?filter=(${requestData.toApps}) and id ne ${requestData.fromApp}`
            );

            if (!toAppsObj.body || !toAppsObj.body.length) {
                throw new Lib.Errors.NotFoundError(
                    'No target app(s) found to match the filter',
                    {
                        action: 'QsAppCopyDesignAction',
                        request: requestData,
                    }
                );
            }

            // Preflight check 3/3: is the data connection valid?
            let connectionObj = await this.qrsService.getResource(
                {
                    userDirectory: requestData.qrsUserInfo.userDirectory,
                    userId: requestData.qrsUserInfo.userId,
                },
                { host: requestData.qsHost, qrsPort: requestData.qrsPort },
                `dataconnection?filter=name eq '${requestData.connection}'`
            );
            if (connectionObj.body.length != 1) {
                throw new Lib.Errors.NotFoundError(
                    'No such data connection found.',
                    {
                        action: 'QsAppCopyDesignAction',
                        request: requestData,
                    }
                );
            }

            // Make a temp copy of source app
            let tempAppObj = await this.qrsService.postResource(
                {
                    userDirectory: requestData.qrsUserInfo.userDirectory,
                    userId: requestData.qrsUserInfo.userId,
                },
                { host: requestData.qsHost, qrsPort: requestData.qrsPort },
                `app/${requestData.fromApp}/copy`
            );

            let tempAppId = tempAppObj.body.id;
            let qix1, qix2;

            let refreshedApps = [];

            try {
                // Open QIX Session
                qix1 = await this.qixService.connect(
                    {
                        host: requestData.qsHost,
                        qixPort: requestData.qixPort,
                        app: tempAppId,
                    },
                    {
                        userDirectory: requestData.qixUserInfo.userDirectory,
                        userId: requestData.qixUserInfo.userId,
                    }
                );

                let qixGlobal1 = await qix1.open();
                let tempAppQix = await qixGlobal1.openDoc({
                    qDocName: tempAppId,
                    qNoData: true,
                });

                let savedScript;

                if (requestData.copyScript) {
                    savedScript = await tempAppQix.getScript();
                }

                for (let i = 0; i < toAppsObj.body.length; i++) {
                    let appInfo = toAppsObj.body[i];
                    let toAppId = appInfo.id;

                    if (!requestData.copyScript) {
                        qix2 = await this.qixService.connect(
                            {
                                host: requestData.qsHost,
                                qixPort: requestData.qixPort,
                                app: toAppId,
                            }, // vp: 'myvirtualproxy'
                            //{ userDirectory: 'INTERNAL', userId: 'sa_engine' }
                            {
                                userDirectory:
                                    requestData.qixUserInfo.userDirectory,
                                userId: requestData.qixUserInfo.userId,
                            }
                        );

                        let qixGlobal2 = await qix2.open();

                        let toAppQix = await qixGlobal2.openDoc({
                            qDocName: toAppId,
                            qNoData: true,
                        });
                        savedScript = await toAppQix.getScript();
                    }

                    await tempAppQix.setScript(
                        `BINARY [lib://${requestData.connection}/${toAppId}];`
                    );

                    await tempAppQix.doReload();

                    await tempAppQix.setScript(savedScript);
                    await tempAppQix.doSave();

                    if (!requestData.copyScript) {
                        await qix2.close();
                        await this.qixService.disconnect(qix2);
                    }

                    const logEntry = {
                        // add some info to an array to be sent back as response at the very end
                        id: toAppId,
                        name: appInfo.name,
                        published: appInfo.published,
                        stream: appInfo.published ? appInfo.stream.name : null,
                        owner: `${appInfo.owner.userDirectory}\\${appInfo.owner.userId}`,
                    };

                    await this.qrsService.putResource(
                        {
                            userDirectory:
                                requestData.qrsUserInfo.userDirectory,
                            userId: requestData.qrsUserInfo.userId,
                        },
                        {
                            host: requestData.qsHost,
                            qrsPort: requestData.qrsPort,
                        },
                        `app/${tempAppId}/replace?app=${toAppId}`
                    );

                    refreshedApps.push(logEntry);
                }

                await qix1.close();

                await this.qixService.disconnect(qix1);
            } catch (error) {
                if (qix1) {
                    await qix1.close();
                    await this.qixService.disconnect(qix1);
                }

                if (qix2) {
                    await qix2.close();
                    await this.qixService.disconnect(qix2);
                }

                throw new Lib.Errors.NotFoundError('An error has occured', {
                    action: 'QsAppCopyDesignAction',
                    request: requestData,
                    error,
                });
            }

            // Remove the temp app
            let deleteAppObj = await this.qrsService.deleteResource(
                {
                    userDirectory: requestData.qrsUserInfo.userDirectory,
                    userId: requestData.qrsUserInfo.userId,
                },
                { host: requestData.qsHost, qrsPort: requestData.qrsPort },
                `app/${tempAppId}`
            );

            return {
                fromApp: requestData.fromApp,
                toApps: requestData.toApps,
                connection: requestData.connection,
                copyScript: requestData.copyScript,
                refreshedApps,
            };
        } catch (error) {
            throw new Lib.Errors.NotFoundError('An error has occured', {
                action: 'QsAppCopyDesignAction',
                request: requestData,
                error,
            });
        }
    }
}
