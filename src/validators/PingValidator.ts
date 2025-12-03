import * as Joi from 'joi';

const response = Joi.object({
    ping: Joi.string().required(),
}).label('PingResponse');

export { response };
