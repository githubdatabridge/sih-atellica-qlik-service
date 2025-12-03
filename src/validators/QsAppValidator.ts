import * as Joi from 'joi';
import { qsSchema, userSchema } from './QsValidator';

const appRequestPayload = Joi.object({
    extId: Joi.string().required(),
    qsInfo: qsSchema.required(),
    userInfo: userSchema.required(),
    qsProjectName: Joi.string().required(),
    qsStreamGuid: Joi.string().required(),
    qsStreamEtlGuid: Joi.string().optional(),
    qsSourceEtlAppGuid: Joi.string().required(),
    qsSourceAppGuid: Joi.string().required(),
    qsCustomPropGuid: Joi.string().required(),
    qsTaskCompositeEvents: Joi.object()
        .optional()
        .allow(null)
        .label('QsTaskCompositeEvents'),
    qsTaskSchemaEvents: Joi.object()
        .optional()
        .allow(null)
        .label('QsTaskSchemaEvents'),
}).label('QsAppRequest');

const appResponsePayload = Joi.object({
    extId: Joi.string().required(),
    qsAppGuid: Joi.string().required(),
    qsEtlAppGuid: Joi.string().required(),
    qsTaskGuid: Joi.string().required(),
    qsEtlTaskGuid: Joi.string().required(),
    status: Joi.string().required(),
}).label('QsAppResponse');

const appArchiveRequestPayload = Joi.object({
    extId: Joi.string().required(),
    qsAppGuid: Joi.string().required(),
    qsArchiveStreamGuid: Joi.string().required(),
    qsInfo: qsSchema.required(),
    userInfo: userSchema.required(),
}).label('QsAppArchivePayloadRequest');

const appArchiveRequestQuery = Joi.object({
    simulate: Joi.boolean().optional().default(false),
}).label('QsAppArchiveQueryRequest');

const appArchiveResponsePayload = Joi.object({
    extId: Joi.string(),
    message: Joi.string().optional(),
    deletedTasksCount: Joi.number().optional(),
    archivedToStreamId: Joi.string().optional(),
    removedData: Joi.boolean().optional(),
    fileSize: Joi.number().optional(),
}).label('QsAppArchiveResponse');

const appRemoveRequestPayload = Joi.object({
    extId: Joi.string().required(),
    qsAppGuid: Joi.string().required(),
    qsInfo: qsSchema.required(),
    userInfo: userSchema.required(),
}).label('QsAppRemovePayloadRequest');

const appRemoveResponsePayload = Joi.object({
    extId: Joi.string().required(),
    appIsRemoved: Joi.boolean().required(),
}).label('QsAppRemovePayloadResponse');

const appCopyDesignRequestQuery = Joi.object({
    fromApp: Joi.string()
        .required()
        .guid()
        .description('36 chars long GUID of the source app'),
    toApps: Joi.string()
        .required()
        .description('GUID of target app or filter expression for target apps'),
    connection: Joi.string()
        .required()
        .description('Data connection that points to the app folder'),
    copyScript: Joi.boolean().description(
        'true to copy also script to target app(s). Default: false'
    ),
}).label('QsAppCopyDesignQueryRequest');

const appCopyDesignRequestPayload = Joi.object({
    host: Joi.string().required(),
    qrsPort: Joi.number().default(4242),
    qixPort: Joi.number().default(4747),
    qrsUserInfo: userSchema.required(),
    qixUserInfo: userSchema.required(),
}).label('QsAppCopyDesignRequestPayload');

const appAttachRequestPayload = Joi.object({
    file: Joi.object()
        .keys({})
        .unknown(true)
        .options({ stripUnknown: true })
        .label('FileSchema'),
    qsInfo: qsSchema.required(),
    qrsUserInfo: userSchema.required(),
    fileName: Joi.string()
        .required()
        .description('name of the file which should be attached to the app'),
}).label('QsAppAttachRequestPayload');

const appRemoveAttachmentRequestPayload = Joi.object({
    qsInfo: qsSchema.required(),
    qrsUserInfo: userSchema.required(),
    fileName: Joi.string()
        .required()
        .description('name of the file which should be attached to the app'),
}).label('QsAppRemoveAttachmentRequestPayload');

const appAttachRequestQuery = Joi.object({
    appId: Joi.string()
        .required()
        .guid()
        .description('36 chars long GUID of the source app'),
}).label('QsAppAttachRequestQuery');

const appAttachResponsePayload = Joi.object({
    path: Joi.string().required(),
}).label('QsAppAttachResponsePayload');

const appRemoveAttachmentResponsePayload = Joi.object({
    result: Joi.boolean().required(),
}).label('QsAppRemoveAttachmentResponsePayload');

const appFilterRequestQuery = Joi.object({
    filter: Joi.string().required().description('filter condition'),
}).label('QsAppFilterRequestQuery');

const appFilterRequestPayload = Joi.object({
    qsInfo: qsSchema.required(),
}).label('QsAppFilterRequestPayload');

const appTagRequestPayload = Joi.object({
    qsInfo: qsSchema.required(),
}).label('QsAppFilterRequestPayload');

const appTagRequestQuery = Joi.object({
    tag: Joi.string().required().description('tag name'),
}).label('QsAppFilterRequestQuery');

export {
    appRequestPayload,
    appResponsePayload,
    appArchiveRequestPayload,
    appArchiveRequestQuery,
    appArchiveResponsePayload,
    appRemoveRequestPayload,
    appRemoveResponsePayload,
    appCopyDesignRequestQuery,
    appCopyDesignRequestPayload,
    appAttachRequestQuery,
    appRemoveAttachmentRequestPayload,
    appAttachResponsePayload,
    appAttachRequestPayload,
    appRemoveAttachmentResponsePayload,
    appFilterRequestQuery,
    appFilterRequestPayload,
    appTagRequestQuery,
    appTagRequestPayload,
};
