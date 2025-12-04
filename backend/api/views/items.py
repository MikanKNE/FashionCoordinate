# backend/api/views/items.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from ..supabase_client import supabase
import traceback
import base64
import uuid
import mimetypes

# ===============================
# 画像アップロード関数
# ===============================
def upload_image_base64(base64_data, file_prefix="item"):
    try:
        print("=== upload_image_base64 called ===")
        print("base64 length:", len(base64_data))

        # base64ヘッダー除去
        if "," in base64_data:
            base64_data = base64_data.split(",")[1]

        image_bytes = base64.b64decode(base64_data)

        # ファイル名作成
        file_id = str(uuid.uuid4())
        file_path = f"{file_prefix}/{file_id}.jpg"

        print("Uploading to:", file_path)

        # Storage にアップロード
        res = supabase.storage.from_("item_image").upload(file_path, image_bytes)

        print("UPLOAD RESULT:", res)

        if isinstance(res, dict) and res.get("error"):
            print("UPLOAD ERROR:", res["error"])
            raise ValueError(res["error"]["message"])

        # 公開URLを取得
        public_url = supabase.storage.from_("item_image").get_public_url(file_path)

        print("PUBLIC URL:", public_url)

        return public_url

    except Exception as e:
        print("upload_image_base64 error:", e)
        raise e


# ====================================================
# アイテム一覧取得 / 新規作成
# ====================================================
@api_view(['GET', 'POST'])
def items_list_create(request):
    try:
        # --- JWTでユーザー取得 ---
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return Response({"status": "error", "message": "Authorization header missing"}, status=401)
        token = auth_header.split(" ")[1]
        user = supabase.auth.get_user(token)
        if not user or not user.user:
            return Response({"status": "error", "message": "Invalid token"}, status=401)
        user_id = user.user.id

        # ---------------- GET ----------------
        if request.method == 'GET':
            response = (
                supabase.table("items")
                .select("*, subcategories:subcategory_id(name), storages:storage_id(storage_location)")
                .eq("user_id", user_id)
                .execute()
            )
            return Response({"status": "success", "data": response.data})

        # ---------------- POST ----------------
        elif request.method == 'POST':
            data = request.data.copy()

            # ==== ここからデバッグログ追加 ====
            print("\n===== DEBUG: POST /items/ =====")
            print("request.data keys:", list(request.data.keys()))
            print("image_base64 in request:", "image_base64" in request.data)
            print("image_base64 length:", len(request.data.get("image_base64", "")))
            print("raw image_base64 preview:", str(request.data.get("image_base64", ""))[:50])
            print("================================\n")
            # ==== ここまで ====

            # --- バリデーション ---
            if not data.get("name"):
                return Response({"status": "error", "message": "名前は必須です"}, status=400)

            valid_categories = ["服", "靴", "アクセサリー", "帽子", "バッグ"]
            if data.get("category") not in valid_categories:
                return Response({"status": "error", "message": "カテゴリが不正です"}, status=400)

            data["user_id"] = user_id
            data["season_tag"] = data.get("season_tag") or []
            data["tpo_tags"] = data.get("tpo_tags") or []

            # --- 画像アップロード対応 ---
            image_base64 = data.pop("image_base64", None)
            if image_base64:
                data["image_url"] = upload_image_base64(image_base64)

            # --- DB挿入 ---
            inserted = supabase.table("items").insert(data).execute()
            return Response({"status": "success", "data": inserted.data})

    except Exception as e:
        print("items_list_create エラー:", e)
        traceback.print_exc()
        return Response({"status": "error", "message": str(e)}, status=500)


# ====================================================
# アイテム取得 / 更新 / 削除
# ====================================================
@api_view(['GET', 'PUT', 'DELETE'])
def item_detail(request, item_id):
    try:
        # JWTでユーザー取得
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return Response({"status": "error", "message": "Authorization header missing"}, status=401)
        token = auth_header.split(" ")[1]
        user = supabase.auth.get_user(token)
        if not user or not user.user:
            return Response({"status": "error", "message": "Invalid token"}, status=401)
        user_id = user.user.id

        existing = (
            supabase.table("items")
            .select("*, subcategories:subcategory_id(name), storages:storage_id(storage_location)")
            .eq("item_id", item_id)
            .eq("user_id", user_id)
            .execute()
        )
        if not existing.data:
            return Response({"status": "error", "message": "Item not found"}, status=404)

        if request.method == 'GET':
            return Response({"status": "success", "data": existing.data[0]})

        elif request.method == 'PUT':
            data = request.data.copy()

            # --- バリデーション ---
            if "name" in data and not data.get("name"):
                return Response({"status": "error", "message": "名前は必須です"}, status=400)
            if "category" in data:
                valid_categories = ["服", "靴", "アクセサリー", "帽子", "バッグ"]
                if data.get("category") not in valid_categories:
                    return Response({"status": "error", "message": "カテゴリが不正です"}, status=400)

            data["season_tag"] = data.get("season_tag") or []
            data["tpo_tags"] = data.get("tpo_tags") or []

            # --- 画像更新対応 ---
            new_image = data.pop("image_base64", None)
            if new_image:
                data["image_url"] = upload_image_base64(new_image)

            updated = (
                supabase.table("items")
                .update(data)
                .eq("item_id", item_id)
                .eq("user_id", user_id)
                .execute()
            )

            return Response({"status": "success", "data": updated.data})

        elif request.method == 'DELETE':
            supabase.table("items").delete().eq("item_id", item_id).eq("user_id", user_id).execute()
            return Response({"status": "success", "message": "Item deleted"})

    except Exception as e:
        print("item_detail エラー:", e)
        traceback.print_exc()
        return Response({"status": "error", "message": str(e)}, status=500)
