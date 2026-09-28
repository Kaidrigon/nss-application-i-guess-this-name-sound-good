# here we are going to hold all configuration loaded from .env that includes db connection url, jwt secrets, and other config.
import os
from dotenv import load_dotenv

load_dotenv() #this helps us to load the .env file and read its values 

MONGODB_URL = os.getenv("MONGODB_URL") 
DATABASE_NAME = os.getenv("DATABASE_NAME", "nss")

JWT_SECRET = os.getenv("JWT_SECRET")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ADMIN_SETUP_KEY = os.getenv("ADMIN_SETUP_KEY")
JWT_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", "60")) #this all configs like algo and expire time are also in the env file only the mongo url and jwt secret are in env that are not put in here.