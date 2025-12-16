export class QsInfo {
    private _host: string;
    private _port: number;
    private _vp: string;
    private _redirectUrl: string;

    constructor(
        host: string,
        port: number,
        vp: string = null,
        redirectUrl: string = ''
    ) {
        this._host = host;
        this._port = port;
        this._vp = vp;
        this._redirectUrl = redirectUrl;
    }

    public get getHost(): string {
        return this._host;
    }

    public get getPort(): number {
        return this._port;
    }

    public get getVp(): string {
        return this._vp;
    }

    public get getRedirectUrl(): string {
        return this._redirectUrl;
    }

    public set setHost(host: string) {
        this._host = host;
    }

    public set setPort(port: number) {
        this._port = port;
    }

    public set setVp(vp: string) {
        this._vp = vp;
    }

    public set setRedirectUrl(redirectUrl: string) {
        this._redirectUrl = redirectUrl;
    }
}
