from flask import Blueprint, g, request, jsonify, make_response
from app import db
from app.models import Quest, Folder

api_quests = Blueprint('api_quests', __name__)

@api_quests.route('/api/quests/all_quests', methods=['GET'])
def all_quests():
    quests = Quest.query.all()
    folders = Folder.query.all()
    
    data = {}
    for f in folders:
        data[f.id] = [f.name, [[c.id, c.name, 0] for c in f.children]]
    for q in quests:
        data[q.parent_folder][1].append([q.id, q.name, 1])
    return make_response(
        jsonify({
            'code': 0,
            'message': 'OK',
            'data': data,
            }), 200)


@api_quests.route('/api/quests/add_folder', methods=['POST'])
def add_folder():
    fname = request.form.get('add_folder_name')
    parent_id = request.form.get('add_folder_to_id')
    if not fname or not parent_id:
        return make_response(jsonify(
            {'code': 0, 'message': 'Missing parameters (fname or parent_id)'}), 400)
    if len(parent_id) < 5:
        return make_response(jsonify(
            {'code': 0, 'message': 'Bad parent_id'}), 400)
    try:
        parent_id = int(parent_id[4:])
    except:
        return make_response(jsonify(
            {'code': 0, 'message': 'Bad parent_id'}), 400)
    db.session.add(Folder(name=fname,parent_folder=parent_id))
    db.session.commit()
    return make_response(jsonify({'code': 1, 'message': 'OK'}), 200)

