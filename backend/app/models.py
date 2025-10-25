from datetime import datetime
from bson import ObjectId

class OverlayModel:
    @staticmethod
    def create_overlay(data):
        overlay = {
            'type': data.get('type'),
            'content': data.get('content'),
            'position': {
                'x': data.get('position', {}).get('x', 0),
                'y': data.get('position', {}).get('y', 0)
            },
            'size': {
                'width': data.get('size', {}).get('width', 0.3),
                'height': data.get('size', {}).get('height', 0.1)
            },
            'style': data.get('style', {}),
            'streamId': data.get('streamId', 'default'),
            'createdAt': datetime.utcnow(),
            'updatedAt': datetime.utcnow()
        }
        
        return overlay
    
    @staticmethod
    def validate_overlay(data):
        required_fields = ['type', 'content']
        
        for field in required_fields:
            if field not in data:
                return False, f'Missing required field: {field}'
        
        if data['type'] not in ['text', 'image']:
            return False, 'Type must be either "text" or "image"'
        
        return True, None
    
    @staticmethod
    def serialize_overlay(overlay):
        if overlay is None:
            return None
        
        overlay['_id'] = str(overlay['_id'])
        
        if 'createdAt' in overlay:
            overlay['createdAt'] = overlay['createdAt'].isoformat()
        if 'updatedAt' in overlay:
            overlay['updatedAt'] = overlay['updatedAt'].isoformat()
        
        return overlay

