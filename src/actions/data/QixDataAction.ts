import { autoInjectable, injectable } from 'tsyringe';
import { BaseAction } from '../BaseAction';
import {
    QixDataActionRequest,
    QixDataActionResponse,
    QixSessionResponse,
    QixObjectDataResponse,
    QixAppFieldSelectionResponse,
    DataResponse,
    DataTotalResponse,
    DataHeaderResponse,
    DataMetaResponse,
} from '../../entities';
import { QixService, DataService } from '../../services';
import { Boom } from '@hapi/boom';
import { EngineAPI } from 'qix';

@injectable()
@autoInjectable()
export class QixDataAction extends BaseAction<QixDataActionResponse> {
    constructor(
        private qixService?: QixService,
        private dataService?: DataService
    ) {
        super();
    }

    public async run(
        requestParams: any,
        requestData: QixDataActionRequest
    ): Promise<QixDataActionResponse> {
        return await getData(
            requestParams,
            requestData,
            this.qixService,
            this.dataService
        );
    }
}

const getData = async (
    requestParams: any,
    requestData: QixDataActionRequest,
    qixService: QixService,
    dataService: DataService
) => {
    let response = {};
    let selections = null;
    let qix = null;
    let qixGlobal = null;
    let total = null;
    let data = null;
    let rawData = null;
    let header = null;
    let meta = null;

    try {
        //PAM: 1. Create Qlik Sense Session through the engine
        qix = (await qixService.connect(
            {
                host: requestData.qsInfo.host,
                qixPort: requestData.qsInfo.qixPort,
                vp: requestData.qsInfo.vp,
            },
            {
                userDirectory: requestData.userInfo.userDirectory,
                userId: requestData.userInfo.userId,
            }
        )) as QixSessionResponse;

        //PAM: 1. Get the Global Object
        qixGlobal = await qix.open();

        //PAM: 2. Open Qlik Sense App in the background
        const doc = await (qixGlobal as EngineAPI.IGlobal).openDoc(
            requestParams.appId
        );

        //PAM: 3. Clear selections
        await doc.clearAll(true);

        //PAM: 4. Apply optional selections
        if (requestData.qixSelections) {
            selections = (await qixService.selectFieldValues({
                qixDoc: doc,
                qixSelections: requestData.qixSelections,
            })) as QixAppFieldSelectionResponse;
        }

        //PAM: 5. Get the object model
        const model = await doc.getObject(requestParams.objectId);

        //PAM: 6. Get the Object Layout
        const layout = await (model as EngineAPI.IHyperCubeObject).getLayout();

        //PAM: 7. Get Dimension Info
        const dimensionInfo = layout.qHyperCube.qDimensionInfo;

        //PAM: 8. Get Measure Info
        const measureInfo = layout.qHyperCube.qMeasureInfo;

        //PAM: 9. Get Grand Total Row
        const grandTotalRow = layout.qHyperCube.qGrandTotalRow;

        //PAM: 10. Get the raw hypercube data
        if (requestData.includeData) {
            rawData = (await qixService.getHypercubeData(
                model as EngineAPI.IHyperCubeObject,
                layout,
                requestData.fetchLimit
            )) as QixObjectDataResponse;
            if (requestData.raw) response['rawData'] = rawData;
        }

        //PAM: 11. Disconnect engine session
        const disconnect = await qixService.disconnect(qix);

        //PAM: 12. Extract the Header from the hypercube data
        if (requestData.includeHeader) {
            header = dataService.getQsHeaderToArray(
                dimensionInfo,
                measureInfo
            ) as DataHeaderResponse;
            response['header'] = header;
        }

        //PAM: 13. Extract the grand total row
        if (requestData.includeTotal) {
            total = dataService.getQsGrandTotalToArray(
                measureInfo,
                grandTotalRow
            ) as DataTotalResponse;
            response['total'] = total;
        }

        //PAM: 14. Extract the object meta information
        if (requestData.includeMeta) {
            meta = (await dataService.getQsMeta(
                layout,
                requestData.fetchLimit
            )) as DataMetaResponse;
            response['meta'] = meta;
        }

        //PAM: 15. Normalize the hypercube data
        if (!requestData.raw && rawData) {
            data = dataService.getQsDataToArray(
                dimensionInfo,
                measureInfo,
                rawData
            ) as DataResponse;
            response['data'] = data;
        }

        return {
            ...response,
        };
    } catch (error) {
        if (qix) await qix.close();
        throw new Boom(error);
    }
};
