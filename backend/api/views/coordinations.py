# frontend/api/views/coordinations.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from ..supabase_client import supabase
import traceback

# ====================================================
# コーディネーション一覧取得 / 新規作成（items 付き）
# ====================================================
@api_view(['GET', 'POST'])
def coordinations_list_create(request):
    # ---------------- GET：一覧 ----------------
    if request.method == 'GET':
        try:
            response = supabase.table("coordinations").select("*").execute()
            return Response({"status": "success", "data": response.data})
        except Exception as e:
            print("GET /coordinations エラー:", e)
            traceback.print_exc()
            return Response({"status": "error", "message": str(e)}, status=500)

    # ---------------- POST：新規登録（items入り） ----------------
    elif request.method == 'POST':
        data = request.data.copy()

        # is_favorite のデフォルト値
        data.setdefault("is_favorite", False)

        # items の取得（例： [1,2,3]）
        items = data.pop("items", [])

        if not isinstance(items, list):
            return Response({"status": "error", "message": "items は配列である必要がある"}, status=400)

        try:
            print("POSTデータ:", data)

            # --- JWTから user_id を取得してセット ---
            auth_header = request.headers.get("Authorization")
            if not auth_header or not auth_header.startswith("Bearer "):
                return Response({"status": "error", "message": "Authorization header missing"}, status=401)

            token = auth_header.split(" ")[1]

            # v2 対応：apiは不要、get_user を直接呼び出す
            user = supabase.auth.get_user(token)
            if not user or not user.user:
                return Response({"status": "error", "message": "Invalid token"}, status=401)

            data["user_id"] = user.user.id  # UUID をセット

            # --- 1. coordinations テーブルへ登録 ---
            inserted = supabase.table("coordinations").insert(data).execute()

            if not inserted.data:
                return Response({"status": "error", "message": "Failed to create coordination"}, status=500)

            coordination_id = inserted.data[0]["coordination_id"]

            # --- 2. coordination_items にまとめて登録 ---
            if len(items) > 0:
                link_rows = [{"coordination_id": coordination_id, "item_id": item_id} for item_id in items]
                supabase.table("coordination_items").insert(link_rows).execute()

            return Response({
                "status": "success",
                "coordination_id": coordination_id,
                "data": inserted.data
            })

        except Exception as e:
            print("POST /coordinations エラー:", e)
            traceback.print_exc()
            return Response({"status": "error", "message": str(e)}, status=500)


# ====================================================
# コーディネーション取得・更新・削除（items は別API）
# ====================================================
@api_view(['GET', 'PUT', 'DELETE'])
def coordination_detail(request, coordination_id):
    try:
        print(f"coordination_id={coordination_id}, method={request.method}")

        existing = supabase.table("coordinations").select("*").eq("coordination_id", coordination_id).execute()
        if not existing.data:
            return Response({"status": "error", "message": "Coordination not found"}, status=404)

        # -------- GET --------
        if request.method == 'GET':
            return Response({"status": "success", "data": existing.data[0]})

        # -------- PUT --------
        elif request.method == 'PUT':
            data = request.data
            print("PUTデータ:", data)
            response = supabase.table("coordinations").update(data).eq("coordination_id", coordination_id).execute()
            return Response({"status": "success", "data": response.data})

        # -------- DELETE --------
        elif request.method == 'DELETE':
            supabase.table("coordinations").delete().eq("coordination_id", coordination_id).execute()
            return Response({"status": "success", "message": "Coordination deleted"})

    except Exception as e:
        print("coordination_detail エラー:", e)
        traceback.print_exc()
        return Response({"status": "error", "message": str(e)}, status=500)
