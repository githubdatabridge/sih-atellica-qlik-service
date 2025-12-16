import * as Boom from '@hapi/boom';
import { container } from 'tsyringe';
import { BaseError } from '.';
import { LogService } from '../../services';
import * as Errors from './Errors';

export function handleError(target: any, key: string, descriptor: any) {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
        try {
            return await originalMethod.apply(this, args);
        } catch (error) {
            boomHandleError(error);
        }
    };

    return descriptor;
}

export function boomHandleError(error: any) {
    const baseError = error as BaseError;
    const boomed = convertToBoom(error);

    //const logService = container.resolve(LogService);

    //logService.get().error(
    console.error(
        `
                    {${baseError.name}}
                    Timestamp: ${new Date().toISOString()}
                    Error: ${baseError.name || 'Error'}
                    Message: ${baseError.message}
                    CustomData: ${JSON.stringify(baseError.customData)}
                    Stack: ${baseError.stack}
                    {/${baseError.name}}
                `
    );

    throw boomed;
}

function convertToBoom(error: BaseError): Boom.Boom {
    if (error instanceof Errors.ValidationError) {
        return Boom.badRequest(error.message);
    } else if (error instanceof Errors.NotFoundError) {
        return Boom.notFound(error.message);
    } else if (error instanceof Errors.QlikError) {
        return Boom.internal(error.message);
    } else if (error instanceof Errors.AlreadyExistsError) {
        return Boom.conflict(error.message);
    } else if (error instanceof Errors.InternalError) {
        return Boom.internal(error.message);
    } else if (error instanceof Errors.BadDataError) {
        return Boom.internal(error.message);
    } else if (error instanceof Errors.Unauthorized) {
        return Boom.unauthorized(error.message);
    } else if (error instanceof Errors.FailedDependency) {
        return Boom.failedDependency(error.message);
    } else if (error instanceof Errors.Conflict) {
        return Boom.conflict(error.message);
    } else {
        return Boom.internal(error.message);
    }
}
