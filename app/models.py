from app import db
from sqlalchemy.orm import relationship, backref
from sqlalchemy import ForeignKey

class Quest(db.Model):
    __table_args__ = {'sqlite_autoincrement': True}
    id = db.Column(db.Integer, primary_key=True, unique=True)

    name = db.Column(db.String(120), index=True)
    timestamp = db.Column(db.Float, index=True)
    parent_folder = db.Column(db.Integer, index=True)
    # parent_folder = relationship(
    #     'Folder',
    #     backref=backref('quests', order_by=name),
    #     primaryjoin='Quest.parent_folder_id == Folder.id')
    

    def __repr__(self):
        return 'Quest {0}:{1}'.format(self.id, self.name)

class Folder(db.Model):
    __table_args__ = {'sqlite_autoincrement': True}
    id = db.Column(db.Integer, primary_key=True, unique=True)

    name = db.Column(db.String(120), index=True)
    parent_folder = db.Column(db.Integer, ForeignKey('folder.id')) # 0 == root

    children = relationship("Folder",
                    lazy="joined",
                    join_depth=2)


    def __repr__(self):
        return 'Folder {0}:{1}'.format(self.id, self.name)

