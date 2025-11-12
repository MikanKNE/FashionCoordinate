from rest_framework.decorators import api_view
from rest_framework.response import Response
from ..supabase_client import supabase
from ..decorators import require_user_id
import traceback

# ----------------------------
# アイテム一覧取得 / 新規作成
# ----------------------------
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


# ----------------------------
# アイテム取得 / 更新 / 削除
# ----------------------------
@api_view(['GET', 'PUT', 'DELETE'])
@require_user_id
def item_detail(request, item_id, user_id):
    try:
        existing = supabase.table("items").select("*").eq("item_id", item_id).eq("user_id", user_id).execute()
        if not existing.data:
            return Response({"status": "error", "message": "アイテムが見つかりません"}, status=404)

        if request.method == 'GET':
            return Response({"status": "success", "data": existing.data[0]})

        elif request.method == 'PUT':
            data = request.data
            try:
                response = supabase.table("items").update(data).eq("item_id", item_id).eq("user_id", user_id).execute()
                return Response({"status": "success", "data": response.data})
            except Exception as e:
                print("PUT /items エラー:", e)
                traceback.print_exc()
                return Response({"status": "error", "message": "アイテムの更新に失敗しました"}, status=500)

        elif request.method == 'DELETE':
            try:
                supabase.table("items").delete().eq("item_id", item_id).eq("user_id", user_id).execute()
                return Response({"status": "success", "message": "アイテムを削除しました"})
            except Exception as e:
                print("DELETE /items エラー:", e)
                traceback.print_exc()
                return Response({"status": "error", "message": "アイテムの削除に失敗しました"}, status=500)

    except Exception as e:
        print("item_detail 全体エラー:", e)
        traceback.print_exc()
        return Response({"status": "error", "message": "アイテム取得時にエラーが発生しました"}, status=500)
