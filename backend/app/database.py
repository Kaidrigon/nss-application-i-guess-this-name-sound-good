# here we are going to store the db connection and the represents the collections (bassically a seprate folder in the db kind of) in variable form for easy access.
from pymongo import AsyncMongoClient

from app.config import MONGODB_URL, DATABASE_NAME


client = AsyncMongoClient(MONGODB_URL)
db = client[DATABASE_NAME]

users_collection = db["users"] #like here we are creating a variable called users_collection and assigning it to the users collection in the db so that we can easily access it in other files without having to write db["users"] every time.
events_collection = db["events"]
registrations_collection = db["registrations"]
attendance_collection = db["attendance"]