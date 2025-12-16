import TransportStream = require('winston-transport');
import { Pool, PoolClient } from 'pg';
import { ConfigService } from '../../services';

export class WinstonPgTransport extends TransportStream {
    public readonly className = this.constructor.name;
    private pool: Pool;
    private tableName: string;

    constructor(configService: ConfigService) {
        super({
            level: configService.get('LOG_DB_LEVEL') || 'info',
        });

        this.pool = this.getDBPool(configService);
        this.tableName = configService.get('LOG_DB_TABLE_NAME');
        this.log = this.log.bind(this);
    }

    public async log(
        info: { [index: string]: string | number },
        callback: () => unknown
    ): Promise<void> {
        const sql = `INSERT INTO ${this.tableName} (timestamp, level, message, meta, service) VALUES ($1,$2,$3,$4,$5);`;
        let client: PoolClient | undefined;

        try {
            client = await this.pool.connect();
            await client.query(sql, [
                info.timestamp,
                info.level,
                info.message,
                info.meta,
                info.label,
            ]);
            callback();
        } catch (err) {
            // tslint:disable-next-line: no-console
            console.log(
                `${this.className}.log(${JSON.stringify(
                    info
                )}): Failure to Log: ${err.message}`
            );
        } finally {
            if (client) {
                client.release();
            }
        }
    }

    private getDBPool(configService: ConfigService) {
        return new Pool({
            connectionString: `postgres://${configService.get(
                'DB_USER'
            )}:${configService.get('DB_PASS')}@${configService.get(
                'DB_HOST'
            )}:${configService.get('DB_PORT')}/${configService.get(
                'DB_DATABASE'
            )}`,
            ssl: configService.get('DB_SSL', true),
        });
    }
}
