from flask import Flask
from flask import jsonify
from flask import request

from flask_restful import Resource, Api, reqparse

from flask_restful_dbbase import DBBase

from flask_jwt_extended import create_access_token
from flask_jwt_extended import get_jwt_identity
from flask_jwt_extended import jwt_required
from flask_jwt_extended import JWTManager

import nacl.pwhash
import nacl.exceptions

from ownerresource import *

app = Flask(__name__)
#TODO: environment variables
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["JWT_SECRET_KEY"] = "SUPER_MEGA_SECRET_KEY"

api = Api(app)
db = DBBase(app)
JWTManager(app)

parser = reqparse.RequestParser()
parser.add_argument("username")
parser.add_argument("password")

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True, nullable=True)
    username = db.Column(db.String(80), nullable=False)
    pw_hash = db.WriteOnlyColumn(db.String(256))

class MediaEntry(db.Model):
    __tablename__ = "media"

    id = db.Column(db.Integer, primary_key=True, nullable=True)
    owner_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

#TODO: maybe don't need this
db.create_all()

class MediaResource(OwnerResource):
    model_class = MediaEntry

class LoginResource(Resource):
    def get(self):
        args = parser.parse_args()
        args.password = bytes(args.password, "utf-8")

        db_user = User.query.filter(User.username == args.username).first()
        if db_user is None:
            return { "msg": "Bad username or password"}, 401
        try:
            nacl.pwhash.verify(db_user.pw_hash, args.password)
        except nacl.exceptions.InvalidkeyError:
            return { "msg": "Bad username or password"}, 401

        # username and password verified, give login token
        return { "access_token": create_access_token(identity=db_user.id) }

#TODO: one-time register codes
class RegisterResource(Resource):
    def post(self):
        args = parser.parse_args()
        args.password = bytes(args.password, "utf-8")

        db_users = User.query.filter(User.username == args.username).all()
        if (len(db_users) > 0):
            return { "msg": "Username not available" }, 409
        pw_hash = nacl.pwhash.str(args.password)
        User(
            username = args.username,
            pw_hash = pw_hash
        ).save()

        return { "msg": "Success" }


api.add_resource(MediaResource, *MediaResource.get_urls())
api.add_resource(LoginResource, "/login")
api.add_resource(RegisterResource, "/register")

if __name__ == '__main__':
    app.run(debug=True)