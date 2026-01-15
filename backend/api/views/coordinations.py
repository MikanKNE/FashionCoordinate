# frontend/api/views/coordinations.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from ..supabase_client import supabase
import traceback

# ==========================
# JWT → user_id 抽出共通処理
# ==========================
def get_user_id_from_request(request):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return None, Response({"status": "error", "message": "Authorization header missing"}, status=401)

    token = auth_header.split(" ")[1]
    user = supabase.auth.get_user(token)
    if not user or not user.user:
        return None, Response({"status": "error", "message": "Invalid token"}, status=401)

    return user.user.id, None

# ====================================================
# コーディネート一覧取得 / 新規作成（items 付き）
# ====================================================
@api_view(['GET', 'POST'])
def coordinations_list_create(request):
    user_id, err_response = get_user_id_from_request(request)
    if err_response:
        return err_response

    if request.method == 'GET':
        try:
            # ユーザーごとのコーディネートのみ取得
            response = supabase.table("coordinations").select("*").eq("user_id", user_id).execute()
            return Response({"status": "success", "data": response.data})
        except Exception as e:
            print("GET /coordinations エラー:", e)
            traceback.print_exc()
            return Response({"status": "error", "message": str(e)}, status=500)

    elif request.method == 'POST':
        data = request.data.copy()
        data.setdefault("is_favorite", False)
        items = data.pop("items", [])

        if not isinstance(items, list):
            return Response({"status": "error", "message": "items は配列である必要がある"}, status=400)

        try:
            data["user_id"] = user_id  # ユーザーIDをセット
            inserted = supabase.table("coordinations").insert(data).execute()
            if not inserted.data:
                return Response({"status": "error", "message": "Failed to create coordination"}, status=500)

            coordination_id = inserted.data[0]["coordination_id"]

            if items:
                link_rows = [{"coordination_id": coordination_id, "item_id": item_id} for item_id in items]
                supabase.table("coordination_items").insert(link_rows).execute()

            return Response({"status": "success", "coordination_id": coordination_id, "data": inserted.data})

        except Exception as e:
            print("POST /coordinations エラー:", e)
            traceback.print_exc()
            return Response({"status": "error", "message": str(e)}, status=500)

# ====================================================
# コーディネート取得・更新・削除（items は別API）
# ====================================================
@api_view(['GET', 'PUT', 'DELETE'])
def coordination_detail(request, coordination_id):
    user_id, err_response = get_user_id_from_request(request)
    if err_response:
        return err_response
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        return Response({"status": "error"}, 401)

    try:
        existing = supabase.table("coordinations").select("*").eq("coordination_id", coordination_id).eq("user_id", user_id).execute()
        if not existing.data:
            return Response({"status": "error", "message": "Coordination not found"}, status=404)

        if request.method == 'GET':
            return Response({"status": "success", "data": existing.data[0]})

        elif request.method == 'PUT':
            data = request.data
            data.pop("items", None)
            response = supabase.table("coordinations").update(data).eq("coordination_id", coordination_id).eq("user_id", user_id).execute()
            return Response({"status": "success", "data": response.data})

        elif request.method == 'DELETE':
            supabase.table("coordinations").delete().eq("coordination_id", coordination_id).eq("user_id", user_id).execute()
            return Response({"status": "success", "message": "Coordination deleted"})

    except Exception as e:
        print("coordination_detail エラー:", e)
        traceback.print_exc()
        return Response({"status": "error", "message": str(e)}, status=500)
