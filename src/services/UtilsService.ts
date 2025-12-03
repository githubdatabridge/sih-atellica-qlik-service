import { injectable } from 'tsyringe';
import { Boom } from '@hapi/boom';
import * as utils from '../utils/common';
import { Readable } from 'stream';
import * as fs from 'fs';
import { LogService } from './LogService';

@injectable()
export class UtilsService {
    constructor(private logService?:LogService) {}

    saveArrayAsFile(arrayBuffer, filePath) {
        fs.writeFile(filePath, Buffer.from(arrayBuffer), 'binary', (err) => {
            if (err) {
                this.logService.get().error('There was an error writing the image');
            } else {
                this.logService.get().info('Written File :' + filePath);
            }
        });
    }

    readFileStream(stream: Readable) {
        let fileBuffer;
        let chunks = [];
        let dummy = [];
        return new Promise((resolve) => {
            stream.on('readable', () => {
                let chunk;

                // Using while loop and calling
                // read method
                while (null !== (chunk = stream.read())) {
                    chunks.push(chunk);
                    dummy.push(chunk);
                }
            });
            stream.on('end', () => {
                fileBuffer = Buffer.concat(chunks);
                resolve(fileBuffer);
            });
        });
    }

    getContentType(fileExt) {
        let contentType;
        switch (fileExt) {
            case 'json':
                contentType = 'application/json';
                break;
            case 'pdf':
                contentType = 'application/pdf';
                break;
            case 'ppt':
                contentType = 'application/vnd.ms-powerpoint';
                break;
            case 'pptx':
                contentType =
                    'application/vnd.openxmlformats-officedocument.preplyentationml.preplyentation';
                break;
            case 'xls':
                contentType = 'application/vnd.ms-excel';
                break;
            case 'xlsx':
                contentType =
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                break;
            case 'doc':
                contentType = 'application/msword';
                break;
            case 'docx':
                contentType =
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
                break;
            case 'csv':
                contentType = 'application/octet-stream';
                break;
            case 'xml':
                contentType = 'application/xml';
                break;
        }
        return contentType;
    }

    filterData(array, key: string, value) {
        return array.filter((e) => {
            return e[key] == value;
        });
    }
}
