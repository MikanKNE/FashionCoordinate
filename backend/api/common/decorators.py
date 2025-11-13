from functools import wraps
from rest_framework.response import Response
from .utils import get_user_id_from_token

def require_user_id(view_func):
    """リクエストのJWTトークンからuser_idを取得し、ビュー関数に渡す"""
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        user_id = get_user_id_from_token(request)
        if not user_id:
            return Response({"status": "error", "message": "Unauthorized"}, status=401)
        kwargs["user_id"] = user_id
        return view_func(request, *args, **kwargs)
    return wrapper
