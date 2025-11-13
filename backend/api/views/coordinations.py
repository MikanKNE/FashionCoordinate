from rest_framework.decorators import api_view
from rest_framework.response import Response
from ..supabase_client import supabase
from ..common.decorators import require_user_id
from ..common.utils import get_user_id_from_token
import traceback

# ----------------------------
# コーディネーション一覧取得 / 新規作成
# ----------------------------
@api_view(['GET', 'POST'])
@require_user_id
def coordinations_list_create(request, user_id):
    if request.method == 'GET':
        try:
            response = supabase.table("coordinations").select("*").eq("user_id", user_id).execute()
            return Response({"status": "success", "data": response.data})
        except Exception as e:
            print("GET /coordinations エラー:", e)
            traceback.print_exc()
            return Response({"status": "error", "message": "コーディネーション一覧の取得に失敗しました"}, status=500)

    elif request.method == 'POST':
        data = request.data
        data["user_id"] = user_id
        data.setdefault("is_favorite", False)
        try:
            response = supabase.table("coordinations").insert(data).execute()
            return Response({"status": "success", "data": response.data})
        except Exception as e:
            print("POST /coordinations エラー:", e)
            traceback.print_exc()
            return Response({"status": "error", "message": "コーディネーションの作成に失敗しました"}, status=500)


# ----------------------------
# コーディネーション取得 / 更新 / 削除
# ----------------------------
@api_view(['GET', 'PUT', 'DELETE'])
@require_user_id
def coordination_detail(request, coordination_id, user_id):
    try:
        existing = supabase.table("coordinations").select("*").eq("coordination_id", coordination_id).eq("user_id", user_id).execute()

        if not existing.data:
            return Response({"status": "error", "message": "コーディネーションが見つかりません"}, status=404)

        if request.method == 'GET':
            return Response({"status": "success", "data": existing.data[0]})

        elif request.method == 'PUT':
            data = request.data
            try:
                response = supabase.table("coordinations").update(data).eq("coordination_id", coordination_id).eq("user_id", user_id).execute()
                return Response({"status": "success", "data": response.data})
            except Exception as e:
                print("PUT /coordinations エラー:", e)
                traceback.print_exc()
                return Response({"status": "error", "message": "コーディネーションの更新に失敗しました"}, status=500)

        elif request.method == 'DELETE':
            try:
                supabase.table("coordinations").delete().eq("coordination_id", coordination_id).eq("user_id", user_id).execute()
                return Response({"status": "success", "message": "コーディネーションを削除しました"})
            except Exception as e:
                print("DELETE /coordinations エラー:", e)
                traceback.print_exc()
                return Response({"status": "error", "message": "コーディネーションの削除に失敗しました"}, status=500)

    except Exception as e:
        print("coordination_detail 全体エラー:", e)
        traceback.print_exc()
        return Response({"status": "error", "message": "コーディネーション取得時にエラーが発生しました"}, status=500)
