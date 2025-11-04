from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
import jwt
import os

SUPABASE_JWT_SECRET = os.environ.get("SUPABASE_JWT_SECRET", "")

@api_view(["GET"])
def protected_view(request):
    auth_header = request.headers.get("Authorization")

    if not auth_header:
        return Response({"error": "No token provided"}, status=401)

    token = auth_header.split(" ")[1]
    try:
        payload = jwt.decode(token, SUPABASE_JWT_SECRET, algorithms=["HS256"])
        return Response({"message": "Access granted", "user": payload})
    except jwt.InvalidTokenError:
        return Response({"error": "Invalid token"}, status=401)
