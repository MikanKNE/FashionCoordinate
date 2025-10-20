
from rest_framework.decorators import api_view
from rest_framework.response import Response
from ..supabase_client import supabase

# ----------------------------
# コーディネーション一覧取得 / 新規作成
# ----------------------------
@api_view(['GET', 'POST'])
def coordinations_list_create(request):
    if request.method == 'GET':
        try:
            response = supabase.table("coordinations").select("*").execute()
            return Response({"status": "success", "data": response.data})
        except Exception as e:
            return Response({"status": "error", "message": str(e)}, status=500)

    elif request.method == 'POST':
        data = request.data
        data.setdefault("is_favorite", False)

        try:
            response = supabase.table("coordinations").insert(data).execute()
            return Response({"status": "success", "data": response.data})
        except Exception as e:
            return Response({"status": "error", "message": str(e)}, status=500)


# ----------------------------
# コーディネーション取得 / 更新 / 削除
# ----------------------------
@api_view(['GET', 'PUT', 'DELETE'])
def coordination_detail(request, coordination_id):
    try:
        existing = supabase.table("coordinations").select("*").eq("coordination_id", coordination_id).execute()
        if not existing.data:
            return Response({"status": "error", "message": "Coordination not found"}, status=404)

        if request.method == 'GET':
            return Response({"status": "success", "data": existing.data[0]})

        elif request.method == 'PUT':
            data = request.data
            response = supabase.table("coordinations").update(data).eq("coordination_id", coordination_id).execute()
            return Response({"status": "success", "data": response.data})

        elif request.method == 'DELETE':
            supabase.table("coordinations").delete().eq("coordination_id", coordination_id).execute()
            return Response({"status": "success", "message": "Coordination deleted"})

    except Exception as e:
        return Response({"status": "error", "message": str(e)}, status=500)