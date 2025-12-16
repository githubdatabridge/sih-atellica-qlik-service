import { autoInjectable, injectable, container } from 'tsyringe';
import { BaseAction } from '../BaseAction';
import { QrsService, ConfigService } from '../../services';
import * as Entities from '../../entities';
import * as Lib from '../../lib';
import { QsAppRemoveAction } from '../app/QsAppRemoveAction';
import { QsUserRemoveAction } from '../user/QsUserRemoveAction';
import { QsCustomPropertyUpdateAction } from '../customproperty/QsCustomPropertyUpdateAction';
import { QsTagDeleteAction } from '../tags/QsTagDeleteAction';

const config = container.resolve(ConfigService);
@injectable()
@autoInjectable()
export class QsIntegrationRemoveAction extends BaseAction<Entities.QlikUIntegrationRemoveActionResponse> {
    constructor(
        private qrsService?: QrsService,
        private qsAppRemoveAction?: QsAppRemoveAction,
        private qsUserRemoveAction?: QsUserRemoveAction,
        private qsCustomPropertyUpdateAction?: QsCustomPropertyUpdateAction,
        private qsTagDeleteAction?: QsTagDeleteAction
    ) {
        super();
    }

    public async run(
        requestData: Entities.QlikUIntegrationRemoveActionRequest
    ): Promise<Entities.QlikUIntegrationRemoveActionResponse> {
        try {
            // 1. Get apps by custom property id
            const responseApps = await this.qrsService.getResource(
                requestData.userInfo,
                requestData.qsInfo,
                `app/full?filter=(@customerId eq '${requestData.extId}')')`
            );

            // 2.Remove app
            if (responseApps.body.length > 0) {
                const apps = responseApps.body;
                for (const app of apps) {
                    const removeApp = await this.qsAppRemoveAction.run({
                        qsInfo: requestData.qsInfo,
                        userInfo: requestData.userInfo,
                        extId: requestData.extId,
                        qsAppGuid: app.id,
                    });
                }

                // 3. Get user by custom property id
                const responseUsers = await this.qrsService.getResource(
                    requestData.userInfo,
                    requestData.qsInfo,
                    `user/full?filter=(@customerId eq '${requestData.extId}')')`
                );

                // 4. Loop through the users
                if (responseUsers.body.length > 0) {
                    const users = responseUsers.body;
                    for (const user of users) {
                        // 5. If user has only 1 custom property offboard the user!
                        if (
                            user.customProperties.length === 1 &&
                            user.customProperties.choiceValues.indexOf(
                                requestData.extId
                            ) > -1
                        ) {
                            // 6. Remove User
                            const removeUser =
                                await this.qsUserRemoveAction.run({
                                    qsInfo: requestData.qsInfo,
                                    userInfo: requestData.userInfo,
                                    removeUserInfo: {
                                        userDirectory: user.userDirectory,
                                        userId: user.id,
                                    },
                                });
                        } else {
                            // 7. Otherwise just patch the custom property of the user by removing the extId
                            const oldCustomProperties = user.map(
                                (u) => user.customProperties
                            );

                            const patchedCustomProperties =
                                oldCustomProperties.filter(function (prop) {
                                    return prop.value !== requestData.extId;
                                });

                            const patchedUser = (({ customProperties, ...o }) =>
                                o)(user);
                            patchedUser['customProperties'] =
                                patchedCustomProperties;

                            const updatedUser =
                                await this.qrsService.putResource(
                                    requestData.userInfo,
                                    requestData.qsInfo,
                                    `user/${user.id}`,
                                    patchedUser
                                );
                        }
                    }
                }
            }

            // 8. Remove custom property value from custom properties list
            const customProperty = await this.qsCustomPropertyUpdateAction.run({
                userInfo: requestData.userInfo,
                qsInfo: requestData.qsInfo,
                qsCustomPropGuid: requestData.qsCustomPropGuid,
                extId: requestData.extId,
            });

            // 9. Remove tag from the list
            const tag = await this.qsTagDeleteAction.run({
                userInfo: requestData.userInfo,
                qsInfo: requestData.qsInfo,
                name: requestData.extId,
            });

            return { success: true };
        } catch (error) {
            throw error;
        }
    }
}
