from rest_framework.decorators import api_view
from rest_framework.response import Response
from ..supabase_client import supabase
import traceback
import uuid
import json

# ===============================
# 画像アップロード関数
# ===============================
def upload_image_file(file, file_prefix="item"):
    file_id = str(uuid.uuid4())
    extension = file.name.split('.')[-1].lower()
    file_path = f"{file_prefix}/{file_id}.{extension}"

    res = supabase.storage.from_("item_image").upload(
        file_path,
        file.read(),
        {"content-type": file.content_type}
    )

    if isinstance(res, dict) and res.get("error"):
        raise ValueError(res["error"]["message"])

    return file_path


# ===============================
# 画像削除関数
# ===============================
def delete_image_file(file_path):
    if not file_path:
        return

    res = supabase.storage.from_("item_image").remove([file_path])

    if isinstance(res, dict) and res.get("error"):
        raise ValueError(res["error"]["message"])


# ====================================================
# アイテム一覧取得 / 新規作成
# ====================================================
@api_view(["GET", "POST"])
def items_list_create(request):
    try:
        # ---------- 認証 ----------
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return Response({"message": "Authorization header missing"}, status=401)

        token = auth_header.split(" ")[1]
        user = supabase.auth.get_user(token)
        if not user or not user.user:
            return Response({"message": "Invalid token"}, status=401)

        user_id = user.user.id

        # ---------- GET ----------
        if request.method == "GET":
            res = (
                supabase.table("items")
                .select("*, subcategories:subcategory_id(name), storages:storage_id(storage_location)")
                .eq("user_id", user_id)
                .neq("status", "deleted")
                .execute()
            )
            return Response(res.data)

        # ---------- POST ----------
        data = request.POST.copy()
        file = request.FILES.get("image")
        image_path = None

        try:
            # バリデーション
            if not data.get("name"):
                return Response({"message": "名前は必須です"}, status=400)

            if data.get("category") not in ["服", "靴", "アクセサリー", "帽子", "バッグ"]:
                return Response({"message": "カテゴリが不正です"}, status=400)

            data["season_tag"] = json.loads(data.get("season_tag", "[]"))
            data["tpo_tags"] = json.loads(data.get("tpo_tags", "[]"))
            data["user_id"] = user_id
            data["status"] = "active"

            for f in ["subcategory_id", "storage_id", "price", "size"]:
                if data.get(f) == "":
                    data[f] = None

            # 画像アップロード
            if file:
                image_path = upload_image_file(file)
                data["image_url"] = image_path

            # DB INSERT
            inserted = supabase.table("items").insert(data).execute()
            return Response(inserted.data)

        except Exception as e:
            # INSERT失敗 → 画像ロールバック
            if image_path:
                delete_image_file(image_path)

            print("POST error:", e)
            traceback.print_exc()
            return Response({"message": "アイテム登録に失敗しました"}, status=500)

    except Exception as e:
        traceback.print_exc()
        return Response({"message": str(e)}, status=500)


# ====================================================
# アイテム取得 / 更新 / 論理削除
# ====================================================
@api_view(["GET", "PUT", "DELETE"])
def item_detail(request, item_id):
    try:
        # ---------- 認証 ----------
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return Response({"message": "Authorization header missing"}, status=401)

        token = auth_header.split(" ")[1]
        user = supabase.auth.get_user(token)
        if not user or not user.user:
            return Response({"message": "Invalid token"}, status=401)

        user_id = user.user.id

        # ---------- 取得 ----------
        existing = (
            supabase.table("items")
            .select("*")
            .eq("item_id", item_id)
            .eq("user_id", user_id)
            .neq("status", "deleted")
            .execute()
        )

        if not existing.data:
            return Response({"message": "Item not found"}, status=404)

        item = existing.data[0]

        # ---------- GET ----------
        if request.method == "GET":
            return Response(item)

        # ---------- PUT ----------
        if request.method == "PUT":
            data = request.POST.copy()
            file = request.FILES.get("image")
            new_image_path = None

            data["season_tag"] = json.loads(data.get("season_tag", "[]"))
            data["tpo_tags"] = json.loads(data.get("tpo_tags", "[]"))

            for f in ["subcategory_id", "storage_id", "price", "size"]:
                if data.get(f) == "":
                    data[f] = None

            if "status" in data and data["status"] not in ["active", "pending", "discard", "deleted"]:
                return Response({"message": "不正なstatusです"}, status=400)

            try:
                # 新画像アップロード
                if file:
                    new_image_path = upload_image_file(file)
                    data["image_url"] = new_image_path

                # DB UPDATE
                updated = (
                    supabase.table("items")
                    .update(data)
                    .eq("item_id", item_id)
                    .eq("user_id", user_id)
                    .execute()
                )

                # UPDATE成功後に旧画像削除
                if file and item.get("image_url"):
                    delete_image_file(item["image_url"])

                return Response(updated.data)

            except Exception as e:
                # 新画像ロールバック
                if new_image_path:
                    delete_image_file(new_image_path)

                print("PUT error:", e)
                traceback.print_exc()
                return Response({"message": "更新に失敗しました"}, status=500)

        # ---------- DELETE（論理削除） ----------
        if request.method == "DELETE":
            updated = (
                supabase.table("items")
                .update({"status": "deleted"})
                .eq("item_id", item_id)
                .eq("user_id", user_id)
                .execute()
            )
            return Response(updated.data)

    except Exception as e:
        traceback.print_exc()
        return Response({"message": str(e)}, status=500)
