import { QpsCertificate } from './QpsCertificate';

export class QpsTicket {
    private host: string;
    private port: number;
    private path: string;
    private method: string;
    private xrfKey: string;
    private strictSSL: boolean;
    private certificate: QpsCertificate;
    private agent: boolean;

    constructor(
        host: string,
        port: number,
        path: string,
        method: string,
        xrfKey: string,
        strictSSL: boolean,
        certificate: QpsCertificate,
        agent: boolean
    ) {
        this.host = host;
        this.port = port;
        this.path = path;
        this.method = method;
        this.certificate = certificate;
        this.xrfKey = xrfKey;
        this.strictSSL = strictSSL;
        this.agent = agent;
    }
}
