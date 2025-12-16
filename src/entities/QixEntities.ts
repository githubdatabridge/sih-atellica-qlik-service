import { QlikBaseRequest } from '.';

export interface QixDataActionRequest extends QixDataRequest {
    raw?: boolean;
    includeTotal?: boolean;
    includeHeader?: boolean;
    includeMeta?: boolean;
    includeData?: boolean;
    fetchLimit?: number;
}

export interface QixDataActionResponse {
    header?: string[];
    meta?: any;
    total?: any;
    data?: any[];
    rawData?: any[][];
}

export interface QixDataRequest extends QlikBaseRequest {
    qixSelections?: QixSelection;
}

export interface QixSelection {
    fields: QixFields;
}

export interface QixFields {
    field: QixField[];
}

export interface QixField {
    name: string;
    toggleMode?: boolean;
    softLock?: boolean;
    state?: string;
    values?: QixFieldValue[];
}

export interface QixFieldValue {
    qText?: string;
    qIsNumeric?: boolean;
    qNumber?: number;
}

export interface QixObject {
    id: string;
    model?: any;
    layout?: any;
    data?: any;
}

export interface QixObjectMetaInfo {
    title?: string;
    subtitle?: string;
    footnote?: string;
    width: number;
    height: number;
    pages: number;
    fetchLimit: number;
    pageHeight: number;
    visualization: string;
}

export interface QixSessionResponse {}

export interface QixAppFieldSelectionResponse {}

export interface QixObjectDataResponse {}
