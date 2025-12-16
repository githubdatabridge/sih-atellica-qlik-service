import { autoInjectable, injectable, container } from 'tsyringe';
import { BaseAction } from '../BaseAction';
import { ConfigService, QpsService, QrsService } from '../../services';
import * as Entities from '../../entities';
import * as Lib from '../../lib';
import { qrsAppAccessRights } from '../../definitions/qrs-def-app-access-rights';

@injectable()
@autoInjectable()
export class QsUserListAction extends BaseAction<Entities.QlikUserLight[]> {
    constructor(
        private qrsService?: QrsService,
        private configService?: ConfigService
    ) {
        super();
    }

    public async run(
        requestData: Entities.QlikUserListRequest
    ): Promise<Entities.QlikUserLight[]> {
        const auditUsers: any = [];
        const usersFull: Entities.QlikUser[] = [];
        const usersLight: Entities.QlikUserLight[] = [];

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
                            .subjectProperties as any;
                        u.id = prop;
                        auditUsers.push(u);
                    }
                }
            } else {
                throw new Lib.Errors.QlikError(
                    'Internal Qlik Error',
                    requestData
                );
            }

            for (const user of auditUsers) {
                const u = (
                    await this.qrsService.getResource(
                        {
                            userDirectory: this.configService.get(
                                'QS_REPOSITORY_USER_DIRECTORY'
                            ),
                            userId: this.configService.get(
                                'QS_REPOSITORY_USER_ID'
                            ),
                        },
                        {
                            host: requestData.qsInfo.host,
                            qrsPort: requestData.qsInfo.qrsPort,
                        },
                        `user/full?filter=(userId eq '${user.userid}' and userDirectory eq '${user.userdirectory}')`
                    )
                )?.body[0] as Entities.QlikUser;
                usersFull.push(u);
            }

            if (
                requestData?.customProperties &&
                requestData?.customProperties.length > 0
            ) {
                for (const user of usersFull) {
                    if (!user.inactive) {
                        const customProperties: Entities.CustomPropertyResponse[] =
                            [];
                        for (const customProperty of requestData.customProperties) {
                            const values = [];
                            user.customProperties.map((c) => {
                                if (c.definition.name === customProperty.name) {
                                    if (customProperty?.values) {
                                        if (
                                            customProperty?.values.includes(
                                                c.value
                                            )
                                        ) {
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
                        if (customProperties.length > 0) {
                            usersLight.push({
                                id: user.id,
                                name: user.name,
                                userDirectory: user.userDirectory,
                                userId: user.userId,
                                customProperties: customProperties,
                            });
                        }
                    }
                }
            } else {
                for (const user of usersFull) {
                    if (!user.inactive) {
                        usersLight.push({
                            id: user.id,
                            name: user.name,
                            userDirectory: user.userDirectory,
                            userId: user.userId,
                        });
                    }
                }
            }

            return usersLight;
        } catch (error) {
            throw error;
        }
    }
}
