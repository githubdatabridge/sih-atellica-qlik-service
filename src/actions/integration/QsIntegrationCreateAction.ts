import { autoInjectable, injectable } from 'tsyringe';
import { BaseAction } from '../BaseAction';
import { QrsService } from '../../services';
import * as Entities from '../../entities';
import {
    QsAppQrsResponse,
    QsCompositeEventQrsResponse,
    QsTaskQrsResponse,
    QsSchemaEventQrsResponse,
    QsTagQrsResponse,
} from '../../entities/QsBaseEntities';
import { QsCustomPropertyUpdateAction } from '../customproperty/QsCustomPropertyUpdateAction';
import { QsTagCreateAction } from '../tags/QsTagCreateAction';

@injectable()
@autoInjectable()
export class QsIntegrationCreateAction extends BaseAction<Entities.QlikIntegrationCreateResponse> {
    constructor(
        private qrsService?: QrsService,
        private qsCustomPropertyUpdateAction?: QsCustomPropertyUpdateAction,
        private qsTagCreateAction?: QsTagCreateAction
    ) {
        super();
    }

    public async run(
        requestData: Entities.QlikIntegrationCreateRequest
    ): Promise<Entities.QlikIntegrationCreateResponse> {
        try {
            // 1. Create Qlik Customer Environment
            const customEnvironment = await createCustomerEnvironment(
                requestData,
                this.qrsService,
                this.qsCustomPropertyUpdateAction,
                this.qsTagCreateAction
            );

            // 2. Create Qlik ETL App Resources
            const etlQlikApp = await createEtlQlikApp(
                requestData,
                this.qrsService
            );

            // 3. Create Qlik ETL App Resources
            const frontendQlikApp = await createFrontendQlikApp(
                requestData,
                this.qrsService,
                etlQlikApp.reloadTask
            );

            return {
                extId: requestData.extId,
                qsAppGuid: frontendQlikApp.publishedApp.id,
                qsEtlAppGuid: etlQlikApp.publishedApp.id,
                qsEtlTaskGuid: etlQlikApp.reloadTask.id,
                qsTaskGuid: frontendQlikApp.reloadTask.id,
                status: Entities.QlikAppStatus.CREATED,
            };
        } catch (error) {
            throw error;
        }
    }
}

const createFrontendQlikApp = async (
    requestData: Entities.QlikIntegrationCreateRequest,
    qrsService: QrsService,
    reloadTaskEtl: QsTaskQrsResponse
) => {
    const duplicatedApp = (
        await qrsService.postResource(
            requestData.userInfo,
            requestData.qsInfo,
            `app/${requestData.qsSourceAppGuid}/copy?name=${requestData.qsProjectName}__${requestData.extId}__Sales`,
            null
        )
    ).body as QsAppQrsResponse;

    // get full info about source app, we are interested later in the "tags" array
    const infoSourceApp = await qrsService.getResource(
        requestData.userInfo,
        requestData.qsInfo,
        `app/${requestData.qsSourceAppGuid}`
    );

    // set the customProperty value, that matches the customer ID, and the same
    // tags, that the source app had, on the target app
    await qrsService.putResource(
        requestData.userInfo,
        requestData.qsInfo,
        `app/${duplicatedApp.id}`,
        {
            customProperties: [
                {
                    value: requestData.extId,
                    definition: { id: requestData.qsCustomPropGuid },
                },
            ],
            tags: infoSourceApp.body.tags,
            modifiedDate: '2999-12-31T12:59:59.999Z',
        }
    );

    const publishedApp = (
        await qrsService.putResource(
            requestData.userInfo,
            requestData.qsInfo,
            `app/${duplicatedApp.id}/publish?stream=${requestData.qsStreamGuid}`,
            null
        )
    ).body as QsAppQrsResponse;

    const reloadTask = (
        await qrsService.postResource(
            requestData.userInfo,
            requestData.qsInfo,
            'reloadtask',
            {
                name: `${duplicatedApp.name}__R`,
                app: duplicatedApp,
                customProperties: [
                    {
                        value: requestData.extId,
                        definition: { id: requestData.qsCustomPropGuid },
                    },
                ],
                tags: infoSourceApp.body.tags,
            }
        )
    ).body as QsTaskQrsResponse;

    const compositeEventparams = {
        name: `${reloadTaskEtl.name}__Finished`,
        enabled: true,
        reloadTask: reloadTask,
        userSyncTask: null,
        externalProgramTask: null,
        timeConstraint: {
            days: 0,
            hours: 0,
            minutes: 360,
            seconds: 0,
        },
        compositeRules: [
            {
                ruleState: 1,
                reloadTask: reloadTaskEtl,
                userSyncTask: null,
                externalProgramTask: null,
            },
        ],
        eventType: 1,
    };

    const compositeEvent = (
        await qrsService.postResource(
            requestData.userInfo,
            requestData.qsInfo,
            'compositeevent',
            compositeEventparams
        )
    ).body as QsCompositeEventQrsResponse;

    return {
        duplicatedApp,
        publishedApp,
        reloadTask,
        compositeEvent,
    };
};

