import { autoInjectable, injectable, container } from 'tsyringe';
import { BaseAction } from '../BaseAction';
import { QrsService, ConfigService, QpsService } from '../../services';
import * as Entities from '../../entities';
import * as Lib from '../../lib';

const config = container.resolve(ConfigService);
@injectable()
@autoInjectable()
export class QSyncUserPropertiesAction extends BaseAction<any> {
    constructor(private qrsService?: QrsService) {
        super();
    }

    public async run(requestData: Entities.QlikUserSyncRequest): Promise<any> {
        let sUser = null;

        try {
            // 1. Get User from Qlik Sense
            const user = await this.qrsService.getResource(
                requestData.qrsUserInfo,
                requestData.qrsInfo,
                `user/full?filter=(userId eq '${requestData.userInfo.userId}' and userDirectory eq '${requestData.userInfo.userDirectory}')`
            );

            // 2. Check if some custom properties are passed
            let newCustomProperties = [];
            if (requestData.userInfo.customProperty) {
                for (const attribute of requestData.userInfo.attributes) {
                    newCustomProperties.push({
                        value: attribute['customerId'],
                        definition: {
                            id: requestData.userInfo.customProperty,
                        },
                    });
                }
            }

            // 3. If user does not exists create the user
            if (user.body.length === 0) {
                sUser = await this.qrsService.postResource(
                    requestData.qrsUserInfo,
                    requestData.qrsInfo,
                    `user`,
                    {
                        userId: requestData.userInfo.userId,
                        name: requestData.userInfo.userId,
                        userDirectory: requestData.userInfo.userDirectory,
                        removedExternally: false,
                        blacklisted: false,
                        newCustomProperties,
                    }
                );
            }
            // 4. Otherwise update properties
            else {
                const userObject = user.body[0];
                const cloneUser = (({ customProperties, ...o }) => o)(
                    userObject
                ); // remove customProperties
                cloneUser['customProperties'] = newCustomProperties;

                sUser = await this.qrsService.putResource(
                    requestData.qrsUserInfo,
                    requestData.qrsInfo,
                    `user/${userObject.id}`,
                    cloneUser
                );
            }

            return sUser;
        } catch (error) {
            throw error;
        }
    }
}
