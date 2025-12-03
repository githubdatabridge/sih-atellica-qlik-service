import * as Joi from 'joi';

const appSchema = Joi.string();
const userIdSchema = Joi.string();
const customerIdSchema = Joi.string();
const userDirectorySchema = Joi.string();
const sslSchema = Joi.boolean().default(true);
const hostSchema = Joi.string();
const portSchema = Joi.number().integer();
const vpSchema = Joi.string();
const redirectUrlSchema = Joi.string();
const customPropertySchema = Joi.string();
const attributesSchema = Joi.array()
    .items(
        Joi.object()
            .keys({})
            .unknown(true)
            .options({ stripUnknown: true })
            .label('QsAttributeSchema')
    )
    .options({ stripUnknown: false })
    .label('QsAttributesArrayRequest');

const userDirectoriesSchema = Joi.array()
    .items(Joi.string())
    .min(1)
    .label('QsUserDirectoriesRequest');
const limitSchema = Joi.number().integer();
const commandSchema = Joi.string();
const payloadSchema = Joi.object().label('QsPayloadRequest');

const settingSchema = Joi.object({
    clearInvalid: Joi.boolean().optional(),
    domain: Joi.string().optional(),
    isHttpOnly: Joi.boolean().optional(),
    isSameSite: Joi.string().optional(),
    isSecure: Joi.boolean().optional(),
    path: Joi.string().optional(),
    ttl: Joi.number().required(),
}).label('QsSettingsRequest');

const sessionSchema = Joi.object({
    id: Joi.number().required(),
}).label('QsSessionRequest');

const qsSchema = Joi.object()
    .keys({
        host: hostSchema.required(),
        qrsPort: portSchema.optional().default(4242),
        qixPort: portSchema.optional().default(443),
        qpsPort: portSchema.optional().default(4243),
        ssl: sslSchema.optional(),
        vp: vpSchema.optional(),
    })
    .label('QsInfoRequest');

const userSchema = Joi.object()
    .keys({
        userId: userIdSchema.required(),
        userDirectory: userDirectorySchema.required(),
        attributes: attributesSchema.optional().label('QsAttributesSchema'),
        customProperty: customPropertySchema
            .optional()
            .label('QsCustomPropertySchema'),
    })
    .label('QsUserInfoRequest');

const qpsSessionSchema = Joi.object()
    .keys({
        qsInfo: qsSchema.required(),
        qrsInfo: qsSchema.optional(),
        userInfo: userSchema.required(),
        qrsUserInfo: userSchema.optional(),
    })
    .label('QpsSessionRequest');

const qpsTicketSchema = Joi.object()
    .keys({
        qsInfo: qsSchema.required(),
        userInfo: userSchema.required(),
        redirectUrl: redirectUrlSchema.required(),
    })
    .label('QpsTicketRequest');

const qpsSchema = Joi.object()
    .keys({
        qsInfo: qsSchema.required(),
        userInfo: userSchema.optional(),
    })
    .label('QpsRequest');

const qrsCommandSchema = Joi.object({
    qsInfo: qsSchema.required(),
    userInfo: userSchema.required(),
    command: commandSchema.required(),
}).label('QrsCommandRequest');

const qrsPayloadSchema = Joi.object({
    qsInfo: qsSchema.required(),
    userInfo: userSchema.required(),
    command: commandSchema.required(),
    payload: payloadSchema.optional(),
}).label('QrsPayloadRequest');

const qrsAppRightsSchema = Joi.object({
    qsInfo: qsSchema.required(),
    userInfo: userSchema.required(),
    appId: appSchema.required(),
    userDirectories: userDirectoriesSchema.required(),
    limit: limitSchema.optional().default(1000),
}).label('QrsAppAccessRightsRequest');

const checkSessionResponse = Joi.object({
    qps: Joi.boolean().required(),
}).label('QsCheckSessionResult');

const removeSessionResponse = Joi.object({
    qps: Joi.boolean().required(),
}).label('QsRemoveSessionResult');

export {
    sessionSchema,
    qpsSchema,
    qrsCommandSchema,
    qrsPayloadSchema,
    qrsAppRightsSchema,
    qpsSessionSchema,
    qpsTicketSchema,
    qsSchema,
    checkSessionResponse,
    removeSessionResponse,
    userSchema,
};
