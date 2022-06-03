from flask_jwt_extended import (
    jwt_required,
    get_jwt_identity
)
from flask_restful_dbbase.resources import CollectionModelResource

class OwnerCollectionResource(CollectionModelResource):
    method_decorators = [jwt_required]

    def process_get_input(self, query, data):
        user_id = get_jwt_identity()
        if user_id:
            query = query.filter_by(owner_id=user_id)
            return True, (query, data)

        return False, ("The user id is not authorized", 400)