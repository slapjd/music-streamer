from flask_jwt_extended import (
    jwt_required,
    get_jwt_identity
)
from flask_restful_dbbase.resources import ModelResource

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