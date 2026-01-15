from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(["POST"])
def image_analysis_preview(request):
    if "file" not in request.FILES:
        return Response(
            {"status": "error", "message": "file is required"},
            status=400
        )

    file = request.FILES["file"]

    return Response({
        "status": "success",
        "preview": {
            "filename": file.name,
            "content_type": file.content_type,
            "size": file.size,
        },
        "dummy_result": {
            "category": "服",
            "subcategory": "トップス",
            "color": "黒",
            "pattern": "無地",
            "material": "綿"
        }
    })
