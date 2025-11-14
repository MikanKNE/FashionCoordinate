import jwt
from django.conf import settings

def get_user_id_from_token(request):
    """Authorizationヘッダーからuser_idを取得"""
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return None

    token = auth_header.split(" ")[1]
    try:
        decoded = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        return decoded.get("sub")  # or decoded.get("user_id") depending on your token
    except Exception:
        return None
