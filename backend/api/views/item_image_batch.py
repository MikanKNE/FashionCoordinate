# backend/api/views/item_image_batch.py

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from ..supabase_client import supabase

def generate_signed_url(file_path: str, expires_in: int = 60 * 60):
    try:
        res = supabase.storage.from_("item_image").create_signed_url(
            file_path, expires_in
        )
        return res.get("signedURL")
    except Exception as e:
        print("signed url error:", e)
        return None


@api_view(["POST"])
def item_image_batch(request):
    """
    複数 item_id の signed URL を一括で返す
    POST /api/items/images/
    """
    item_ids = request.data.get("item_ids")

    if not isinstance(item_ids, list):
        return Response(
            {"error": "item_ids must be a list"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if len(item_ids) == 0:
        return Response({})

    try:
        # items をまとめて取得
        res = (
            supabase.table("items")
            .select("item_id,image_url")
            .in_("item_id", item_ids)
            .execute()
        )

        items = res.data or []
        result: dict[str, str | None] = {}

        for item in items:
            item_id = item["item_id"]
            image_url = item.get("image_url")

            if not image_url:
                result[str(item_id)] = None
                continue

            # public URL → file_path
            if "/object/public/item_image/" in image_url:
                file_path = image_url.split(
                    "/object/public/item_image/"
                )[-1]
            else:
                file_path = image_url

            signed = generate_signed_url(file_path)
            result[str(item_id)] = signed

        # DB に存在しなかった item_id も null で埋める
        for iid in item_ids:
            if str(iid) not in result:
                result[str(iid)] = None

        return Response(result)

    except Exception as e:
        print("item_image_batch error:", e)
        return Response({}, status=status.HTTP_200_OK)
