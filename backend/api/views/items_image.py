# backend/api/views/items_image.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from ..supabase_client import supabase


def generate_signed_url(file_path: str, expires_in: int = 60 * 60):
    """バケットが private でも使える signed URL を生成"""
    res = supabase.storage.from_("item_image").create_signed_url(file_path, expires_in)
    if "signedURL" in res:
        return res["signedURL"]
    return None


@api_view(["GET"])
def item_image(request, item_id: int):
    """
    アイテム画像の signed URL を返す
    GET /api/items/<item_id>/image/
    """
    try:
        # 認証は Django 側では行わない
        # Supabase の RLS でアクセス制御する

        # アイテムの画像パス取得
        item_res = (
            supabase.table("items")
            .select("image_url")
            .eq("item_id", item_id)
            .single()
            .execute()
        )

        if not item_res.data:
            return Response({"error": "Item not found"}, status=404)

        image_url = item_res.data["image_url"]

        if not image_url:
            return Response({"url": None})

        # public URL → オブジェクトキーに変換
        if "/object/public/item_image/" in image_url:
            file_path = image_url.split("/object/public/item_image/")[-1]
        else:
            file_path = image_url

        # private bucket 用 signed URL 生成
        signed_url = generate_signed_url(file_path)

        return Response({"url": signed_url})

    except Exception as e:
        print("item_image error:", e)
        return Response({"error": "Server error"}, status=500)
