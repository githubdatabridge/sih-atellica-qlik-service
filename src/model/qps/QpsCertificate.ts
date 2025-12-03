export class QpsCertificate {
    private ca: any;
    private key: any;
    private cert: any;

    constructor(ca: any, key: any, cert: any) {
        this.ca = ca;
        this.key = key;
        this.cert = cert;
    }
}
