from flask import Blueprint, jsonify, request
from bson import ObjectId
from datetime import datetime
from app.database import get_overlays_collection
from app.models import OverlayModel

api = Blueprint('api', __name__)

@api.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'message': 'Livestream API is running'
    })

@api.route('/overlays', methods=['POST'])
def create_overlay():
    try:
        data = request.get_json()
        
        is_valid, error = OverlayModel.validate_overlay(data)
        if not is_valid:
            return jsonify({'error': error}), 400
        
        overlay = OverlayModel.create_overlay(data)
        
        collection = get_overlays_collection()
        result = collection.insert_one(overlay)
        
        overlay['_id'] = str(result.inserted_id)
        overlay = OverlayModel.serialize_overlay(overlay)
        
        return jsonify({
            'message': 'Overlay created successfully',
            'overlay': overlay
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api.route('/overlays', methods=['GET'])
def get_overlays():
    try:
        stream_id = request.args.get('streamId', 'default')
        
        collection = get_overlays_collection()
        overlays = list(collection.find({'streamId': stream_id}))
        
        overlays = [OverlayModel.serialize_overlay(o) for o in overlays]
        
        return jsonify({
            'overlays': overlays,
            'count': len(overlays)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api.route('/overlays/<overlay_id>', methods=['GET'])
def get_overlay(overlay_id):
    try:
        if not ObjectId.is_valid(overlay_id):
            return jsonify({'error': 'Invalid overlay ID'}), 400
        
        collection = get_overlays_collection()
        overlay = collection.find_one({'_id': ObjectId(overlay_id)})
        
        if not overlay:
            return jsonify({'error': 'Overlay not found'}), 404
        
        overlay = OverlayModel.serialize_overlay(overlay)
        
        return jsonify({'overlay': overlay}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api.route('/overlays/<overlay_id>', methods=['PUT'])
def update_overlay(overlay_id):
    try:
        if not ObjectId.is_valid(overlay_id):
            return jsonify({'error': 'Invalid overlay ID'}), 400
        
        data = request.get_json()
        data['updatedAt'] = datetime.utcnow()
        
        collection = get_overlays_collection()
        result = collection.update_one(
            {'_id': ObjectId(overlay_id)},
            {'$set': data}
        )
        
        if result.matched_count == 0:
            return jsonify({'error': 'Overlay not found'}), 404
        
        overlay = collection.find_one({'_id': ObjectId(overlay_id)})
        overlay = OverlayModel.serialize_overlay(overlay)
        
        return jsonify({
            'message': 'Overlay updated successfully',
            'overlay': overlay
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api.route('/overlays/<overlay_id>', methods=['DELETE'])
def delete_overlay(overlay_id):
    try:
        if not ObjectId.is_valid(overlay_id):
            return jsonify({'error': 'Invalid overlay ID'}), 400
        
        collection = get_overlays_collection()
        result = collection.delete_one({'_id': ObjectId(overlay_id)})
        
        if result.deleted_count == 0:
            return jsonify({'error': 'Overlay not found'}), 404
        
        return jsonify({
            'message': 'Overlay deleted successfully'
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api.route('/overlays/stream/<stream_id>', methods=['DELETE'])
def delete_stream_overlays(stream_id):
    try:
        collection = get_overlays_collection()
        result = collection.delete_many({'streamId': stream_id})
        
        return jsonify({
            'message': f'Deleted {result.deleted_count} overlays',
            'count': result.deleted_count
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

