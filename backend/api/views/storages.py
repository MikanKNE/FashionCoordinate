# backend/api/views/storages.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from ..supabase_client import supabase
import traceback

def get_user_id_from_request(request):
    """他ファイルと同じ user_id 取得ロジック"""
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return None, Response({"status": "error", "message": "Authorization header missing"}, status=401)

    token = auth_header.split(" ")[1]
    user = supabase.auth.get_user(token)
    if not user or not user.user:
        return None, Response({"status": "error", "message": "Invalid token"}, status=401)

    return user.user.id, None


# ----------------------------------------------------
# 収納場所（storages）一覧取得 / 新規作成
# ----------------------------------------------------
@api_view(['GET', 'POST'])
def storages_list_create(request):
    user_id, err = get_user_id_from_request(request)
    if err:
        return err

    try:
        if request.method == 'GET':
            response = supabase.table("storages").select("*").eq("user_id", user_id).execute()
            return Response({"status": "success", "data": response.data})

        elif request.method == 'POST':
            data = request.data.copy()
            data["user_id"] = user_id

            if "storage_location" not in data:
                return Response({"status": "error", "message": "storage_location が必要"}, status=400)

            inserted = supabase.table("storages").insert(data).execute()
            return Response({"status": "success", "data": inserted.data})

    except Exception as e:
        print("storages_list_create error:", e)
        traceback.print_exc()
        return Response({"status": "error", "message": str(e)}, status=500)


# ----------------------------------------------------
# 単体取得 / 更新 / 削除
# ----------------------------------------------------
@api_view(['GET', 'PUT', 'DELETE'])
def storage_detail(request, storage_id):
    user_id, err = get_user_id_from_request(request)
    if err:
        return err

    try:
        # 自分の storage のみ取得
        existing = (
            supabase.table("storages")
            .select("*")
            .eq("storage_id", storage_id)
            .eq("user_id", user_id)
            .execute()
        )

        if not existing.data:
            return Response({"status": "error", "message": "Storage not found"}, status=404)

        if request.method == 'GET':
            return Response({"status": "success", "data": existing.data[0]})

        elif request.method == 'PUT':
            data = request.data
            updated = (
                supabase.table("storages")
                .update(data)
                .eq("storage_id", storage_id)
                .eq("user_id", user_id)
                .execute()
            )
            return Response({"status": "success", "data": updated.data})

        elif request.method == 'DELETE':
            supabase.table("storages") \
                .delete() \
                .eq("storage_id", storage_id) \
                .eq("user_id", user_id) \
                .execute()
            return Response({"status": "success", "message": "Storage deleted"})

    except Exception as e:
        print("storage_detail error:", e)
        traceback.print_exc()
        return Response({"status": "error", "message": str(e)}, status=500)
