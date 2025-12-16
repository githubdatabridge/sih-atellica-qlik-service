import { QlikUserInfo } from '.';

export interface QsAppCopyDesignActionRequest {
    qsHost: string;
    qrsPort: number;
    qixPort: number;
    qrsUserInfo: QlikUserInfo;
    qixUserInfo: QlikUserInfo;
    fromApp: string;
    toApps: string;
    copyScript: boolean;
    connection: string;
}

export interface QsAppCopyDesignRefreshedApp {
    id: string;
    name: string;
    published: boolean;
    stream: string;
    owner: string;
}

export interface QsAppCopyDesignActionResponse {
    fromApp: string;
    toApps: string;
    connection: string;
    copyScript: boolean;
    refreshedApps: QsAppCopyDesignRefreshedApp[];
}
