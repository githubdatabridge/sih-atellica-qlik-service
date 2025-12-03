import { injectable } from 'tsyringe';
import {Boom} from '@hapi/boom';
import * as utils from '../utils/common';
import { QixObjectMetaInfo } from '../entities/QixEntities';

const FIELD_TYPES = {
    discrete: 'D',
    numeric: 'N',
    timestamp: 'T',
};

const MEASURE_TYPES = {
    U: FIELD_TYPES.discrete,
    A: FIELD_TYPES.discrete,
    I: FIELD_TYPES.numeric,
    R: FIELD_TYPES.numeric,
    F: FIELD_TYPES.numeric,
    M: FIELD_TYPES.numeric,
    D: FIELD_TYPES.timestamp,
    T: FIELD_TYPES.timestamp,
    TS: FIELD_TYPES.timestamp,
    IV: FIELD_TYPES.discrete,
};

const FIELD_TAGS = {
    date: '$date',
    timestamp: '$timestamp',
    ascii: '$ascii',
    text: '$text',
    numeric: '$numeric',
    integer: '$integer',
};

@injectable()
export class DataService {
    constructor() {}

    getQsGrandTotalToArray(qMeasureInfo, qGrandTotalRow) {
        const names = [],
            types = [],
            res = [];
        try {
            qMeasureInfo.forEach((measure) => {
                names.push(measure.qFallbackTitle);
                types.push(MEASURE_TYPES[measure.qNumFormat.qType]);
            });
            qGrandTotalRow.forEach((value, i) => {
                let resVal = {};

                if (value.hasOwnProperty('qIsNull') && value.qIsNull) {
                    resVal[names[i]] = null;
                } else {
                    resVal[names[i]] = value.qNum;
                }

                res.push(resVal);
            });
            return res;
        } catch (error) {
            return new Boom(error);
        }
    }

    getQsDataToArray(qDimensionInfo, qMeasureInfo, qData) {
        const names = [],
            types = [],
            res = [];
        try {
            qDimensionInfo.forEach((dim) => {
                names.push(dim.qFallbackTitle);
                if (
                    dim.qTags.indexOf(FIELD_TAGS.date) > -1 ||
                    dim.qTags.indexOf(FIELD_TAGS.timestamp) > -1
                ) {
                    types.push(FIELD_TYPES.timestamp);
                } else {
                    types.push(dim.qDimensionType);
                }
            });

            qMeasureInfo.forEach((measure) => {
                names.push(measure.qFallbackTitle);
                types.push(MEASURE_TYPES[measure.qNumFormat.qType]);
            });

            qData.forEach((row) => {
                let resVal = {};
                row.forEach((value, i) => {
                    if (value.hasOwnProperty('qIsNull') && value.qIsNull) {
                        resVal[names[i]] = null;
                    } else {
                        if (types[i] == FIELD_TYPES.discrete) {
                            if (
                                value.hasOwnProperty('qNum') &&
                                !isNaN(value.qNum)
                            ) {
                                resVal[names[i]] = value.qNum;
                            } else if (value.hasOwnProperty('qText')) {
                                resVal[names[i]] = value.qText;
                            } else {
                                resVal[names[i]] = 'null';
                            }
                        } else if (types[i] == FIELD_TYPES.numeric) {
                            resVal[names[i]] = value.qNum;
                        } else if (types[i] == FIELD_TYPES.timestamp) {
                            resVal[names[i]] = value.qNum;
                        }
                    }
                });
                res.push(resVal);
            });
            return res;
        } catch (error) {
            return new Boom(error);
        }
    }

    getQsHeaderToArray(qDimensionInfo, qMeasureInfo) {
        const header: string[] = [];
        try {
            qDimensionInfo.forEach((dim) => {
                header.push(dim.qFallbackTitle);
            });

            qMeasureInfo.forEach((measure) => {
                header.push(measure.qFallbackTitle);
            });
            return header;
        } catch (error) {
            return new Boom(error);
        }
    }

    flatten(arr) {
        return [].concat(...arr);
    }

    filterArray(arr: any[]) {
        return arr.filter((el) => {
            return (el.qState === 'S');
        });
    }

    getQsMeta(qLayout, fetchLimit) {
        try {
            const totalWidth: number = qLayout.qHyperCube.qSize.qcx;
            const totalHeight: number = qLayout.qHyperCube.qSize.qcy;
            const pageHeight: number = Math.floor(fetchLimit / totalWidth);
            const numberOfPages: number = Math.ceil(totalHeight / pageHeight);
            const title: string = qLayout.title;
            const subtitle: string = qLayout.subtitle;
            const footnote: string = qLayout.footnote;
            const visualization: string = qLayout.visualization;

            const qObjectMetaInfo: QixObjectMetaInfo = {
                width: totalWidth,
                height: totalHeight,
                pageHeight: pageHeight,
                pages: numberOfPages,
                title,
                subtitle,
                visualization,
                footnote,
                fetchLimit,
            };

            return qObjectMetaInfo;
        } catch (error) {
            return new Boom(error);
        }
    }
}
