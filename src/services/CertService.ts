import { singleton } from 'tsyringe';
import { ConfigService } from './ConfigService';
import { readFileSync } from 'fs';
import { LogService } from './LogService';
import * as path from 'path';

@singleton()
export class CertService {
    private cert: Cert;
    private certPath: CertPath;
    constructor(
        private configService: ConfigService,
        private logService: LogService
    ) {}

    public init() {
        var certType = this.configService.get('QS_CERT_TYPE');

        if (certType === 'pfx') {
            var pfxPath = this.configService.get('QS_PFX_PATH');
            var pfxPassphrase = this.configService.get('QS_PFX_PASS');

            if (!pfxPath) {
                this.logService.get().error(`pfxPath [${pfxPath}] invalid.`);
            }

            this.cert = {
                type: 'pfx',
                pfx: readFileSync(path.resolve(__dirname, pfxPath)),
                passphrase: pfxPassphrase,
            };

            this.certPath = {
                type: 'pfx',
                pfxPath: path.resolve(__dirname, pfxPath),
                passphrase: pfxPassphrase,
            };
        } else if (certType === 'ca') {
            var caPath = this.configService.get('QS_CA_PATH');
            var keyPath = this.configService.get('QS_KEY_PATH');
            var certPath = this.configService.get('QS_CERT_PATH');

            let ca: Buffer;
            try {
                ca = readFileSync(path.resolve(__dirname, caPath));
            } catch (error) {
                this.logService
                    .get()
                    .warn(`ca:[${caPath}] invalid.`, error.stack);
            }

            this.cert = {
                type: 'ca',
                ca,
                key: readFileSync(path.resolve(__dirname, keyPath)),
                cert: readFileSync(path.resolve(__dirname, certPath)),
            };

            this.certPath = {
                type: 'ca',
                caPath: path.resolve(__dirname, caPath),
                keyPath: path.resolve(__dirname, keyPath),
                certPath: path.resolve(__dirname, certPath),
            };
        } else {
            this.logService
                .get()
                .error(`certType [${certType}] not implemented.`);
        }

        this.logService
            .get()
            .debug(`Qlik certs: \n ${JSON.stringify(this.certPath)}`);
    }

    get getCert() {
        return this.cert;
    }

    get getCertPath() {
        return this.certPath;
    }
}

type Cert = CertPfx | CertCa;

type CertPfx = {
    type: 'pfx';
    pfx: Buffer;
    passphrase: string;
};

type CertCa = {
    type: 'ca';
    ca: Buffer;
    key: Buffer;
    cert: Buffer;
};

type CertPath = CertPathPfx | CertPathCa;

type CertPathPfx = {
    type: 'pfx';
    pfxPath: string;
    passphrase: string;
};

type CertPathCa = {
    type: 'ca';
    caPath: string;
    keyPath: string;
    certPath: string;
};
