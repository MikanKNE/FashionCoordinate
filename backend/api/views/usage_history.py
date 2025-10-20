
from rest_framework.decorators import api_view
from rest_framework.response import Response
from ..supabase_client import supabase

# ----------------------------
# 使用履歴一覧取得 / 登録
# ----------------------------
@api_view(['GET', 'POST'])
def usage_list_create(request):
    if request.method == 'GET':
        try:
            response = supabase.table("usage_history").select("*").execute()
            return Response({"status": "success", "data": response.data})
        except Exception as e:
            return Response({"status": "error", "message": str(e)}, status=500)

    elif request.method == 'POST':
        data = request.data
        try:
            response = supabase.table("usage_history").insert(data).execute()
            return Response({"status": "success", "data": response.data})
        except Exception as e:
            return Response({"status": "error", "message": str(e)}, status=500)

# ----------------------------
# 使用履歴取得 / 更新 / 削除
# ----------------------------
@api_view(['GET', 'PUT', 'DELETE'])
def usage_detail(request, history_id):
    try:
        existing = supabase.table("usage_history").select("*").eq("history_id", history_id).execute()
        if not existing.data:
            return Response({"status": "error", "message": "Usage not found"}, status=404)

        if request.method == 'GET':
            return Response({"status": "success", "data": existing.data[0]})

        elif request.method == 'PUT':
            data = request.data
            response = supabase.table("usage_history").update(data).eq("history_id", history_id).execute()
            return Response({"status": "success", "data": response.data})

        elif request.method == 'DELETE':
            supabase.table("usage_history").delete().eq("history_id", history_id).execute()
            return Response({"status": "success", "message": "Usage deleted"})

    except Exception as e:
        return Response({"status": "error", "message": str(e)}, status=500)