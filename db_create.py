#!flask/bin/python
# from migrate.versioning import api
from config import SQLALCHEMY_DATABASE_URI
from app import db
import os.path
db.create_all()
print (db, "created")
