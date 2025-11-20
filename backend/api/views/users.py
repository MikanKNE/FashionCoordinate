# backend/api/views/users.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from ..supabase_client import supabase


# ====================================================
# ユーザ一覧取得 / 新規作成
# ====================================================
@api_view(['GET', 'POST'])
def users_list_create(request):
    if request.method == 'GET':
        try:
            response = supabase.table("users").select("*").execute()
            return Response({"status": "success", "data": response.data})
        except Exception as e:
            return Response({"status": "error", "message": str(e)}, status=500)

    elif request.method == 'POST':
        data = request.data

        try:
            response = supabase.table("users").insert(data).execute()
            return Response({"status": "success", "data": response.data})
        except Exception as e:
            return Response({"status": "error", "message": str(e)}, status=500)


# ====================================================
# ユーザ取得 / 更新 / 削除
# ====================================================
@api_view(['GET', 'PUT', 'DELETE'])
def user_detail(request, user_id):
    try:
        existing = supabase.table("users").select("*").eq("user_id", user_id).execute()
        if not existing.data:
            return Response({"status": "error", "message": "User not found"}, status=404)

        if request.method == 'GET':
            return Response({"status": "success", "data": existing.data[0]})

        elif request.method == 'PUT':
            data = request.data
            response = supabase.table("users").update(data).eq("user_id", user_id).execute()
            return Response({"status": "success", "data": response.data})

        elif request.method == 'DELETE':
            supabase.table("users").delete().eq("user_id", user_id).execute()
            return Response({"status": "success", "message": "User deleted"})

    except Exception as e:
        return Response({"status": "error", "message": str(e)}, status=500)
