import { inject, injectable, delay } from 'tsyringe';
import { QrsCertificate } from '../model/qrs/QrsCertificate';
import { QrsConfig } from '../model/qrs/QrsConfig';
import qrsInteract from 'qrs-interact';
//import * as settings from '../settings';
import * as Entities from '../entities';
import * as Lib from '../lib';
import { Boom } from '@hapi/boom';
import axios from 'axios';
import * as https from 'https';
import * as utils from '../utils/common';
import { CertService } from '.';

@injectable()
export class QrsService {
    constructor(
        @inject(delay(() => CertService))
        private certService: CertService
    ) {}

    async getResource(
        userInfo: Entities.QlikUserInfo,
        qsInfo: Entities.QlikInfo,
        command: string
    ): Promise<any> {
        let r = null;
        try {
            const config = this.getConfig(userInfo, qsInfo);
            const qrsInteractInstance = new qrsInteract(config);

            r = await qrsInteractInstance.Get(command);
            return r;
        } catch (error) {
            throw new Lib.Errors.InternalError('Internal Error', error);
        }
    }

    async putResource(
        userInfo: Entities.QlikUserInfo,
        qsInfo: Entities.QlikInfo,
        command: string,
        payload = null
    ): Promise<any> {
        let r = null;
        try {
            const config = this.getConfig(userInfo, qsInfo);
            const qrsInteractInstance = new qrsInteract(config);

            r = await qrsInteractInstance.Put(command, payload, 'json');
            return r;
        } catch (error) {
            throw new Lib.Errors.InternalError('Internal Error', error);
        }
    }

    async postResource(
        userInfo: Entities.QlikUserInfo,
        qsInfo: Entities.QlikInfo,
        command: string,
        payload = null,
        contentType = 'json'
    ): Promise<any> {
        let r = null;
        try {
            const config = this.getConfig(userInfo, qsInfo);
            const qrsInteractInstance = new qrsInteract(config);
            r = await qrsInteractInstance.Post(command, payload, contentType);
            return r;
        } catch (error) {
            throw new Lib.Errors.InternalError('Internal Error', error);
        }
    }

    async deleteResource(
        userInfo: Entities.QlikUserInfo,
        qsInfo: Entities.QlikInfo,
        command: string
    ): Promise<any> {
        let r = null;
        try {
            const config = this.getConfig(userInfo, qsInfo);
            const qrsInteractInstance = new qrsInteract(config);

            r = await qrsInteractInstance.Delete(command);
            return r;
        } catch (error) {
            throw new Lib.Errors.InternalError('Internal Error', error);
        }
    }

    async isAlive(qsInfo: Entities.QlikInfo): Promise<boolean> {
        try {
            const qlikSessionUrl = `${qsInfo.ssl ? 'https' : 'http'}://${
                qsInfo.host
            }:${qsInfo.qpsPort}/qps/${qsInfo.vp ? qsInfo.vp + '/' : ''}`;
            return new Promise((resolve, reject) => {
                this.qlikRequest(qlikSessionUrl + `alive`, 'GET', null)
                    .then((res) => {
                        resolve(res.data);
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

    // Get configuration
    private getConfig(
        userInfo: Entities.QlikUserInfo,
        qsInfo: Entities.QlikInfo
    ): QrsConfig {
        let cert = null;
        let config = null;

        const certs = this.certService.getCertPath;
        try {
            if (certs.type === 'ca') {
                cert = new QrsCertificate(
                    certs.keyPath,
                    certs.certPath,
                    undefined,
                    undefined
                );
            } else if (certs.type === 'pfx') {
                cert = new QrsCertificate(
                    undefined,
                    undefined,
                    certs.pfxPath,
                    certs.passphrase
                );
            }

            config = new QrsConfig(
                qsInfo.host,
                qsInfo.qrsPort,
                qsInfo.vp,
                cert,
                `UserDirectory=${userInfo.userDirectory};UserId=${userInfo.userId}`,
                userInfo.userDirectory,
                userInfo.userId
            );
            return config;
        } catch (error) {
            throw new Lib.Errors.InternalError('Internal Error', error);
        }
    }
}
