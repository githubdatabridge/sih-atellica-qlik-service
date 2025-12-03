export class QrsCertificate {
    private keyFile: string;
    private certFile: string;

    private pfxFile: string;
    private passphrase: string;

    constructor(
        keyFile: string,
        certFile: string,
        pfxFile: string,
        passphrase: string
    ) {
        this.keyFile = keyFile;
        this.certFile = certFile;

        this.pfxFile = pfxFile;
        this.passphrase = passphrase;
    }

    public getKeyFile(): string {
        return this.keyFile;
    }
    public getCertFile(): string {
        return this.certFile;
    }
    public setKeyFile(keyFile: string) {
        this.keyFile = keyFile;
    }
    public setCertFile(certFile: string) {
        this.certFile = certFile;
    }

    public getPfxFile(): string {
        return this.pfxFile;
    }
    public getPassphrase(): string {
        return this.passphrase;
    }
    public setPfxFile(pfxFile: string) {
        this.pfxFile = pfxFile;
    }
    public setPassphrase(passphrase: string) {
        this.passphrase = passphrase;
    }
}
