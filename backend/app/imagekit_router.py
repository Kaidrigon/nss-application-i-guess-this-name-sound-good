from fastapi import APIRouter, Depends

from app.auth.dependencies import get_current_user
from app.imagekit import imagekit
from app.config import IMAGEKIT_PUBLIC_KEY


router = APIRouter(
    prefix="/imagekit",
    tags=["ImageKit"],
)


# =========================================================
# GET IMAGEKIT UPLOAD AUTHENTICATION
# =========================================================

@router.get("/auth")
async def get_imagekit_auth(
    current_user=Depends(get_current_user),
):
    """
    Generate secure ImageKit upload authentication
    parameters for the frontend.
    """

    authentication_parameters = (
        imagekit.helper.get_authentication_parameters()
    )

    return {
        "token": authentication_parameters["token"],
        "expire": authentication_parameters["expire"],
        "signature": authentication_parameters["signature"],
        "publicKey": IMAGEKIT_PUBLIC_KEY,
    }