import { Controller } from 'hapi-decorators';

export class BaseController implements Controller {
    baseUrl: string;
    routes: () => any[];
}
