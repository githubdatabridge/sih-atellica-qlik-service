import { injectable } from 'tsyringe';

import * as dotenv from 'dotenv';

@injectable()
export class ConfigService {
    config: dotenv.DotenvConfigOutput;

    private static DEFAULTS = {
        // Server
        HOST: 'local.databridge.ch',
        PORT: 3001,
        TITLE: 'SIH Qlik Service',
        SSL: true,
        VERSION: 'v1',
        TZ: 'Etc/Universal',

        APP_NAME: 'SihQlikService',

        // Qlik certificates (paths relative to project root)
        QS_CERT_TYPE: 'pfx',  // ca | pfx
        QS_CA_PATH: '../certificates/qlik/root.pem',
        QS_KEY_PATH: '../certificates/qlik/client_key.pem',
        QS_CERT_PATH: '../certificates/qlik/client.pem',
        QS_PFX_PATH: '../certificates/qlik/client.pfx',
        QS_PFX_PASS: '',

        // Qlik users
        QS_REPOSITORY_USER_ID: 'sa_repository',
        QS_REPOSITORY_USER_DIRECTORY: 'INTERNAL',
        QS_ENGINE_USER_ID: 'sa_api',
        QS_ENGINE_USER_DIRECTORY: 'INTERNAL',
        API_KEY: 'f919861d-dda2-442e-b238-fee4f417445ba f919861d-dda2-442e-b238-fee4f417445bc',
        QLIK_CERT_PASSPHRASE: null,

        // Logging
        LOG_TYPE: 'file', // file | database | null => null == both
        LOG_DIR: 'logs',
        LOG_LEVEL: 'info',
        LOG_CORE_FILE: 'core.log',
        LOG_DATE_PATTERN: 'YYYY-MM-DD',
        LOG_MAX_SIZE: '20m',
        LOG_MAX_FILES: '14d',
        LOG_DB_LEVEL: 'debug',
        LOG_DB_TABLE_NAME: 'logs',

        // Gateway
        GATEWAY_HOST: null,
        GATEWAY_PATH: '',

        // Database
        DB_HOST: 'localhost',
        DB_PORT: '5432',
        DB_USER: 'root',
        DB_PASS: 'root',
        DB_DATABASE: 'sih_qplus',
        DB_SSL: false,

        // SSL certificates (paths relative to project root)
        SERVER_CERT_PATH: '../certificates/server/',
        SERVER_CERT_FILE_NAME: 'server.crt',
        SERVER_KEY_FILE_NAME: 'server.key'
    };

    constructor() {
        this.init();
    }

    private init() {
        this.config = dotenv.config();
    }

    get(value: string, isBool = false): any {
        if (!process.env || !process.env[value]) {
            return ConfigService.DEFAULTS[value];
        }

        return !isBool
            ? process.env[value]
            : process.env[value] === 'false'
            ? false
            : true;
    }
}
