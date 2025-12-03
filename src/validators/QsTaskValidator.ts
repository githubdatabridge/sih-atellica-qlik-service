import * as Entities from '../entities';
import * as Joi from 'joi';
import { qsSchema, userSchema } from './QsValidator';

const qlikJobStatusValidator = Joi.string()
    .valid(
        Entities.QlikJobStatus.PENDING,
        Entities.QlikJobStatus.CREATED,
        Entities.QlikJobStatus.FAILED,
        Entities.QlikJobStatus.QUEUED,
        Entities.QlikJobStatus.SUCCESS
    )
    .label('QlikJobStatusSchema');

const qsTaskStartRequest = Joi.object({
    qsInfo: qsSchema.required(),
    userInfo: userSchema.required(),
    qlikAppGuid: Joi.string().guid().optional().allow(null),
    qlikTaskGuid: Joi.string().guid().required(),
}).label('QsTaskStartRequest');

const qsTaskStartResponse = Joi.object({
    qlikTaskGuid: Joi.string().guid().required(),
    qlikTaskExecutionGuid: Joi.string().guid().optional(),
}).label('QsTaskStartResponse');

const qsTaskStatusRequest = Joi.object({
    qlikAppGuid: Joi.string().guid().optional().allow(null),
    qlikTaskGuid: Joi.string().guid().required(),
    qsInfo: qsSchema.required(),
    userInfo: userSchema.required(),
}).label('QsTaskStatusRequest');

const qsTaskStatusResponse = Joi.object({
    qlikTaskGuid: Joi.string().guid().required(),
    qlikTaskExecutionGuid: Joi.string().guid().optional(),
    status: qlikJobStatusValidator,
    qlikAppFileSize: Joi.number().optional().allow(null),
    qlikLastReloadDate: Joi.date().optional().allow(null),
}).label('QsTaskStatusResponse');

export {
    qsTaskStartRequest,
    qsTaskStartResponse,
    qsTaskStatusRequest,
    qsTaskStatusResponse,
};
