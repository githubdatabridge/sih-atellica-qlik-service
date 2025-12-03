import { QrsCertificate } from './QrsCertificate';

export class QrsConfig {
    private hostname: string;
    private portNumber: number;
    private virtualProxyPrefix: string;
    private certificates: QrsCertificate = null;
    private repoAccount: string;
    private repoAccountUserDirectory: string;
    private repoAccountUserId: string;

    constructor(
        hostname: string,
        portNumber: number,
        virtualProxyPrefix: string,
        certificates: QrsCertificate,
        repoAccount: string,
        repoAccountUserDirectory: string,
        repoAccountUserId: string
    ) {
        this.hostname = hostname;
        this.portNumber = portNumber;
        this.virtualProxyPrefix = virtualProxyPrefix;
        this.certificates = certificates;
        this.repoAccount = repoAccount;
        this.repoAccountUserDirectory = repoAccountUserDirectory;
        this.repoAccountUserId = repoAccountUserId;
    }
}
