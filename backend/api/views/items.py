
from rest_framework.decorators import api_view
from rest_framework.response import Response
from ..supabase_client import supabase

# ----------------------------
# アイテム一覧取得 / 新規作成
# ----------------------------
@api_view(['GET', 'POST'])
def items_list_create(request):
    if request.method == 'GET':
        try:
            response = supabase.table("items").select("*").execute()
            return Response({"status": "success", "data": response.data})
        except Exception as e:
            return Response({"status": "error", "message": str(e)}, status=500)

    elif request.method == 'POST':
        data = request.data
        # last_used_date と wear_count は初期値
        data.setdefault("last_used_date", None)
        data.setdefault("wear_count", 0)

        try:
            response = supabase.table("items").insert(data).execute()
            return Response({"status": "success", "data": response.data})
        except Exception as e:
            return Response({"status": "error", "message": str(e)}, status=500)


# ----------------------------
# アイテム取得 / 更新 / 削除
# ----------------------------
@api_view(['GET', 'PUT', 'DELETE'])
def item_detail(request, item_id):
    try:
        # アイテム存在確認
        existing = supabase.table("items").select("*").eq("item_id", item_id).execute()
        if not existing.data:
            return Response({"status": "error", "message": "Item not found"}, status=404)

        if request.method == 'GET':
            return Response({"status": "success", "data": existing.data[0]})

        elif request.method == 'PUT':
            data = request.data
            response = supabase.table("items").update(data).eq("item_id", item_id).execute()
            return Response({"status": "success", "data": response.data})

        elif request.method == 'DELETE':
            supabase.table("items").delete().eq("item_id", item_id).execute()
            return Response({"status": "success", "message": "Item deleted"})

    except Exception as e:
        return Response({"status": "error", "message": str(e)}, status=500)