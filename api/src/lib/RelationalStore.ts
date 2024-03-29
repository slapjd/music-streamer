import { SessionData, Store } from 'express-session';
import type { Repository } from 'typeorm';
import { Session as DB_Session } from '../server/entities/session.js';

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
                this.repo.remove(sess)
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
            if (callback) {
                callback(null)
                //TODO: check if db query failed and translate error for express-session
            }
        })
    }

    destroy(sid: string, callback?: ((err?: any) => void) | undefined): void {
        this.repo.findBy({
            id: sid
        }).then(sess => {
            this.repo.remove(sess).then((_result) => {
                if (callback) {
                    callback(null)
                    //TODO: check if db query failed and translate error for express-session
                }
            })
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
        //WARNING: This does not call any remove event methods so be very fucking careful
        this.repo.delete({}).then((_result) => {
            if (callback) {
                callback(null)
                //TODO: check if db query failed and translate error for express-session
            }
        })
    }

    override touch(sid: string, session: SessionData, callback?: (() => void) | undefined): void {
        this.get(sid, (_, sess) => {
            if (!sess) return

            sess.cookie = session.cookie
            const session_db = new DB_Session()
            session_db.id = sid
            Object.assign(session_db, sess)
            this.repo.save(session_db).then(() => {
                if (callback) callback()
            })
        })
    }
}