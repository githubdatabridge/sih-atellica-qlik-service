import { QlikUserInfo, QlikInfo } from './QlikBaseEntities';

type CustomPropertyDefinition = {
    id: string;
    name: string;
    valueType: string;
    choiceValues: string[];
    privileges: any;
};

type CustomProperty = {
    id: string;
    createdDate: Date;
    modifiedDate: Date;
    modifiedByUserName: string;
    value: string;
    definition: CustomPropertyDefinition;
    schemaPath: string;
};

type CustomPropertyRequest = {
    key: string;
    name: string;
    values?: string[];
};

export type CustomPropertyResponse = {
    key: string;
    name: string;
    values: string[];
};

export interface QlikUserActionRequest {
    qsInfo: QlikInfo;
    userInfo: QlikUserInfo;
    removeUserInfo: QlikUserInfo;
    simulate?: boolean;
}
export interface QlikUserActionResponse {
    message: string;
    totalCount: number;
    counterAnalyzer: number;
    counterProfessional: number;
}

export interface QlikUserAuthRequest {
    qsInfo: QlikInfo;
    userInfo: QlikUserInfo;
    qrsInfo?: QlikInfo;
    qrsUserInfo?: QlikUserInfo;
}

export interface QlikUserAuthResponse {
    sessionId: string;
}

export interface QlikUserSyncRequest {
    qsInfo: QlikInfo;
    qrsInfo?: QlikInfo;
    qrsUserInfo?: QlikUserInfo;
    userInfo: QlikUserInfo;
}

export interface QlikUserSessionRequest {
    qsInfo: QlikInfo;
    sessionId: string;
    customProperties?: CustomPropertyRequest[];
}

export interface QlikUserListRequest {
    qsInfo: QlikInfo;
    qsAppGuid: string;
    roles?: string[];
    customProperties?: CustomPropertyRequest[];
}

export interface QlikUserSessionResponse {
    UserDirectory: string;
    UserId: string;
    Attributes: any[];
    SessionId: string;
}

export interface QlikUser {
    id: string;
    createdDate: Date;
    modifiedDate: Date;
    modifiedByUserName: string;
    customProperties?: CustomProperty[];
    userId: string;
    userDirectory: string;
    userDirectoryConnectorName?: string;
    name: string;
    roles?: string[];
    attributes: any[];
    inactive: boolean;
    removedExternally: boolean;
    blacklisted: boolean;
    deleteProhibited: boolean;
    tags: string[];
    privileges?: any;
    schemaPath?: string;
}
export interface QlikUserLight {
    id: string;
    name: string;
    userId: string;
    userDirectory: string;
    customProperties?: CustomPropertyResponse[];
}
