import { SessionData, Store } from 'express-session';
import type { Repository } from 'typeorm';
import { Session as DB_Session } from './entity/auth/session';

export type ISession = SessionData & {id: string}

export class RelationalStore<T extends ISession> extends Store {
    repo: Repository<ISession> //If I use T here it creates big boy issues for TypeORM (wrong types for all the properties)
    
    //I cannot for the life of me figure out how to add eventemitteroptions to this so it remains as is
    constructor(repo: Repository<T>) {
        super()
        this.repo = repo as Repository<ISession> //This should be safe because T always inherits from ISession
    }

    get(sid: string, callback: (err: any, session?: SessionData | null | undefined) => void): void {
        let relations = this.repo.metadata.relations.map(relation => {
            return relation.propertyName;
        }); //Workaround to load everything as eager because that's more similar to how express-session works by default
        this.repo.findOne({
            where: {
                id: sid
            },
            relations: relations
        }).then((sess => {
            if (sess?.cookie.expires && sess.cookie.expires.getTime() < Date.now()) {
                this.repo.delete({
                    id: sid
                })
                callback(null, null)
                return
            }

            callback(null, sess)
        }))     
    }

    set(sid: string, session: SessionData, callback?: ((err?: any) => void) | undefined): void {
        const session_db = new DB_Session()
        session_db.id = sid //I don't like doing this manually but whatever
        Object.assign(session_db, session)
        this.repo.save(session_db).then((_result) => {
            if (callback !== undefined) {
                callback(null)
                //TODO: actually check result maybe?
            }
        })
    }

    destroy(sid: string, callback?: ((err?: any) => void) | undefined): void {
        this.repo.delete({
            id: sid
        }).then((_result) => {
            if (callback !== undefined) {
                callback(null)
                //TODO: actually check result maybe?
            }
        })
    }

    override all(callback: (err: any, obj?: SessionData[] | { [sid: string]: SessionData; } | null | undefined) => void): void {
        this.repo.find().then((sessions) => {
            callback(null, sessions)
        })
    }

    override length(callback: (err: any, length: number) => void): void {
        this.repo.count().then((length) => {
            callback(null, length)
        })
    }

    override clear(callback?: ((err?: any) => void) | undefined): void {
        this.repo.delete({}).then((_result) => {
            if (callback !== undefined) {
                callback(null)
            }
        })
    }

    override touch(sid: string, session: SessionData, callback?: (() => void) | undefined): void {
        this.get(sid, (_, sess) => {
            if (sess === null || sess === undefined) return

            sess.cookie = session.cookie
            const session_db = new DB_Session()
            session_db.id = sid //I don't like doing this manually but whatever
            Object.assign(session_db, sess)
            this.repo.save(session_db).then(() => {
                if (callback !== undefined) callback()
            })
        })
    }
}