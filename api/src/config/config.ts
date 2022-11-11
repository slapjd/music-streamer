import Joi from 'joi'

//We don't need dotenv because docker will handle .env importing for us
//When editing bear in mind this runs behind nginx inside docker
const envSchema = Joi.object({
    SESSION_SECRET: Joi.string().required(),
    PORT: Joi.number().default(3000),
    VIRTUAL_MUSIC_FOLDER: Joi.string().default('/usr/share/musicstreamer/media/'), //TODO: validate this as a valid folder somehow
    VIRTUAL_NGINX_FOLDER: Joi.string().default('/usr/share/nginx/'), //TODO: same deal as above
}).unknown().required()

const { error, value: envVars } = envSchema.validate(process.env);
if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

interface Server {
    port: number
}

interface Credentials {
    session_secret: string
}

interface VirtualFolders {
    music: string, //TODO: rename to media
    nginx: string
}

interface Config {
    server: Server,
    credentials: Credentials,
    virtual_folders: VirtualFolders
}

const config: Config = {
    server: {
        port: envVars.PORT
    },
    credentials: {
        session_secret: envVars.SESSION_SECRET
    },
    virtual_folders: {
        music: envVars.VIRTUAL_MUSIC_FOLDER,
        nginx: envVars.VIRTUAL_NGINX_FOLDER
    }
}

export default config