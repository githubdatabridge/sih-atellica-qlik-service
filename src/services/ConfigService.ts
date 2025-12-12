import { injectable } from 'tsyringe';

import * as dotenv from 'dotenv';

@injectable()
export class ConfigService {
    config: dotenv.DotenvConfigOutput;

    private static DEFAULTS = {
        HOST: '0.0.0.0',
        PORT: 8080,
        TITLE: 'SIH Qlik Service',
        SSL: false,
        VERSION: 'v1',

        APP_NAME: 'SIH-QLIK-SERVICE',

        QS_CERT_TYPE: 'ca',  // ca | pfx
        QS_CA_PATH:'../../certificates/qlik/root.pem',
        QS_KEY_PATH: '../../certificates/qlik/client_key.pem',
        QS_CERT_PATH: '../../certificates/qlik/client.pem',

        QS_PFX_PATH:'',
        QS_PFX_PASS: '',

        QS_REPOSITORY_USER_ID: 'sa_repository',
        QS_REPOSITORY_USER_DIRECTORY: 'INTERNAL',
        QS_ENGINE_USER_ID: 'sa_api',
        QS_ENGINE_USER_DIRECTORY: 'INTERNAL',
        API_KEY:
        'f919861d-dda2-442e-b238-fee4f417445ba f919861d-dda2-442e-b238-fee4f417445bc',

        LOG_TYPE: 'file', // file | database | null => null == both
        LOG_DIR: 'logs',
        LOG_LEVEL: 'info',
        LOG_CORE_FILE: 'core.log',
        LOG_DATE_PATTERN: 'YYYY-MM-DD',
        LOG_MAX_SIZE: '20m',
        LOG_MAX_FILES: '14d',

        LOG_DB_LEVEL: 'debug',
        LOG_DB_TABLE_NAME: 'logs',

        GATEWAY_HOST: null,
        GATEWAY_PATH: '',

        DB_HOST: 'localhost',
        DB_PORT: '5432',
        DB_USER: 'root',
        DB_PASS: 'root',
        DB_DATABASE: 'sih_qplus',
        DB_SSL: false,

        QLIK_CERT_PASSPHRASE: null,

        SERVER_CERT_PATH: '..\\certificates\\server\\',
        SERVER_CERT_FILE_NAME:'server.crt',
        SERVER_KEY_FILE_NAME:'server.key'
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
