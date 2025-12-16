import { autoInjectable, injectable, container } from 'tsyringe';
import { BaseAction } from '../BaseAction';
import { QrsService, ConfigService } from '../../services';
import * as Entities from '../../entities';
import * as Lib from '../../lib';

const config = container.resolve(ConfigService);
@injectable()
@autoInjectable()
export class QsUserRemoveAction extends BaseAction<boolean> {
    constructor(private qrsService?: QrsService) {
        super();
    }

    public async run(req: Entities.QlikUserActionRequest): Promise<boolean> {
        let isDeleted = false;
        try {
            const user = await this.qrsService.getResource(
                req.userInfo,
                req.qsInfo,
                `user/full?filter=(userId eq '${req.removeUserInfo.userId}' and userDirectory eq '${req.removeUserInfo.userDirectory}')`
            );

            if (user && user.body.length > 0) {
                const id = user.body[0].id;
                const r = await this.qrsService.deleteResource(
                    req.userInfo,
                    req.qsInfo,
                    `user/${id}`
                );
                isDeleted = r.statusCode === 204 || false;
            } else {
                throw new Lib.Errors.NotFoundError('No user found', {
                    method: 'QsUserLicenseDeleteAction@run',
                    request: req,
                });
            }

            return isDeleted;
        } catch (error) {
            throw error;
        }
    }
}
