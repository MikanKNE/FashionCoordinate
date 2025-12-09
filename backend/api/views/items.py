# backend/api/views/items.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from ..supabase_client import supabase
import traceback
import uuid

# ===============================
# 画像アップロード関数
# ===============================
def upload_image_file(file, file_prefix="item"):
    try:
        print("=== upload_image_file called ===")

        file_id = str(uuid.uuid4())
        extension = file.name.split('.')[-1].lower()
        file_path = f"{file_prefix}/{file_id}.{extension}"

        print("Uploading:", file_path)

        res = supabase.storage.from_("item_image").upload(
            file_path,
            file.read(),
            {
                "content-type": file.content_type
            }
        )

        if isinstance(res, dict) and res.get("error"):
            raise ValueError(res["error"]["message"])

        public_url = supabase.storage.from_("item_image").get_public_url(file_path)

        return public_url
    except Exception as e:
        print("upload_image_file error:", e)
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

        # ---------------- POST（FormData） ----------------
        elif request.method == 'POST':
            data = request.POST.copy()
            file = request.FILES.get("image")

            # --- バリデーション ---
            if not data.get("name"):
                return Response({"status": "error", "message": "名前は必須です"}, status=400)

            valid_categories = ["服", "靴", "アクセサリー", "帽子", "バッグ"]
            if data.get("category") not in valid_categories:
                return Response({"status": "error", "message": "カテゴリが不正です"}, status=400)

            # JSON文字列 → Python配列
            import json
            data["season_tag"] = json.loads(data.get("season_tag", "[]"))
            data["tpo_tags"] = json.loads(data.get("tpo_tags", "[]"))

            data["user_id"] = user_id

            # 数値カラムの空文字を None に変換
            int_fields = ["subcategory_id", "storage_id", "price", "size"]
            for f in int_fields:
                if data.get(f) == "":
                    data[f] = None

            # --- 画像アップロード ---
            if file:
                data["image_url"] = upload_image_file(file)

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
        # --- JWT認証 ---
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return Response({"status": "error", "message": "Authorization header missing"}, status=401)

        token = auth_header.split(" ")[1]
        user = supabase.auth.get_user(token)
        if not user or not user.user:
            return Response({"status": "error", "message": "Invalid token"}, status=401)

        user_id = user.user.id

        # --- 既存データ取得 ---
        existing = (
            supabase.table("items")
            .select("*, subcategories:subcategory_id(name), storages:storage_id(storage_location)")
            .eq("item_id", item_id)
            .eq("user_id", user_id)
            .execute()
        )

        if not existing.data:
            return Response({"status": "error", "message": "Item not found"}, status=404)

        # ---------------- GET ----------------
        if request.method == 'GET':
            return Response({"status": "success", "data": existing.data[0]})

        # ---------------- PUT（FormData） ----------------
        elif request.method == 'PUT':
            data = request.POST.copy()
            file = request.FILES.get("image")

            # --- バリデーション ---
            if "name" in data and not data.get("name"):
                return Response({"status": "error", "message": "名前は必須です"}, status=400)

            if "category" in data:
                valid_categories = ["服", "靴", "アクセサリー", "帽子", "バッグ"]
                if data.get("category") not in valid_categories:
                    return Response({"status": "error", "message": "カテゴリが不正です"}, status=400)

            # JSON文字列 → Python配列
            import json
            data["season_tag"] = json.loads(data.get("season_tag", "[]"))
            data["tpo_tags"] = json.loads(data.get("tpo_tags", "[]"))

            # 数値カラムの空文字を None に変換（PUT でも必要）
            int_fields = ["subcategory_id", "storage_id", "price", "size"]
            for f in int_fields:
                if data.get(f) == "":
                    data[f] = None

            # --- 新しい画像があればアップロード ---
            if file:
                data["image_url"] = upload_image_file(file)

            updated = (
                supabase.table("items")
                .update(data)
                .eq("item_id", item_id)
                .eq("user_id", user_id)
                .execute()
            )

            return Response({"status": "success", "data": updated.data})

        # ---------------- DELETE ----------------
        elif request.method == 'DELETE':
            supabase.table("items").delete().eq("item_id", item_id).eq("user_id", user_id).execute()
            return Response({"status": "success", "message": "Item deleted"})

    except Exception as e:
        print("item_detail エラー:", e)
        traceback.print_exc()
        return Response({"status": "error", "message": str(e)}, status=500)
