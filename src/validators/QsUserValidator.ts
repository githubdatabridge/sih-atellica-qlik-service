import * as Joi from 'joi';
import { qsSchema, userSchema } from './QsValidator';

const customPropertyDefinitionSchema = Joi.object({
    id: Joi.string().guid().required(),
    name: Joi.string().required(),
    valueType: Joi.string().required(),
    choiceValues: Joi.array()
        .items(Joi.string())
        .label('QsCustomPropertyDefinitionChoiceValueSchema'),
    privileges: Joi.object()
        .keys({})
        .unknown(true)
        .options({ stripUnknown: true })
        .label('QsCustomPropertyDefinitionPrivilegesSchema')
        .allow(null),
}).label('QsCustomPropertyDefinitionSchema');

const _customPropertySchema = Joi.object({
    id: Joi.string().guid().required(),
    createdDate: Joi.date().required(),
    modifiedDate: Joi.date().required(),
    modifiedByUserName: Joi.string().required(),
    value: Joi.string().required().allow(null),
    definition: customPropertyDefinitionSchema,
    schemaPath: Joi.string().required(),
}).label('QsCustomPropertySchema');

const customPropertyRequestSchema = Joi.object({
    key: Joi.string().required(),
    name: Joi.string().required(),
    values: Joi.array().items(Joi.string().required()).optional(),
}).label('QsCustomPropertyRequestSchema');

const customPropertyResponseSchema = Joi.object({
    key: Joi.string().required(),
    name: Joi.string().required(),
    values: Joi.array().items(Joi.string().required()).optional(),
}).label('QsCustomPropertyResponsechema');

const qsUserLicenseDeallocateRequestPayload = Joi.object()
    .keys({
        qsInfo: qsSchema.required(),
        userInfo: userSchema.required(),
        removeUserInfo: userSchema.label('QsUserDeallocateSchema'),
    })
    .label('QsUserLicenseDeallocatePayloadRequest');

const qsUserLicenseDeallocateQuery = Joi.object({
    simulate: Joi.boolean().optional().default(false),
}).label('QsUserLicenseDeallocateQueryRequest');

const qsUserLicenseDeallocateResponseBody = Joi.object({
    message: Joi.string(),
    totalCount: Joi.number(),
    counterAnalyzer: Joi.number(),
    counterProfessional: Joi.number(),
}).label('QsUserLicenseDeallocateResponse');

const qsUserRemovePayload = Joi.object()
    .keys({
        qsInfo: qsSchema.required(),
        userInfo: userSchema.required(),
        removeUserInfo: userSchema.label('QsUserRemoveSchema'),
    })
    .label('QsUserRemovePayloadRequest');

const qsSessionAuthResponse = Joi.object({
    sessionId: Joi.string(),
}).label('QpsSessionAuthPayloadResponse');

const qsSessionAuthRequestPayload = Joi.object()
    .keys({
        qsInfo: qsSchema.required(),
        qrsInfo: qsSchema.optional().allow(null),
        qrsUserInfo: userSchema.optional().allow(null),
        userInfo: userSchema.required(),
    })
    .label('QpsSessionAuthPayloadRequest');

const qsSyncUserPropertiesRequestPayload = Joi.object()
    .keys({
        qsInfo: qsSchema.required(),
        qrsInfo: qsSchema.optional().allow(null),
        qrsUserInfo: userSchema.optional().allow(null),
        userInfo: userSchema.required(),
    })
    .label('QpsSessionAuthPayloadRequest');

const qsSyncUserPropertiesRequestQuery = Joi.object({
    sync: Joi.boolean().optional().default(true),
}).label('QsUserLicenseDeallocateQueryRequest');

const qsUserSessionRequestParams = Joi.object({
    sessionId: Joi.string().required(),
}).label('QsUserSessionParamsRequest');

const qsUserSessionRequestPayload = Joi.object()
    .keys({
        qsInfo: qsSchema.required(),
        roles: Joi.array()
            .items(Joi.string())
            .optional()
            .label('QsUserSessionRolesArraySchema'),
        customProperties: Joi.array()
            .items(customPropertyRequestSchema.optional())
            .label('QsUserSessionCustomPropertyArraySchema'),
    })
    .label('QsSessionAuthPayloadRequest');

const qsUserListRequestParams = Joi.object({
    qsAppGuid: Joi.string().guid().required(),
}).label('QsUserSessionParamsRequest');

const qsUserFullListRequestPayload = Joi.object()
    .keys({
        qsInfo: qsSchema.required(),
        roles: Joi.array()
            .items(Joi.string())
            .optional()
            .label('QsUserListRolesArraySchema'),
        customProperties: Joi.array()
            .items(customPropertyRequestSchema)
            .optional()
            .label('QsUserListCustomPropertiesArraySchema'),
    })
    .label('QsUserListPayloadRequest');

const qsUserListLightRequestPayload = Joi.object()
    .keys({
        qsInfo: qsSchema.required(),
    })
    .label('QsUserListLightPayloadRequest');

const qsUserLightResponsePayload = Joi.object()
    .keys({
        id: Joi.string().guid().required(),
        userId: Joi.string().required(),
        userDirectory: Joi.string().required(),
        name: Joi.string().required(),
    })
    .label('QsUserLightPayloadResponse');

const qsUserResponsePayload = Joi.object()
    .keys({
        id: Joi.string().guid().required(),
        userId: Joi.string().required(),
        userDirectory: Joi.string().required(),
        name: Joi.string().required(),
        customProperties: Joi.array()
            .items(customPropertyResponseSchema)
            .optional()
            .label('QsCustomPropertiesResponseArray'),
    })
    .label('QsUserPayloadResponse');

const qsUserArrayResponsePayload = Joi.array()
    .items(qsUserResponsePayload)
    .label('QsUserListArrayPayloadResponse');

const qsUserLightArrayResponsePayload = Joi.array()
    .items(qsUserLightResponsePayload)
    .label('QsUserLightListArrayPayloadResponse');

export {
    qsUserLicenseDeallocateRequestPayload,
    qsUserLicenseDeallocateQuery,
    qsUserLicenseDeallocateResponseBody,
    qsUserRemovePayload,
    qsSessionAuthResponse,
    qsSessionAuthRequestPayload,
    qsSyncUserPropertiesRequestPayload,
    qsSyncUserPropertiesRequestQuery,
    qsUserSessionRequestParams,
    qsUserSessionRequestPayload,
    qsUserResponsePayload,
    qsUserLightResponsePayload,
    qsUserArrayResponsePayload,
    qsUserFullListRequestPayload,
    qsUserListRequestParams,
    qsUserListLightRequestPayload,
    qsUserLightArrayResponsePayload,
};
