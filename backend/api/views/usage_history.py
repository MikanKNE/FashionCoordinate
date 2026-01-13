# backend/api/views/usage_history.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from datetime import datetime, timezone
from ..supabase_client import supabase
import traceback

# ==========================
# JWT → user_id 抽出共通処理
# ==========================
def get_user_id_from_request(request):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return None, Response(
            {"status": "error", "message": "Authorization header missing"},
            status=401
        )

    token = auth_header.split(" ")[1]
    user = supabase.auth.get_user(token)

    if not user or not user.user:
        return None, Response(
            {"status": "error", "message": "Invalid token"},
            status=401
        )

    return user.user.id, None


# =====================================================
# 使用履歴一覧 GET / POST
# =====================================================
@api_view(['GET', 'POST'])
def usage_list_create(request):
    user_id, error = get_user_id_from_request(request)
    if error:
        return error

    # -------------------------------------------
    # GET: 自分の items に紐づく usage_history 全部
    # -------------------------------------------
    if request.method == 'GET':
        try:
            response = (
                supabase
                .table("usage_history")
                .select("*, items!inner(*)")
                .eq("items.user_id", user_id)
                .execute()
            )

            return Response({"status": "success", "data": response.data})

        except Exception as e:
            print("usage_list_create GET エラー:", e)
            return Response(
                {"status": "error", "message": str(e)},
                status=500
            )

    # -------------------------------------------
    # POST: 使用履歴追加
    # -------------------------------------------
    elif request.method == 'POST':
        try:
            item_ids = request.data.get("item_ids")
            used_date = request.data.get("used_date")
            weather = request.data.get("weather")
            temperature = request.data.get("temperature")

            if not item_ids or not isinstance(item_ids, list):
                return Response(
                    {"status": "error", "message": "item_ids は配列で指定してください"},
                    status=400
                )

            # ---- item_id の所有チェック ----
            owned_items = (
                supabase
                .table("items")
                .select("item_id")
                .eq("user_id", user_id)
                .execute()
            )
            owned_ids = {item["item_id"] for item in owned_items.data}

            for item_id in item_ids:
                if item_id not in owned_ids:
                    return Response(
                        {
                            "status": "error",
                            "message": f"item_id {item_id} はこのユーザーのアイテムではありません"
                        },
                        status=403
                    )

            # ---- usage_history 登録 ----
            insert_rows = [
                {
                    "item_id": item_id,
                    "used_date": used_date,
                    "weather": weather,
                    "temperature": temperature
                }
                for item_id in item_ids
            ]

            inserted = (
                supabase
                .table("usage_history")
                .insert(insert_rows)
                .execute()
            )

            # ★ ここで status を触らない ★
            # → trigger が自動で active に戻す

            return Response(
                {"status": "success", "data": inserted.data}
            )

        except Exception as e:
            print("usage_list_create POST エラー:", e)
            traceback.print_exc()
            return Response(
                {"status": "error", "message": str(e)},
                status=500
            )

# =====================================================
# GET / PUT / DELETE
# =====================================================
@api_view(['GET', 'PUT', 'DELETE'])
def usage_detail(request, history_id):
    user_id, error = get_user_id_from_request(request)
    if error:
        return error

    try:
        # ---- history → item → user 権限チェック ----
        existing = (
            supabase
            .table("usage_history")
            .select("*, items!inner(*)")
            .eq("history_id", history_id)
            .eq("items.user_id", user_id)
            .execute()
        )

        if not existing.data:
            return Response(
                {"status": "error", "message": "Usage not found or no permission"},
                status=404
            )

        # ------------------ GET ------------------
        if request.method == 'GET':
            return Response({"status": "success", "data": existing.data[0]})

        # ------------------ PUT ------------------
        elif request.method == 'PUT':
            updated = (
                supabase
                .table("usage_history")
                .update(request.data)
                .eq("history_id", history_id)
                .execute()
            )

            return Response({"status": "success", "data": updated.data})

        # ------------------ DELETE ------------------
        elif request.method == 'DELETE':
            supabase.table("usage_history")\
                .delete()\
                .eq("history_id", history_id)\
                .execute()

            return Response(
                {"status": "success", "message": "Usage deleted"}
            )

    except Exception as e:
        print("usage_detail エラー:", e)
        traceback.print_exc()
        return Response(
            {"status": "error", "message": str(e)},
            status=500
        )


# =====================================================
# 日付で取得（JOIN + user_id チェック）
# =====================================================
@api_view(['GET'])
def usage_by_date(request, date_str):
    user_id, error = get_user_id_from_request(request)
    if error:
        return error

    try:
        response = (
            supabase
            .table("usage_history")
            .select("*, items!inner(*)")
            .eq("used_date", date_str)
            .eq("items.user_id", user_id)
            .execute()
        )

        return Response({"status": "success", "data": response.data})

    except Exception as e:
        print("usage_by_date エラー:", e)
        traceback.print_exc()
        return Response(
            {"status": "error", "message": str(e)},
            status=500
        )
