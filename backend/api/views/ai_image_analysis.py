# backend/api/views/ai_image_analysis.py
from rest_framework.views import APIView
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status


@api_view(["POST"])
def ai_image_analysis_preview(request):
    """
    画像アップロード受付 + AI解析結果（ダミー）
    confidence は保持するが、使用可否の判断は行わない
    """

    if "file" not in request.FILES:
        return Response(
            {"status": "error", "message": "file is required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    file = request.FILES["file"]

    # --- 本来はここで AI 推論 ---
    # raw_ai_result = analyze_image(file)

    # --- 仮の AI 生結果 ---
    raw_ai_result = {
        "category": "tops",
        "subcategory": "tops",
        "color": "green",
        "material": "polyester",
        "pattern": "solid",
        "confidence": {
            "category": 0.155,
            "subcategory": 0.155,
            "color": 0.107,
            "material": 0.147,
            "pattern": 0.173,
        }
    }

    return Response({
        "status": "success",
        "preview": {
            "filename": file.name,
            "content_type": file.content_type,
            "size": file.size,
        },
        "result": {
            "category": raw_ai_result["category"],
            "subcategory": raw_ai_result["subcategory"],
            "color": raw_ai_result["color"],
            "material": raw_ai_result["material"],
            "pattern": raw_ai_result["pattern"],
            "confidence": raw_ai_result["confidence"],
            # 判断には使わないが、将来 UI 用に保持
            "auto_filled": {
                "category": True,
                "subcategory": True,
                "color": True,
                "material": True,
                "pattern": True,
            }
        }
    })
