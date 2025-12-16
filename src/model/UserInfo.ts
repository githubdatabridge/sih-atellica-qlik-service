export class UserInfo {
    private _userId: string;
    private _userDirectory: string;
    private _attributes: any[];

    constructor(userId: string, userDirectory: string, attributes = []) {
        this._userId = userId;
        this._userDirectory = userDirectory;
        this._attributes = attributes;
    }

    public get getUserId(): string {
        return this._userId;
    }

    public get getUserDirectory(): string {
        return this._userDirectory;
    }

    public get getAttributes(): any[] {
        return this._attributes;
    }

    public set setUserId(userId: string) {
        this._userId = userId;
    }

    public set setUserDirectory(userDirectory: string) {
        this._userDirectory = userDirectory;
    }

    public set setAttributes(attributes: any[]) {
        this._attributes = attributes;
    }
}
