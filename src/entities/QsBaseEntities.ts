import { QlikUserInfo } from '.';

export interface QsCustomPropertyQrsResponse {
    id: string;
    createdDate: string;
    modifiedDate: string;
    modifiedByUserName: string;
    name: string;
    valueType: string;
    choiceValues: any[];
    objectTypes: string[];
    description: string;
    privileges: any;
    schemaPath: string;
}

export interface QsTagQrsResponse {
    id: string;
    createdDate: string;
    modifiedDate: string;
    modifiedByUserName: string;
    name: string;
    privileges: any;
    schemaPath: string;
}

export interface QsStreamQrsResponse {
    id: string;
    createdDate: string;
    modifiedDate: string;
    modifiedByUserName: string;
    customProperties: QsCustomPropertyQrsResponse[];
    owner: QlikUserInfo;
    name: string;
    tags: QsTagQrsResponse[];
    privileges: any;
    schemaPath: string;
}

export interface QsAppQrsResponse {
    id: string;
    createdDate: string;
    modifiedDate: string;
    modifiedByUserName: string;
    customProperties: any[];
    owner: QlikUserInfo;
    name: string;
    appId: string;
    sourceAppId: string;
    targetAppId: string;
    publishTime: string;
    published: string;
    tags: QsTagQrsResponse[];
    description: string;
    stream: QsStreamQrsResponse;
    fileSize: number;
    lastReloadTime: string;
    thumbnail: string;
    savedInProductVersion: string;
    migrationHash: string;
    dynamicColor: string;
    availabilityStatus: number;
    privileges: any;
    schemaPath: string;
}

export interface QsTaskQrsResponse {
    id: string;
    createdDate: string;
    modifiedDate: string;
    modifiedByUserName: string;
    customProperties: QsCustomPropertyQrsResponse[];
    app: QsAppQrsResponse;
    isManuallyTriggered: boolean;
    operational: any;
    name: string;
    taskType: number;
    enabled: boolean;
    taskSessionTimeout: number;
    maxRetries: number;
    tags: QsTagQrsResponse[];
    privileges: any;
    schemaPath: string;
}

export interface QsSchemaEventQrsResponse {
    id: string;
    createdDate: string;
    modifiedDate: string;
    modifiedByUserName: string;
    timeZone: string;
    daylightSavingTime: number;
    startDate: string;
    expirationDate: string;
    schemaFilterDescription: string[];
    incrementDescription: string;
    incrementOption: number;
    operational: any;
    name: string;
    enabled: boolean;
    eventType: number;
    reloadTask: QsTaskQrsResponse;
    userSyncTask: any;
    externalProgramTask: any;
    privileges: any;
    schemaPath: string;
}

export interface QsCompositeEventQrsResponse {
    id: string;
    createdDate: string;
    modifiedDate: string;
    modifiedByUserName: string;
    timeConstraint: any;
    compositeRules: any;
    operational: any;
    name: string;
    enabled: boolean;
    eventType: number;
    reloadTask: QsTaskQrsResponse;
    userSyncTask: any;
    externalProgramTask: any;
    privileges: any;
    schemaPath: string;
}
