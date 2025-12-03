import { QlikBaseRequest } from './QlikBaseEntities';

export interface QlikCustomPropertyActionRequest extends QlikBaseRequest {
    qsCustomPropGuid: string;
    extId: string;
}
