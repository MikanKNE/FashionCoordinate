# backend/api/views/items.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from ..supabase_client import supabase
import traceback

# ====================================================
# アイテム一覧取得 / 新規作成
# ====================================================
@api_view(['GET', 'POST'])
def items_list_create(request):
    try:
        # --- JWTから user_id を取得 ---
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return Response({"status": "error", "message": "Authorization header missing"}, status=401)
        token = auth_header.split(" ")[1]
        user = supabase.auth.get_user(token)
        if not user or not user.user:
            return Response({"status": "error", "message": "Invalid token"}, status=401)
        user_id = user.user.id

        # ---------------- GET ----------------
        if request.method == 'GET':
            response = supabase.table("items").select("*").eq("user_id", user_id).execute()
            return Response({"status": "success", "data": response.data})

        # ---------------- POST ----------------
        elif request.method == 'POST':
            data = request.data.copy()
            data.setdefault("last_used_date", None)
            data.setdefault("wear_count", 0)
            data["user_id"] = user_id  # ユーザーIDをセット

            inserted = supabase.table("items").insert(data).execute()
            return Response({"status": "success", "data": inserted.data})

    except Exception as e:
        print("items_list_create エラー:", e)
        traceback.print_exc()
        return Response({"status": "error", "message": str(e)}, status=500)


# ====================================================
# アイテム取得 / 更新 / 削除
# ====================================================
@api_view(['GET', 'PUT', 'DELETE'])
def item_detail(request, item_id):
    try:
        # JWTでユーザー取得
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return Response({"status": "error", "message": "Authorization header missing"}, status=401)
        token = auth_header.split(" ")[1]
        user = supabase.auth.get_user(token)
        if not user or not user.user:
            return Response({"status": "error", "message": "Invalid token"}, status=401)
        user_id = user.user.id

        existing = supabase.table("items").select("*").eq("item_id", item_id).eq("user_id", user_id).execute()
        if not existing.data:
            return Response({"status": "error", "message": "Item not found"}, status=404)

        if request.method == 'GET':
            return Response({"status": "success", "data": existing.data[0]})

        elif request.method == 'PUT':
            data = request.data
            updated = supabase.table("items").update(data).eq("item_id", item_id).eq("user_id", user_id).execute()
            return Response({"status": "success", "data": updated.data})

        elif request.method == 'DELETE':
            supabase.table("items").delete().eq("item_id", item_id).eq("user_id", user_id).execute()
            return Response({"status": "success", "message": "Item deleted"})

    except Exception as e:
        print("item_detail エラー:", e)
        traceback.print_exc()
        return Response({"status": "error", "message": str(e)}, status=500)
