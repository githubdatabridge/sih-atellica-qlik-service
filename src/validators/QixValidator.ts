import * as Joi from 'joi';
import { qsSchema, userSchema } from './QsValidator';

const fieldSchema = Joi.object()
    .keys({
        qixField: Joi.object()
            .keys({
                name: Joi.string().required().description('The app field name'),
                toggleMode: Joi.boolean()
                    .default(false)
                    .optional()
                    .description('If true, toggle selected state'),
                softLock: Joi.boolean()
                    .default(false)
                    .optional()
                    .description(
                        'If true, locked selections can be overridden'
                    ),
                values: Joi.array()
                    .items(
                        Joi.object()
                            .keys({
                                qText: Joi.string()
                                    .optional()
                                    .description(
                                        'Text related to the field value. This parameter is optional'
                                    ),
                                qIsNumeric: Joi.boolean()
                                    .optional()
                                    .description(
                                        'Is set to true if the value is a numeric. This parameter is optional. Default is false'
                                    ),
                                qNumber: Joi.number()
                                    .optional()
                                    .description(
                                        'Numeric value of the field. This parameter is displayed if qIsNumeric is set to true. This parameter is optional'
                                    ),
                            })
                            .label('QixFieldValueSchema')
                    )
                    .label('QixFieldValueArraySchema'),
            })
            .label('QixFieldSchema'),
    })
    .label('QixFieldsSchema');

const qixSelectionSchema = Joi.object()
    .keys({
        qixFields: Joi.array()
            .items(fieldSchema)
            .optional()
            .label('QixFieldSelectionsSchema'),
    })
    .label('QixSelectFieldsRequest');

const qixDataRequestPayload = Joi.object({
    qsInfo: qsSchema.required(),
    userInfo: userSchema.required(),
    qixSelections: qixSelectionSchema.optional(),
    raw: Joi.boolean()
        .default(false)
        .description(
            'If set to true returns the raw hypercube data from the engine'
        ),
    includeHeader: Joi.boolean()
        .default(false)
        .description('If set to true returns the header row'),
    includeTotal: Joi.boolean()
        .default(false)
        .description(
            'If set to true returns the grand total row from the hypercube'
        ),
    includeMeta: Joi.boolean()
        .default(false)
        .description(
            'If set to true returns the meta information of the object'
        ),
    includeData: Joi.boolean()
        .default(true)
        .description('If set to true returns the hypercube data of the object'),
    fetchLimit: Joi.number()
        .optional()
        .default(10000)
        .description('Number of maximum cells to fetch'),
}).label('QixDataRequest');

const qixDataResponse = Joi.object({
    header: Joi.array()
        .items(Joi.string().description('Returns the header row of the object'))
        .optional()
        .label('QixDataHeaderArraySchema'),
    meta: Joi.object()
        .optional()
        .description('Returns the meta information of the object')
        .label('QixDataMetaSchema'),
    total: Joi.array()
        .items(
            Joi.object().description(
                'Returns the grand total row of the object hypercube data'
            )
        )
        .optional()
        .label('QixDataTotalArraySchema'),
    data: Joi.array()
        .items(
            Joi.object().description(
                'Returns the data of the qlik object hypercube data'
            )
        )
        .label('QixDataArraySchema')
        .optional(),
    rawData: Joi.array()
        .items(
            Joi.array()
                .items(
                    Joi.object().description(
                        'Returns the grand total row of the object hypercube data'
                    )
                )
                .label('QixRawDataArrayObjectSchema')
        )
        .label('QixRawDataArraySchema')
        .optional(),
}).label('QixDataResult');

const qixObjectSchema = Joi.object({
    appId: Joi.string().description('The qlik app id to connect'),
    objectId: Joi.string().description(
        'The qlik objectId to connect to retrieve the data'
    ),
});

export { qixDataRequestPayload, qixDataResponse, qixObjectSchema };
