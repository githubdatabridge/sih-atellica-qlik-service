const generateHash = (params: string | string[]): number => {
    let h = 0;

    if (typeof params === 'string') {
        for (let i = 0; i < params.length; i++) {
            h = (h * 31 + params.charCodeAt(i)) & 0xffffffff;
        }
    } else if (params instanceof Array) {
        for (const value of params) {
            h ^= generateHash(value);
        }
    }

    return h;
};

const generateXrfkey = (): string => {
    const chars =
        '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const string_length = 16;
    let value = '';

    for (let i = 0; i < string_length; i++) {
        const rnum = Math.floor(Math.random() * chars.length);
        value += chars.substring(rnum, rnum + 1);
    }

    return value;
};

const buildConditions = (
    field: string,
    values: string[],
    qOp: string,
    logicOp: string
): string | null => {
    const conditions: string[] = [];

    for (const value of values) {
        conditions.push(`${field} ${qOp} '${value}'`);
    }

    return conditions.length ? conditions.join(` ${logicOp} `) : null;
};

const lookupJson = <T>(o: T, prop: keyof T): any[] => {
    const res: any[] = [];

    JSON.stringify(o, (key, value) => (key === prop && res.push(value), value));

    return res;
};

export { generateHash, generateXrfkey, buildConditions, lookupJson };

export function dateFromQlikNumber(_qNum: number): void {
    throw new Error('Function not implemented.');
}
