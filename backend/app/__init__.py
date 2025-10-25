from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import os

load_dotenv()

def create_app():
    app = Flask(__name__)
    
    CORS(app, resources={
        r"/api/*": {
            "origins": ["http://localhost:3000", "http://localhost:5173", "http://localhost:5175"],
            "methods": ["GET", "POST", "PUT", "DELETE"],
            "allow_headers": ["Content-Type"]
        }
    })
    
    app.config['MONGO_URI'] = os.getenv('MONGO_URI')
    
    from app.routes import api
    app.register_blueprint(api, url_prefix='/api')
    
    @app.route('/')
    def index():
        return {'message': 'Livestream API Server', 'status': 'running'}
    
    return app

