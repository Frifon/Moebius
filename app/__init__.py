from flask import Flask
from flask.ext.sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config.from_object('config')
db = SQLAlchemy(app)

from app.api.quests import api_quests
app.register_blueprint(api_quests)

from app import views, models
