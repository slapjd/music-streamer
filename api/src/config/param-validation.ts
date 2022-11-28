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
        },
        search: {
            query: Joi.object({
                title: Joi.string(),
                artist: Joi.object({
                    name: Joi.string()
                }).min(1),
                album: Joi.object({
                    title: Joi.string()
                }).min(1)
            }).min(1).required()
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