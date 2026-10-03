# here we are going to hold all configuration loaded from .env that includes db connection url, jwt secrets, and other config.
import os

from dotenv import load_dotenv


load_dotenv()


# ---------------------------------------------------------
# DATABASE
# ---------------------------------------------------------

MONGODB_URL = os.getenv("MONGODB_URL")

DATABASE_NAME = os.getenv(
    "DATABASE_NAME",
    "nss",
)


# ---------------------------------------------------------
# JWT
# ---------------------------------------------------------

JWT_SECRET = os.getenv("JWT_SECRET")

JWT_ALGORITHM = os.getenv(
    "JWT_ALGORITHM",
    "HS256",
)

JWT_EXPIRE_MINUTES = int(
    os.getenv(
        "JWT_EXPIRE_MINUTES",
        "60",
    )
)


# ---------------------------------------------------------
# ADMIN SETUP
# ---------------------------------------------------------

ADMIN_SETUP_KEY = os.getenv(
    "ADMIN_SETUP_KEY"
)


# ---------------------------------------------------------
# IMAGEKIT
# ---------------------------------------------------------

IMAGEKIT_PRIVATE_KEY = os.getenv(
    "IMAGEKIT_PRIVATE_KEY"
)

IMAGEKIT_PUBLIC_KEY = os.getenv(
    "IMAGEKIT_PUBLIC_KEY"
)

IMAGEKIT_URL_ENDPOINT = os.getenv(
    "IMAGEKIT_URL_ENDPOINT"
)