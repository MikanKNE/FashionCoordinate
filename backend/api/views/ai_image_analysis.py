# backend/api/views/ai_image_analysis.py
import requests
from django.conf import settings
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status


# ============================================================
# AI → アプリ用 カテゴリ変換マップ
# ============================================================

CATEGORY_MAP = {
    "tops": {"category": "服", "subcategory_name": "トップス"},
    "bottoms": {"category": "服", "subcategory_name": "ボトムス"},
    "outerwear": {"category": "服", "subcategory_name": "アウター"},
    "onepiece": {"category": "服", "subcategory_name": "ワンピース"},
    "shoes": {"category": "靴", "subcategory_name": None},
    "bag": {"category": "バッグ", "subcategory_name": None},
    "accessory": {"category": "アクセサリー", "subcategory_name": None},
}

BOTTOM_TYPE_MAP = {
    "pants": "ボトムス",
    "jeans": "ボトムス",
    "skirt": "ボトムス",
    "shorts": "ボトムス",
}

COLOR_MAP = {
    "black": "黒",
    "white": "白",
    "gray": "グレー",
    "beige": "ベージュ",
    "brown": "茶",
    "navy": "ネイビー",
    "blue": "青",
    "green": "緑",
    "red": "赤",
    "yellow": "黄色",
}

MATERIAL_MAP = {
    "cotton": "綿",
    "denim": "デニム",
    "polyester": "ポリエステル",
    "wool": "ウール",
    "leather": "レザー",
    "linen": "リネン",
    "knit": "ニット",
}

PATTERN_MAP = {
    "solid": "無地",
    "striped": "ストライプ",
    "checked": "チェック",
    "floral": "花柄",
    "printed": "プリント",
    "denim_texture": "デニム",
}


# ============================================================
# AI 生レスポンス → フロント用変換
# ============================================================

def convert_ai_result(raw: dict) -> dict:
    ai_category = raw.get("category")
    category_info = CATEGORY_MAP.get(ai_category, {})

    subcategory_name = category_info.get("subcategory_name")

    if ai_category == "bottoms":
        bottom_type = raw.get("bottom_type")
        if bottom_type:
            subcategory_name = BOTTOM_TYPE_MAP.get(bottom_type, subcategory_name)

    return {
        "category": category_info.get("category"),
        "subcategory_name": subcategory_name,
        "color": COLOR_MAP.get(raw.get("color")),
        "material": MATERIAL_MAP.get(raw.get("material")),
        "pattern": PATTERN_MAP.get(raw.get("pattern")),
        "confidence": {
            "category": raw.get("category_confidence"),
            "color": raw.get("color_confidence"),
            "material": raw.get("material_confidence"),
            "pattern": raw.get("pattern_confidence"),
        },
    }


# ============================================================
# View
# ============================================================

@api_view(["POST"])
def ai_image_analysis_preview(request):
    if "file" not in request.FILES:
        return Response(
            {"status": "error", "message": "file is required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    api_url = settings.AI_IMAGE_ANALYSIS_API_URL
    timeout = settings.AI_IMAGE_ANALYSIS_TIMEOUT

    if not api_url:
        return Response(
            {"status": "error", "message": "AI API URL is not configured"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    image_file = request.FILES["file"]

    try:
        response = requests.post(
            f"{api_url}/predict",
            files={
                "file": (
                    image_file.name,
                    image_file.read(),
                    image_file.content_type,
                )
            },
            timeout=timeout,
        )
        response.raise_for_status()
        raw_ai_result = response.json()

    except requests.Timeout:
        return Response(
            {"status": "error", "message": "AI API timeout"},
            status=status.HTTP_504_GATEWAY_TIMEOUT,
        )

    except requests.RequestException as e:
        return Response(
            {
                "status": "error",
                "message": "AI API request failed",
                "detail": str(e),
            },
            status=status.HTTP_502_BAD_GATEWAY,
        )

    except ValueError:
        return Response(
            {"status": "error", "message": "Invalid AI API response"},
            status=status.HTTP_502_BAD_GATEWAY,
        )

    converted = convert_ai_result(raw_ai_result)

    return Response(
        {
            "status": "success",
            "ai_raw": raw_ai_result,
            "result": converted,
        }
    )
