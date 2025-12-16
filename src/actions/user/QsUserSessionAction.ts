import { autoInjectable, injectable, container } from 'tsyringe';
import { BaseAction } from '../BaseAction';
import { ConfigService, QpsService, QrsService } from '../../services';
import * as Entities from '../../entities';
import * as Lib from '../../lib';

@injectable()
@autoInjectable()
export class QsUserSessionAction extends BaseAction<Entities.QlikUserLight> {
    constructor(
        private qpsService?: QpsService,
        private qrsService?: QrsService,
        private configService?: ConfigService
    ) {
        super();
    }

    public async run(
        requestData: Entities.QlikUserSessionRequest
    ): Promise<Entities.QlikUserLight> {
        const customProperties: Entities.CustomPropertyResponse[] = [];
        try {
            const userSession = (await this.qpsService.getSession(
                requestData.sessionId,
                requestData.qsInfo
            )) as Entities.QlikUserSessionResponse;

            if (!userSession) {
                throw new Lib.Errors.NotFoundError(
                    `User with session ${requestData.sessionId} not found!`,
                    {
                        method: 'QsUserSessionAction@run',
                        request: requestData,
                    }
                );
            }

            const userFull = (
                await this.qrsService.getResource(
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
                    `user/full?filter=(userId eq '${userSession.UserId}' and userDirectory eq '${userSession.UserDirectory}')`
                )
            )?.body as Entities.QlikUser[];

            if (!userFull && userFull.length === 0) {
                throw new Lib.Errors.NotFoundError(
                    `User ${userSession.UserDirectory}\\${userSession.UserId} not found!`,
                    {
                        method: 'QsUserSessionAction@run',
                        request: userSession,
                    }
                );
            }

            const user = userFull[0];

            if (
                requestData?.customProperties &&
                requestData?.customProperties.length > 0
            ) {
                for (const customProperty of requestData.customProperties) {
                    const values = [];
                    user.customProperties.map((c) => {
                        if (c.definition.name === customProperty.name) {
                            if (customProperty?.values) {
                                if (customProperty?.values.includes(c.value)) {
                                    values.push(c.value);
                                }
                            } else {
                                values.push(c.value);
                            }
                        }
                    });
                    if (values.length > 0) {
                        customProperties.push({
                            key: customProperty.key,
                            name: customProperty.name,
                            values: values,
                        });
                    }
                }
            }

            return {
                id: user.id,
                name: user.name,
                userDirectory: user.userDirectory,
                userId: user.userId,
                customProperties: customProperties,
            };
        } catch (error) {
            throw error;
        }
    }
}
