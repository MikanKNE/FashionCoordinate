import os
import jwt
from django.conf import settings

def get_user_id_from_token(request):
    """
    Supabase の JWT トークンからユーザーIDを取得
    """
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        print("⚠️ Authorizationヘッダーがありません")
        return None

    token = auth_header.split(" ")[1]

    try:
        decoded = jwt.decode(
            token,
            os.environ["SUPABASE_JWT_SECRET"],  # Supabase JWT Secret を使用
            algorithms=["HS256"],
            options={"verify_aud": False}  # audience を使わない場合
        )
        return decoded.get("sub")  # Supabase Auth UUID
    except jwt.ExpiredSignatureError:
        print("⚠️ JWT の有効期限切れ")
        return None
    except Exception as e:
        print("⚠️ JWT の検証に失敗:", e)
        return None
