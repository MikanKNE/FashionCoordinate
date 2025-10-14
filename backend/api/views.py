from rest_framework.decorators import api_view
from rest_framework.response import Response
from .supabase_client import supabase  # ← 共通クライアントを import

@api_view(['GET'])
def test_supabase(request):
    try:
        data = supabase.table("subcategories").select("*").execute()
        return Response({
            "status": "success",
            "data": data.data
        })
    except Exception as e:
        return Response({
            "status": "error",
            "message": str(e)
        })