# backend/api/views/test_upload.py
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from ..supabase_client import supabase
import uuid

BUCKET = "item_image"
SIGNED_URL_EXP = 60 * 60  # 1時間

def get_signed_url(path: str):
    try:
        res = supabase.storage.from_(BUCKET).create_signed_url(path, SIGNED_URL_EXP)
        return res.get("signedURL") or res.get("signed_url") or None
    except:
        return None

@api_view(["POST"])
@parser_classes([MultiPartParser, FormParser])
def test_upload(request):
    try:
        image_file = request.FILES.get("image")
        if not image_file:
            return Response({"status": "error", "message": "画像ファイルが必要です"}, status=400)

        # ファイル名生成
        ext = image_file.name.split(".")[-1]
        filename = f"{uuid.uuid4()}.{ext}"
        path = f"test_upload/{filename}"

        # InMemoryUploadedFile を直接渡す
        supabase.storage.from_(BUCKET).upload(path, image_file.read(), file_options={"content-type": image_file.content_type})

        url = get_signed_url(path)
        return Response({"status": "success", "url": url})
    except Exception as e:
        return Response({"status": "error", "message": str(e)}, status=500)
