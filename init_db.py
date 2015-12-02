from app import db
from app.models import Folder, Quest

db.session.add(Folder(name=u"ROOT",parent_folder=0))
db.session.commit()

db.session.add(Folder(name=u"Москва",parent_folder=1))
db.session.commit()
db.session.add(Folder(name=u"Крутые",parent_folder=2))
db.session.commit()
db.session.add(Folder(name=u"Отстой",parent_folder=2))
db.session.commit()

db.session.add(Quest(name=u"МГУ",parent_folder=2))
db.session.commit()
db.session.add(Quest(name=u"Арбат",parent_folder=3))
db.session.commit()