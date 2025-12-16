import { BaseAction } from '../BaseAction';
import { injectable, autoInjectable } from 'tsyringe';
import { QrsService } from '../../services';
import * as Entities from '../../entities';

@injectable()
@autoInjectable()
export class QsTaskStatusAction extends BaseAction<Entities.QlikTaskStatusResponse> {
    constructor(private qrsService?: QrsService) {
        super();
    }

    async run(
        requestData: Entities.QlikTaskStatusRequest
    ): Promise<Entities.QlikTaskStatusResponse> {
        let status,
            qlikAppFileSize,
            qlikLastReloadDate = null;
        const response = await this.qrsService.getResource(
            requestData.userInfo,
            requestData.qsInfo,
            `reloadtask/${requestData.qlikTaskGuid}`
        );

        status = (() => {
            if (response?.body?.operational?.lastExecutionResult?.status) {
                return response.body.operational.lastExecutionResult.status;
            }
        })();

        if (status === Entities.QlikTaskStatus.NeverStarted || !!!status) {
            status = Entities.QlikJobStatus.CREATED;
        } else if (status === Entities.QlikTaskStatus.Queued) {
            status = Entities.QlikJobStatus.QUEUED;
            return;
        } else if (
            status === Entities.QlikTaskStatus.Triggered ||
            status === Entities.QlikTaskStatus.Started
        ) {
            status = Entities.QlikJobStatus.PENDING;
        } else if (status === Entities.QlikTaskStatus.FinishedSuccess) {
            //PAM: Get app meta information
            const app = await this.qrsService.getResource(
                requestData.userInfo,
                requestData.qsInfo,
                `app/${requestData.qlikAppGuid}`
            );

            if (app) {
                qlikLastReloadDate = app.body?.lastReloadTime;
                qlikAppFileSize = app.body?.fileSize;
            }

            status = Entities.QlikJobStatus.SUCCESS;
        } else if (
            status === Entities.QlikTaskStatus.AbortInitiated ||
            status === Entities.QlikTaskStatus.Aborting ||
            status === Entities.QlikTaskStatus.Aborted ||
            status === Entities.QlikTaskStatus.FinishedFail ||
            status === Entities.QlikTaskStatus.Error ||
            status === Entities.QlikTaskStatus.Aborted ||
            status === Entities.QlikTaskStatus.Retry
        ) {
            status = Entities.QlikJobStatus.FAILED;
        }

        return {
            qlikTaskGuid: requestData.qlikTaskGuid,
            status,
            qlikAppFileSize,
            qlikLastReloadDate,
        };
    }
}
