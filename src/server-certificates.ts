import * as fs from 'fs';
import * as path from 'path';

interface ServerCertificates {
    pfx: Buffer;
    key: Buffer;
    cert: Buffer;
}

let certs: ServerCertificates = null;

const getServerCertificatePath = (certFileName: string): string => {
    const settings = {
        SERVER_CERT_PATH: path.resolve(`./certificates/server`),
    };

    return `${settings.SERVER_CERT_PATH}/${certFileName}`;
};

const getServerCertificates = (): ServerCertificates => {
    if (certs) {
        return certs;
    }

    var serverCertPath = path.resolve(`${__dirname}/certificates/server`);

    const readServerCert = (certFilename) => {
        return fs.readFileSync(`${serverCertPath}/${certFilename}`);
    };

    certs = {
        pfx: undefined, //readServerCert('server.pfx'),
        key: readServerCert('server.key'),
        cert: readServerCert('server.crt'),
    };

    return certs;
};

export { getServerCertificates, getServerCertificatePath };
