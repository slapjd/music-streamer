import Joi from 'joi'

export default {
    tracks: {
        getOne: {
            params: Joi.object({
                id: Joi.number().required()
            })
        },
        deleteOne: {
            params: Joi.object({
                id: Joi.number().required()
            })
        }
    },
    auth: {
        login: {
            body: Joi.object({
                username: Joi.string().required(),
                password: Joi.string().required()
            })
        }
    },
    users: {
        getOne: {
            params: Joi.object({
                id: Joi.number().required()
            })
        },
        create: {
            body: Joi.object({
                username: Joi.string().required(),
                password: Joi.string().required()
            })
        },
        update: {
            body: Joi.object({
                username: Joi.string().required(),
                password: Joi.string().required()
            })
        },
        deleteOne: {
            params: Joi.object({
                id: Joi.number().required()
            })
        }
    }
}