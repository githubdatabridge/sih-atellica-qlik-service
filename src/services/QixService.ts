import { inject, injectable, delay } from 'tsyringe';
//import * as settings from '../settings';
import enigma from 'enigma.js';
import schema from 'enigma.js/schemas/12.20.0.json';
import WebSocket from 'ws';
import { QixField } from '../entities/QixEntities';
import * as Entities from '../entities';
import * as Lib from '../lib';
import { EngineAPI } from 'qix';
import { CertService } from './CertService';

@injectable()
export class QixService {
    constructor(
        @inject(delay(() => CertService))
        private certService: CertService
    ) {}

    async connect(
        qsInfo: Entities.QlikInfo,
        qsUserInfo: Entities.QlikUserInfo
    ): Promise<EngineAPI.IGlobal> {
        let config = null;
        try {
            const vp = qsInfo.vp ? `${qsInfo.vp}/` : '';
            const app = qsInfo.app ? qsInfo.app : 'engineData';

            const certs = this.certService.getCert;
            config = {
                schema,
                url: `wss://${qsInfo.host}:${qsInfo.qixPort}/${vp}app/${app}`,
                createSocket: (url) =>
                    new WebSocket(url, {
                        rejectUnauthorized: false,
                        ...certs,
                        headers: {
                            'X-Qlik-User': `UserDirectory=${encodeURIComponent(
                                qsUserInfo.userDirectory
                            )}; UserId=${encodeURIComponent(
                                qsUserInfo.userId
                            )}`,
                        },
                    }),
            };

            return (await enigma.create(
                config
            )) as unknown as EngineAPI.IGlobal;
        } catch (error) {
            throw new Lib.Errors.InternalError('Internal Error', error);
        }
    }

    async disconnect(qix: any) {
        try {
            if (qix) {
                await qix.close();
                return true;
            } else {
                return false;
            }
        } catch (error) {
            throw new Lib.Errors.InternalError('Internal Error', error);
        }
    }

    async createList(qixDoc: any, fieldName: string) {
        try {
            const qList = await qixDoc.createSessionObject({
                qInfo: {
                    qType: 'qList',
                },
                qListObjectDef: {
                    qDef: {
                        qFieldDefs: [fieldName],
                    },

                    qInitialDataFetch: [
                        { qTop: 0, qLeft: 0, qWidth: 1, qHeight: 10000 },
                    ],
                },
            });

            return qList;
        } catch (error) {
            throw new Lib.Errors.InternalError('Internal Error', error);
        }
    }

    async getHypercubeData(
        qixModel: EngineAPI.IHyperCubeObject,
        qixLayout: EngineAPI.IGenericHyperCubeLayout,
        fetchLimit: number
    ) {
        const qData = [];
        try {
            const totalWidth: number = qixLayout.qHyperCube.qSize.qcx;
            const totalHeight: number = qixLayout.qHyperCube.qSize.qcy;
            const pageHeight: number = Math.floor(fetchLimit / totalWidth);
            const numberOfPages: number = Math.ceil(totalHeight / pageHeight);

            const promises = [];

            for (let i = 0; i < numberOfPages; i++) {
                promises.push(
                    qixModel.getHyperCubeData('/qHyperCubeDef', [
                        {
                            qTop: pageHeight * i,
                            qLeft: 0,
                            qWidth: totalWidth,
                            qHeight: pageHeight,
                        },
                    ])
                );
            }

            const data = await Promise.all(promises);
            for (const currentData of data) {
                for (const qMatrix of currentData[0].qMatrix) {
                    qData.push(qMatrix);
                }
            }
            return qData;
        } catch (error) {
            throw new Lib.Errors.InternalError('Internal Error', error);
        }
    }

    async getListObjectData(
        qixModel: EngineAPI.IGenericList,
        qixLayout: EngineAPI.IGenericListLayout,
        fetchLimit: number = 10000
    ) {
        const qData = [];
        try {
            const totalWidth: number = qixLayout.qListObject.qSize.qcx;
            const totalHeight: number = qixLayout.qListObject.qSize.qcy;
            const pageHeight: number = Math.floor(fetchLimit / totalWidth);
            const numberOfPages: number = Math.ceil(totalHeight / pageHeight);

            const promises = [];

            for (let i = 0; i < numberOfPages; i++) {
                promises.push(
                    qixModel.getListObjectData('/qListObjectDef', [
                        {
                            qTop: pageHeight * i,
                            qLeft: 0,
                            qWidth: totalWidth,
                            qHeight: pageHeight,
                        },
                    ])
                );
            }

            const data = await Promise.all(promises);
            for (const currentData of data) {
                for (const qMatrix of currentData[0].qMatrix) {
                    qData.push(qMatrix);
                }
            }
            return qData;
        } catch (error) {
            throw new Lib.Errors.InternalError('Internal Error', error);
        }
    }

    async selectFieldValues({
        qixDoc,
        qixSelections,
    }: {
        qixDoc: EngineAPI.IApp;
        qixSelections: any;
    }) {
        const qSelectResult = [];
        let qField = null;
        try {
            await Promise.all(
                qixSelections.qixFields.map(async (selection) => {
                    qField = await qixDoc.getField(
                        selection.qixField.name,
                        selection.qixField.state
                            ? selection.qixField.state
                            : '$'
                    );
                    const qResult = await qField.selectValues(
                        selection.qixField.values,
                        selection.qixField.toggleMode,
                        selection.qixField.softLock
                    );
                    qSelectResult.push({
                        field: selection.qixField.name,
                        values: selection.qixField.fieldValue,
                        result: qResult,
                    });
                })
            );
            return qSelectResult;
        } catch (error) {
            throw new Lib.Errors.InternalError('Internal Error', error);
        }
    }

    async selectFieldValue(
        qixDoc: EngineAPI.IApp,
        qixField: QixField
    ): Promise<boolean> {
        let qResult = false;
        let qField = null;
        try {
            qField = await qixDoc.getField(
                qixField.name,
                qixField.state ? qixField.state : '$'
            );

            qResult = await (qField as EngineAPI.IField).selectValues(
                qixField.values,
                qixField.toggleMode ? qixField.toggleMode : false,
                qixField.softLock ? qixField.softLock : false
            );

            return qResult;
        } catch (error) {
            throw new Lib.Errors.InternalError('Internal Error', error);
        }
    }
}
