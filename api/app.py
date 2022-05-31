from flask import Flask
from flask import jsonify
from flask import request

from flask_restful import Resource, Api
from flask_restful_dbbase import DBBase
from flask_restful_dbbase.resources import (
    CollectionModelResource,
    ModelResource,
    MetaResource,
)

from flask_jwt_extended import create_access_token
from flask_jwt_extended import get_jwt_identity
from flask_jwt_extended import jwt_required
from flask_jwt_extended import JWTManager

import nacl.pwhash
import nacl.exceptions

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["JWT_SECRET_KEY"] = "SUPER_MEGA_SECRET_KEY"

api = Api(app)
db = DBBase(app)
JWTManager(app)

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True, nullable=True)
    username = db.Column(db.String(80), nullable=False)
    pw_hash = db.WriteOnlyColumn(db.String(256))

class File(db.Model):
    __tablename__ = "files"

    id = db.Column(db.Integer, primary_key=True, nullable=True)
    owner_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

#TODO: maybe don't need this
db.create_all()

class OwnerResource(ModelResource):
    method_decorators = [jwt_required]

    def process_get_input(self, query, data, kwargs):
        """
        This function runs in the GET method with access to
        the Model.query object.
        """
        user_id = get_jwt_identity()
        if user_id:
            query = query.filter_by(owner_id=user_id)
            return True, (query, data)

        return False, ({"message": "Not found"}, 404)

    def process_post_input(self, data):
        """
        This function runs in the POST method with access to
        the data included with the request.
        """
        user_id = get_jwt_identity()
        owner_id = data.get("ownerId", None)
        if owner_id:
            if int(owner_id) == user_id:
                return True, data

        return (
            False,
            ({"message": "The user id does not match the owner id"}, 400),
        )

    def process_put_input(self, query, data, kwargs):
        """
        This function runs in the PUT method with access to
        the data included with the request.
        """
        user_id = get_jwt_identity()
        owner_id = data.get("ownerId", None)
        if owner_id:
            if int(owner_id) == user_id:
                return True, (query, data)

        return (
            False,
            ({"message": "The user id does not match the owner id"}, 400),
        )

    def process_patch_input(self, query, data, kwargs):
        """
        This function runs in the PATCH method with access to
        the data included with the request.
        """
        user_id = get_jwt_identity()
        owner_id = data.get("ownerId", None)
        if owner_id:
            if int(owner_id) == user_id:
                return True, data

        return (
            False,
            ({"message": "The user id does not match the owner id"}, 400),
        )

    def process_delete_input(self, query, kwargs):
        """
        This function runs in the DELETE method.
        """
        user_id = get_jwt_identity()
        if user_id:
            query = query.filter_by(owner_id=user_id)
            return True, query

        return False, ("Not found", 404)

class OwnerCollectionResource(CollectionModelResource):
    method_decorators = [jwt_required]

    def process_get_input(self, query, data):
        user_id = get_jwt_identity()
        if user_id:
            query = query.filter_by(owner_id=user_id)
            return True, (query, data)

        return False, ("The user id is not authorized", 400)

class FileResource(OwnerResource):
    model_class = File

api.add_resource(FileResource, *FileResource.get_urls())

# Create a route to authenticate your users and return JWTs. The
# create_access_token() function is used to actually generate the JWT.
@app.route("/login", methods=["POST"])
def login():
    username = request.json.get("username", None)
    #TODO: get real encoding
    password = bytes(request.json.get("password", None), "utf-8")

    db_user = User.query.filter(User.username == username).first()
    try:
        nacl.pwhash.verify(db_user.pw_hash, password)
    except nacl.exceptions.InvalidkeyError:
        return jsonify({"msg": "Bad username or password"}), 401

    access_token = create_access_token(identity=db_user.id)
    return jsonify(access_token=access_token)

# Route to add a new user
#TODO: one-time codes for private registration
@app.route("/register", methods=["POST"])
def register():
    username = request.json.get("username", None)
    #TODO: get real encoding of string if possible
    password = bytes(request.json.get("password", None), "utf-8")

    db_users = User.query.filter(User.username == username).all()
    if (len(db_users) > 0):
        return jsonify({"msg": "Username not available!"}), 409

    pw_hash = nacl.pwhash.str(password)

    User(
        username=username,
        pw_hash=pw_hash,
    ).save()

    return jsonify({"msg": "Success!"}), 200

if __name__ == '__main__':
    app.run(debug=True)