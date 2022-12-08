
from distutils.util import strtobool
from flask import Blueprint, flash, redirect, url_for
from flask_login import login_required
from changedetectionio.store import ChangeDetectionStore

def construct_blueprint(datastore: ChangeDetectionStore):

    price_data_follower_blueprint = Blueprint('price_data_follower', __name__)

    @login_required
    @price_data_follower_blueprint.route("/<string:uuid>/accept", methods=['GET'])
    def accept(uuid):
        datastore.data['watching'][uuid]['track_ldjson_price_data'] = 'accepted'
        return redirect(url_for("form_watch_checknow", uuid=uuid))


    @login_required
    @price_data_follower_blueprint.route("/<string:uuid>/reject", methods=['GET'])
    def reject(uuid):
        datastore.data['watching'][uuid]['track_ldjson_price_data'] = 'rejected'
        return redirect(url_for("index"))


    return price_data_follower_blueprint


