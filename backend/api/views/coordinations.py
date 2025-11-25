# frontend/api/views/coordinations.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from ..supabase_client import supabase
import traceback

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
# コーディネーション一覧取得 / 新規作成（items 付き）
# ====================================================
@api_view(['GET', 'POST'])
def coordinations_list_create(request):
    user_id, err_response = get_user_id_from_request(request)
    if err_response:
        return err_response

    if request.method == 'GET':
        try:
            # coordinations + coordination_items + items をネストして取得
            response = supabase.table("coordinations").select("""
                coordination_id,
                name,
                is_favorite,
                coordination_items (
                    item_id,
                    items (
                        item_id,
                        name,
                        image_url
                    )
                )
            """).eq("user_id", user_id).order("coordination_id", desc=True).execute()

            data = response.data

            # フロント用に整形
            coordinations = []
            for c in data:
                items = []
                for ci in c.get("coordination_items", []):
                    if ci.get("items"):
                        items.append(ci["items"])

                coordinations.append({
                    "id": c["coordination_id"],
                    "name": c["name"],
                    "is_favorite": c.get("is_favorite", False),
                    "items": items,
                })

            return Response({"status": "success", "data": coordinations})

        except Exception as e:
            print("GET /coordinations エラー:", e)
            traceback.print_exc()
            return Response({"status": "error", "message": str(e)}, status=500)

# ====================================================
# コーディネーション取得・更新・削除（items は別API）
# ====================================================
@api_view(['GET', 'PUT', 'DELETE'])
def coordination_detail(request, coordination_id):
    user_id, err_response = get_user_id_from_request(request)
    if err_response:
        return err_response

    try:
        existing = supabase.table("coordinations").select("*").eq("coordination_id", coordination_id).eq("user_id", user_id).execute()
        if not existing.data:
            return Response({"status": "error", "message": "Coordination not found"}, status=404)

        if request.method == 'GET':
            return Response({"status": "success", "data": existing.data[0]})

        elif request.method == 'PUT':
            data = request.data
            response = supabase.table("coordinations").update(data).eq("coordination_id", coordination_id).eq("user_id", user_id).execute()
            return Response({"status": "success", "data": response.data})

        elif request.method == 'DELETE':
            supabase.table("coordinations").delete().eq("coordination_id", coordination_id).eq("user_id", user_id).execute()
            return Response({"status": "success", "message": "Coordination deleted"})

    except Exception as e:
        print("coordination_detail エラー:", e)
        traceback.print_exc()
        return Response({"status": "error", "message": str(e)}, status=500)
