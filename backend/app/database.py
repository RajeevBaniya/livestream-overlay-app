from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
import os

def get_database():
    mongo_uri = os.getenv('MONGO_URI')
    
    if not mongo_uri:
        raise ValueError('MONGO_URI not found in environment variables')
    
    try:
        client = MongoClient(mongo_uri)
        client.admin.command('ping')
        print('MongoDB connected successfully')
        
        db = client['livestream']
        return db
        
    except ConnectionFailure as e:
        print(f' MongoDB connection failed: {e}')
        raise

def get_overlays_collection():
    db = get_database()
    return db['overlays']

