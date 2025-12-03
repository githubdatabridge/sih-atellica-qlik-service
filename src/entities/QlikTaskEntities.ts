import { QlikBaseRequest } from './QlikBaseEntities';
import { QlikJobStatus } from './QlikJobEntities';

export interface QlikTaskStartRequest extends QlikBaseRequest {
    qlikAppGuid?: string;
    qlikTaskGuid: string;
}

export interface QlikTaskStartResponse {
    qlikTaskGuid: string;
    qlikTaskExecutionGuid: string;
}
export interface QlikTaskStatusRequest extends QlikBaseRequest {
    qlikAppGuid?: string;
    qlikTaskGuid: string;
}

export interface QlikTaskStatusResponse {
    qlikTaskGuid: string;
    status?: QlikJobStatus;
    qlikAppFileSize?: number;
    qlikLastReloadDate?: Date;
}