const createEtlQlikApp = async (
    requestData: Entities.QlikIntegrationCreateRequest,
    qrsService: QrsService
) => {
    const duplicatedApp = (
        await qrsService.postResource(
            requestData.userInfo,
            requestData.qsInfo,
            `app/${requestData.qsSourceEtlAppGuid}/copy?name=${requestData.qsProjectName}__${requestData.extId}__Sales_ETL`,
            null
        )
    ).body as QsAppQrsResponse;

    // get full info about source app, we are interested later in the "tags" array
    const infoSourceApp = await qrsService.getResource(
        requestData.userInfo,
        requestData.qsInfo,
        `app/${requestData.qsSourceEtlAppGuid}`
    );

    // set the customProperty value, that matches the customer ID, and the same
    // tags, that the source app had, on the target app
    await qrsService.putResource(
        requestData.userInfo,
        requestData.qsInfo,
        `app/${duplicatedApp.id}`,
        {
            tags: infoSourceApp.body.tags,
            modifiedDate: '2999-12-31T12:59:59.999Z',
        }
    );

    const publishedApp = (
        await qrsService.putResource(
            requestData.userInfo,
            requestData.qsInfo,
            `app/${duplicatedApp.id}/publish?stream=${requestData.qsStreamEtlGuid}`,
            null
        )
    ).body as QsAppQrsResponse;

    const reloadTask = (
        await qrsService.postResource(
            requestData.userInfo,
            requestData.qsInfo,
            'reloadtask',
            {
                name: `${duplicatedApp.name}__R`,
                app: duplicatedApp,
                customProperties: [
                    {
                        value: requestData.extId,
                        definition: { id: requestData.qsCustomPropGuid },
                    },
                ],
                tags: infoSourceApp.body.tags,
            }
        )
    ).body as QsTaskQrsResponse;

    const schemaEventParams = {
        timeZone: 'UTC',
        enabled: true,
        eventType: 0,
        startDate: new Date(
            new Date().setHours(23, 59, 59, 999) +
                Math.floor(Math.random() * 360) * 60000
        )
            .toISOString()
            .replace('Z', ''),
        expirationDate: '9999-01-01T00:00:00.000',
        schemaFilterDescription: ['* * - * * * * *'],
        incrementDescription: '0 0 1 0',
        incrementOption: 0,
        reloadTask: reloadTask,
        name: `${reloadTask.name}_Trigger`,
    };

    const schemaEvent = (
        await qrsService.postResource(
            requestData.userInfo,
            requestData.qsInfo,
            'schemaevent',
            schemaEventParams
        )
    ).body as QsSchemaEventQrsResponse;

    return {
        duplicatedApp,
        publishedApp,
        reloadTask,
        schemaEvent,
    };
};

const createCustomerEnvironment = async (
    requestData: Entities.QlikIntegrationCreateRequest,
    qrsService: QrsService,
    qsCustomPropertyUpdateAction: QsCustomPropertyUpdateAction,
    qsTagsCreateAction: QsTagCreateAction
) => {
    const customProperty = await qsCustomPropertyUpdateAction.run({
        extId: requestData.extId,
        qsInfo: requestData.qsInfo,
        userInfo: requestData.userInfo,
        qsCustomPropGuid: requestData.qsCustomPropGuid,
    });

    const tag = await qsTagsCreateAction.run({
        userInfo: requestData.userInfo,
        qsInfo: requestData.qsInfo,
        name: requestData.extId,
    });

    return {
        customProperty,
        tag,
    };
};
