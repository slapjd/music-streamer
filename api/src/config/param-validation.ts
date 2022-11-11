import Joi from 'joi'

export default {
    getTrack: {
        params: Joi.object({
            id: Joi.number().required()
        })
    },
    deleteTrack: {
        params: Joi.object({
            id: Joi.number().required()
        })
    },
    login: {
        body: Joi.object({
            username: Joi.string().required(),
            password: Joi.string().required()
        })
    }
}