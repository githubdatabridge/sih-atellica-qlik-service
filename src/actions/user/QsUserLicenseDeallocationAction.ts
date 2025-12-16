import { autoInjectable, injectable, container } from 'tsyringe';
import { BaseAction } from '../BaseAction';
import { QrsService, ConfigService, LogService } from '../../services';
import * as Entities from '../../entities';
import * as Lib from '../../lib';

const config = container.resolve(ConfigService);
@injectable()
@autoInjectable()
export class QsUserLicenseDeallocationAction extends BaseAction<Entities.QlikUserActionResponse> {
    constructor(
        private qrsService?: QrsService,
        private logService?: LogService
    ) {
        super();
    }

    public async run(
        req: Entities.QlikUserActionRequest
    ): Promise<Entities.QlikUserActionResponse> {
        try {
            let ret = {};
            let counter = 0;
            for (let i = 0; i <= 1; i++) {
                // repeat the steps 2x
                const licenseType = ['professional', 'analyzer'][i];
                const reply = await this.qrsService.getResource(
                    req.userInfo,
                    req.qsInfo,
                    `license/${licenseType}accesstype?filter=user.userId eq '${req.removeUserInfo.userId}' and user.userDirectory eq '${req.removeUserInfo.userDirectory}'`
                );
                counter += reply.body.length;
                ret[licenseType] = reply.body;

                const allocations = reply.body;
                for (const allocation of allocations) {
                    ret[licenseType].push(allocation.id);
                    if (!req.simulate) {
                        const removeAllocation =
                            await this.qrsService.deleteResource(
                                req.userInfo,
                                req.qsInfo,
                                `license/${licenseType}accesstype/${allocation.id}`
                            );
                    }
                }
            }

            return {
                message:
                    (req.simulate ? '*Simulation* Found' : 'Deleted') +
                    ` ${counter} user allocations.`,
                totalCount: counter,
                counterAnalyzer: ret['analyzer'].length,
                counterProfessional: ret['professional'].length,
            };
        } catch (error) {
            this.logService.get().error('An error has occurred', [
                {
                    info: {
                        method: 'QsUserLicenseDeallocationAction@run',
                        request: JSON.stringify(req),
                        error: JSON.stringify(error),
                    },
                },
            ]);
            throw new Lib.Errors.NotFoundError('An error has occured', {
                method: 'QsUserLicenseDeallocationAction@run',
                request: req,
                error,
            });
        }
    }
}
