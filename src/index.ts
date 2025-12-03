import 'reflect-metadata';

import * as Hapi from '@hapi/hapi';
import * as Inert from '@hapi/inert';
import * as Vision from '@hapi/vision';
import * as HapiSwagger from 'hapi-swagger';
import * as DevErrors from 'hapi-dev-errors';

import * as services from './services';
import * as controllers from './controllers';

import { container } from 'tsyringe';

import { getServerCertificates } from './server-certificates';
import { ApiKey } from './lib/plugins/ApiKey';

const configService = container.resolve(services.ConfigService);
const logService = container.resolve(services.LogService);
const certService = container.resolve(services.CertService);

let gateway = {};

if (configService.get('GATEWAY_HOST') && configService.get('GATEWAY_PATH')) {
    gateway = {
        host: configService.get('GATEWAY_HOST'),
        basePath: configService.get('GATEWAY_PATH'),
    };
    logService
        .get()
        .info(
            `Setting up Swagger gateway ${gateway['host']}${gateway['basePath']}`
        );
}

const swaggerConfig: HapiSwagger.RegisterOptions = {
    info: {
        title: configService.get('TITLE'),
        version: configService.get('VERSION'),
    },
    ...gateway, //uncomment to enable gateway for swagger
    
    securityDefinitions: {
        apiKey: {
            type: 'apiKey',
            name: 'x-api-key',
            in: 'header',
        },
    },
    security: [{ apiKey: [] }],
};

const setupServerPlugins = async (server: Hapi.Server) => {
    await server.register({
        plugin: DevErrors,
        options: {
            showErrors: process.env.NODE_ENV !== 'production',
        },
    });
    await server.register(Inert);
    await server.register({
        plugin: HapiSwagger,
        options: swaggerConfig,
    });
    await server.register({
        plugin: Vision,
    });
    await server.register({
        plugin: ApiKey,
    });
};

const setupControllers = (server: Hapi.Server) => {
    const qrsController = new controllers.QrsController();
    //const qpsController = new controllers.QpsController();
    //const qixController = new controllers.QixController();
    const pingController = new controllers.PingController();
    const qsIntegrationController = new controllers.QsIntegrationController();
    const qsAppController = new controllers.QsAppController();
    const qsUserController = new controllers.QsUserController();
    const qsTaskController = new controllers.QsTaskController();

    server.route(pingController.routes());
    server.route(qsIntegrationController.routes());
    server.route(qrsController.routes());
    //server.route(qixController.routes());
    //server.route(qpsController.routes());
    server.route(qsAppController.routes());
    server.route(qsUserController.routes());
    server.route(qsTaskController.routes());
};

const setupLogs = (server: Hapi.Server) => {
    server.events.on('response', (request) => {
        logService
            .get()
            .debug(
                `Response Request ${
                    request.info.remoteAddress
                }: ${request.method.toUpperCase()}  ${request.path}  ${
                    request.info.hostname
                }`
            );
    });

    server.ext('onRequest', (request, reply) => {
        logService
            .get()
            .debug(
                `Request ${
                    request.info.remoteAddress
                }: ${request.method.toUpperCase()}  ${request.path}  ${
                    request.info.hostname
                }`
            );

        return reply.continue;
    });
};

const hostConfiguration = {
    host: configService.get('HOST'),
    port: parseInt(configService.get('PORT')),
};

const routeConfiguration = {
    routes: {
        cors: {
            origin: ['*'],
            credentials: true,
        },
    },
};

const isSsl = configService.get('SSL', true);

const init = async () => {
    const cfg = isSsl
        ? {
              ...hostConfiguration,
              tls: {
                  key: getServerCertificates().key,
                  cert: getServerCertificates().cert,
              },
              ...routeConfiguration,
          }
        : {
              ...hostConfiguration,
              ...routeConfiguration,
          };

    if (process.env.NODE_ENV !== 'production') {
        cfg['debug'] = {
            request: ['error'],
        };
    }

    const server = new Hapi.Server(cfg);

    await setupServerPlugins(server);
    setupControllers(server);
    certService.init()
    await server.start();
    logService.get().info(`Server running on ${server.info.uri}`);
    setupLogs(server);
};

process.on('unhandledRejection', (err) => {
    logService.get().error(err);
    process.exit(1);
});

init();
