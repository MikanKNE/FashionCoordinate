from rest_framework.decorators import api_view
from rest_framework.response import Response
from ..supabase_client import supabase

# ----------------------------
# コーディネーションアイテム追加 / 削除
# ----------------------------
@api_view(['POST', 'DELETE'])
def coordination_items_manage(request):
    data = request.data
    coordination_id = data.get("coordination_id")
    item_id = data.get("item_id")

    if not coordination_id or not item_id:
        return Response({"status": "error", "message": "coordination_id と item_id が必要"}, status=400)

    try:
        if request.method == 'POST':
            response = supabase.table("coordination_items").insert({
                "coordination_id": coordination_id,
                "item_id": item_id
            }).execute()
            return Response({"status": "success", "data": response.data})

        elif request.method == 'DELETE':
            supabase.table("coordination_items").delete().eq("coordination_id", coordination_id).eq("item_id", item_id).execute()
            return Response({"status": "success", "message": "Item removed from coordination"})

    except Exception as e:
        return Response({"status": "error", "message": str(e)}, status=500)