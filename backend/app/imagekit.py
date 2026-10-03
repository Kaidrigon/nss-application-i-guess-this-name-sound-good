from imagekitio import ImageKit

from app.config import (
    IMAGEKIT_PRIVATE_KEY,
)


# ---------------------------------------------------------
# IMAGEKIT CLIENT
# ---------------------------------------------------------

imagekit = ImageKit(
    private_key=IMAGEKIT_PRIVATE_KEY,
)