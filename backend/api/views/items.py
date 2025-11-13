from rest_framework.decorators import api_view
from rest_framework.response import Response
from ..supabase_client import supabase
from ..common.decorators import require_user_id
import traceback

@api_view(['GET', 'POST'])
@require_user_id
def items_list_create(request, user_id):
    if request.method == 'GET':
        try:
            response = supabase.table("items").select("*").eq("user_id", user_id).execute()
            return Response({"status": "success", "data": response.data})
        except Exception as e:
            print("GET /items エラー:", e)
            traceback.print_exc()
            return Response({"status": "error", "message": "アイテム一覧の取得に失敗しました"}, status=500)

    elif request.method == 'POST':
        data = request.data
        data["user_id"] = user_id
        data.setdefault("last_used_date", None)
        data.setdefault("wear_count", 0)
        try:
            response = supabase.table("items").insert(data).execute()
            return Response({"status": "success", "data": response.data})
        except Exception as e:
            print("POST /items エラー:", e)
            traceback.print_exc()
            return Response({"status": "error", "message": "アイテムの作成に失敗しました"}, status=500)
