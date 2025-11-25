# backend/api/views/subcategories.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from ..supabase_client import supabase
import traceback

# ====================================================
# サブカテゴリー一覧取得
# ====================================================
@api_view(["GET"])
def subcategories_list(request):
    try:
        category = request.GET.get("category")

        query = supabase.table("subcategories").select("*")
        if category:
            query = query.eq("category", category)

        response = query.execute()

        return Response({"status": "success", "data": response.data})

    except Exception as e:
        print("subcategories_list error:", e)
        traceback.print_exc()
        return Response({"status": "error", "message": str(e)}, status=500)
