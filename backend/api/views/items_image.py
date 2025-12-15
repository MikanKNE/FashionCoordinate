# backend/api/views/items_image.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from ..supabase_client import supabase
import logging

logger = logging.getLogger(__name__)

def generate_signed_url(file_path: str, expires_in: int = 60 * 60):
    try:
        res = supabase.storage.from_("item_image").create_signed_url(
            file_path, expires_in
        )
        return res.get("signedURL")
    except Exception as e:
        logger.warning(f"signed url generate failed: {e}")
        return None


@api_view(["GET"])
def item_image(request, item_id: int):
    """
    GET /api/items/<item_id>/image/
    """
    # ❶ image_url 取得
    try:
        item_res = (
            supabase.table("items")
            .select("image_url")
            .eq("item_id", item_id)
            .maybe_single()   # ← ★ single() ではなく
            .execute()
        )
    except Exception as e:
        logger.warning(f"item fetch failed: {e}")
        return Response({"url": None})

    if not item_res or not item_res.data:
        return Response({"url": None})

    image_url = item_res.data.get("image_url")
    if not image_url:
        return Response({"url": None})

    # ❷ file_path 解決
    if "/object/public/item_image/" in image_url:
        file_path = image_url.split("/object/public/item_image/")[-1]
    else:
        file_path = image_url

    # ❸ signed URL 生成
    signed_url = generate_signed_url(file_path)

    return Response({"url": signed_url})
