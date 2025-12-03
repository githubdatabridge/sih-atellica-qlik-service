import { inject, injectable, delay } from 'tsyringe';
import { Boom } from '@hapi/boom';
import * as https from 'https';
import axios from 'axios';
import * as url from 'url';
import * as utils from '../utils/common';
import * as Entities from '../entities';
import * as Lib from '../lib';
import { LogService } from './LogService';
import { CertService } from '.';
@injectable()
export class QpsService {
    constructor(
        @inject(delay(() => CertService))
        private certService: CertService,
        private logService: LogService
    ) {}

    async authTicket(userInfo, qsInfo, redirectUrl: string): Promise<any> {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
        return new Promise((resolve) => {
            const xrfkey = utils.generateXrfkey();

            //Configure parameters for the ticket request
            const certs = this.certService.getCert;
            var options = {
                host: qsInfo.host,
                port: qsInfo.qpsPort,
                path: `${qsInfo.ssl ? 'https' : 'http'}://${qsInfo.host}:${
                    qsInfo.qpsPort
                }/qps/${qsInfo.vp}/ticket?xrfkey=${xrfkey}`,
                method: 'POST',
                headers: {
                    'X-qlik-xrfkey': xrfkey,
                    'Content-Type': 'application/json',
                },
                strictSSL: false,
                ...certs,
                agent: false,
            };

            //Send ticket request
            const ticketreq = https.request(options, (ticketres) => {
                ticketres.on('data', (d) => {
                    const ticket = JSON.parse(d.toString());
                    const myRedirect = url.parse(redirectUrl);

                    const query = new url.URLSearchParams(myRedirect.query);
                    query.append('QlikTicket', ticket.Ticket);

                    const redirectToUrl = `${
                        myRedirect.href
                    }?${query.toString()}`;
                    return resolve(redirectToUrl);
                });
            });

            //Send JSON request for ticket
            const jsonrequest = JSON.stringify({
                UserDirectory: userInfo.userDirectory,
                UserId: userInfo.userId,
                Attributes: userInfo.attributes ? [] : userInfo.attributes,
            });

            ticketreq.write(jsonrequest);
            ticketreq.end();

            ticketreq.on('error', (error) => {
                throw new Lib.Errors.InternalError(
                    error.message,
                    JSON.stringify(error.stack)
                );
            });
        }).catch((error) => {
            throw error;
        });
    }

    async existsSession(sessionId: string, userInfo, qsInfo): Promise<boolean> {
        let sessionExists = false;
        try {
            const url = `${qsInfo.ssl ? 'https' : 'http'}://${qsInfo.host}:${
                qsInfo.qpsPort
            }/qps/${qsInfo.vp ? qsInfo.vp + '/' : ''}`;
            const qlikSessionUrl = `${url}user/${userInfo.userDirectory}/${userInfo.userId}`;

            return new Promise((resolve, reject) => {
                this.qlikRequest(qlikSessionUrl, 'GET', {
                    UserDirectory: userInfo.userDirectory,
                    UserId: userInfo.userId,
                    SessionId: sessionId,
                })
                    .then((sessions) => {
                        sessions.data.forEach((session) => {
                            if (session.SessionId === sessionId) {
                                sessionExists = true;
                            }
                        });
                        resolve(sessionExists);
                    })
                    .catch((error) => reject(error));
            });
        } catch (error) {
            throw new Boom(error);
        }
    }

    async createSession(
        userInfo: Entities.QlikUserInfo,
        qsInfo: Entities.QlikInfo
    ): Promise<any> {
        const qlikSessionId = Math.ceil(
            Math.random() * 1000000000000
        ).toString();
        try {
            const qlikUrl = `${qsInfo.ssl ? 'https' : 'http'}://${
                qsInfo.host
            }:${qsInfo.qpsPort}/qps/${qsInfo.vp ? qsInfo.vp + '/' : ''}`;

            return new Promise((resolve, reject) => {
                this.qlikRequest(qlikUrl + `session`, 'POST', {
                    UserDirectory: userInfo.userDirectory,
                    UserId: userInfo.userId,
                    SessionId: qlikSessionId,
                    Attributes: userInfo?.attributes ? userInfo.attributes : [],
                })
                    .then((res) => {
                        this.logService.get().info('Qlik response', res);
                        res.sessionId = qlikSessionId;
                        resolve(res);
                    })
                    .catch((error) => reject(new Boom(error)));
            });
        } catch (error) {
            throw new Boom(error);
        }
    }

    async getSession(id: string, qsInfo): Promise<any> {
        try {
            const qlikSessionUrl = `${qsInfo.ssl ? 'https' : 'http'}://${
                qsInfo.host
            }:${qsInfo.qpsPort}/qps/${qsInfo.vp ? qsInfo.vp + '/' : ''}`;
            return new Promise((resolve, reject) => {
                this.qlikRequest(qlikSessionUrl + `session/${id}`, 'GET', null)
                    .then((res) => {
                        resolve(res.data);
                    })
                    .catch((error) => reject(new Boom(error)));
            });
        } catch (error) {
            throw new Boom(error);
        }
    }

    async getActiveSession(
        userInfo: Entities.QlikUserInfo,
        qsInfo: Entities.QlikInfo
    ): Promise<any> {
        try {
            const qlikSessionUrl = `${qsInfo.ssl ? 'https' : 'http'}://${
                qsInfo.host
            }:${qsInfo.qpsPort}/qps/${qsInfo.vp ? qsInfo.vp + '/' : ''}`;
            return new Promise((resolve, reject) => {
                this.qlikRequest(
                    qlikSessionUrl +
                        `user/${userInfo.userDirectory}/${userInfo.userId}`,
                    'GET',
                    null
                )
                    .then((res) => {
                        resolve(res.data);
                    })
                    .catch((error) => reject(new Boom(error)));
            });
        } catch (error) {
            throw new Boom(error);
        }
    }

    async deleteSession(id: string, qsInfo): Promise<any> {
        try {
            const qlikSessionUrl = `${qsInfo.ssl ? 'https' : 'http'}://${
                qsInfo.host
            }:${qsInfo.qpsPort}/qps/${qsInfo.vp ? qsInfo.vp + '/' : ''}`;
            return new Promise((resolve, reject) => {
                this.qlikRequest(
                    qlikSessionUrl + `session/${id}`,
                    'DELETE',
                    null
                )
                    .then((res) => {
                        resolve(true);
                    })
                    .catch((error) => reject(new Boom(error)));
            });
        } catch (error) {
            throw new Boom(error);
        }
    }

    private async qlikRequest(url: string, method, json): Promise<any> {
        let res = null;
        const qlikXrfKey = utils.generateXrfkey();
        const qlikUrl = `${url}?xrfkey=${qlikXrfKey}`;
        const certs = this.certService.getCert;

        try {
            const agent = new https.Agent({
                rejectUnauthorized: false,
                ...certs,
            });
            res = await axios.request({
                url: qlikUrl,
                method,
                headers: {
                    'X-Qlik-Xrfkey': qlikXrfKey,
                    'Content-Type': 'application/json',
                },
                data: json,
                httpsAgent: agent,
            });
            return await res;
        } catch (error) {
            throw new Boom(error);
        }
    }
}
