# frontend/api/views/coordinations.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from ..supabase_client import supabase
import traceback

# ==========================
# JWT → user_id 抽出共通処理
# ==========================
def get_user_id_from_request(request):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return None, Response(
            {"status": "error", "message": "Authorization header missing"},
            status=401
        )

    token = auth_header.split(" ")[1]
    user = supabase.auth.get_user(token)
    if not user or not user.user:
        return None, Response(
            {"status": "error", "message": "Invalid token"},
            status=401
        )

    return user.user.id, None


# ==========================
# item_signature 共通関数
# ==========================
def build_item_signature(items):
    """
    item_id 配列から順不同で同一になる署名を作る
    例:
      [3, 7, 10] -> "3-7-10"
      [10, 3, 7] -> "3-7-10"
    """
    if not items:
        return ""

    try:
        return "-".join(map(str, sorted(map(int, items))))
    except Exception:
        return ""


# ====================================================
# コーディネート一覧取得 / 新規作成（items 付き）
# ====================================================
@api_view(['GET', 'POST'])
def coordinations_list_create(request):
    user_id, err_response = get_user_id_from_request(request)
    if err_response:
        return err_response

    # --------------------------
    # GET
    # --------------------------
    if request.method == 'GET':
        try:
            response = (
                supabase
                .table("coordinations")
                .select("*")
                .eq("user_id", user_id)
                .execute()
            )
            return Response({"status": "success", "data": response.data})

        except Exception as e:
            traceback.print_exc()
            return Response(
                {"status": "error", "message": str(e)},
                status=500
            )

    # --------------------------
    # POST（新規作成）
    # --------------------------
    elif request.method == 'POST':
        data = request.data.copy()
        data.setdefault("is_favorite", False)
        items = data.pop("items", [])

        if not isinstance(items, list) or len(items) == 0:
            return Response(
                {"status": "error", "message": "items は1つ以上必要です"},
                status=400
            )

        try:
            # user_id 設定
            data["user_id"] = user_id

            # item_signature 作成
            item_signature = build_item_signature(items)
            if not item_signature:
                return Response(
                    {"status": "error", "message": "item_signature の生成に失敗しました"},
                    status=400
                )

            data["item_signature"] = item_signature

            # ★ 重複チェック
            exists = (
                supabase
                .table("coordinations")
                .select("coordination_id")
                .eq("user_id", user_id)
                .eq("item_signature", item_signature)
                .execute()
            )

            if exists.data:
                return Response(
                    {
                        "status": "error",
                        "message": "同じアイテムの組み合わせのコーデが既に存在します"
                    },
                    status=400
                )

            # coordination 作成
            inserted = supabase.table("coordinations").insert(data).execute()
            if not inserted.data:
                return Response(
                    {"status": "error", "message": "Failed to create coordination"},
                    status=500
                )

            coordination_id = inserted.data[0]["coordination_id"]

            # 中間テーブル登録
            link_rows = [
                {"coordination_id": coordination_id, "item_id": item_id}
                for item_id in items
            ]
            supabase.table("coordination_items").insert(link_rows).execute()

            return Response(
                {
                    "status": "success",
                    "coordination_id": coordination_id
                }
            )

        except Exception as e:
            traceback.print_exc()
            return Response(
                {"status": "error", "message": str(e)},
                status=500
            )


# ====================================================
# コーディネート取得・更新・削除
# ====================================================
@api_view(['GET', 'PUT', 'DELETE'])
def coordination_detail(request, coordination_id):
    user_id, err_response = get_user_id_from_request(request)
    if err_response:
        return err_response

    try:
        existing = (
            supabase
            .table("coordinations")
            .select("*")
            .eq("coordination_id", coordination_id)
            .eq("user_id", user_id)
            .execute()
        )

        if not existing.data:
            return Response(
                {"status": "error", "message": "Coordination not found"},
                status=404
            )

        # --------------------------
        # GET
        # --------------------------
        if request.method == 'GET':
            return Response(
                {"status": "success", "data": existing.data[0]}
            )

        # --------------------------
        # PUT（更新）
        # --------------------------
        elif request.method == 'PUT':
            data = request.data.copy()
            items = data.pop("items", None)

            if not items or not isinstance(items, list):
                return Response(
                    {"status": "error", "message": "items は必須です"},
                    status=400
                )

            # ① signature 作成
            item_signature = build_item_signature(items)
            if not item_signature:
                return Response(
                    {"status": "error", "message": "item_signature の生成に失敗しました"},
                    status=400
                )

            # ② 重複チェック（自分以外）
            exists = (
                supabase
                .table("coordinations")
                .select("coordination_id")
                .eq("user_id", user_id)
                .eq("item_signature", item_signature)
                .neq("coordination_id", coordination_id)
                .execute()
            )

            if exists.data:
                return Response(
                    {
                        "status": "error",
                        "message": "同じアイテム構成の別コーデが既に存在します"
                    },
                    status=400
                )

            # ③ coordination 更新
            supabase.table("coordinations").update({
                **data,
                "item_signature": item_signature
            }).eq("coordination_id", coordination_id).execute()

            # ④ 中間テーブル全置換
            supabase.table("coordination_items").delete() \
                .eq("coordination_id", coordination_id).execute()

            rows = [
                {"coordination_id": coordination_id, "item_id": item_id}
                for item_id in items
            ]
            supabase.table("coordination_items").insert(rows).execute()

            return Response({"status": "success"})

        # --------------------------
        # DELETE
        # --------------------------
        elif request.method == 'DELETE':
            (
                supabase
                .table("coordinations")
                .delete()
                .eq("coordination_id", coordination_id)
                .eq("user_id", user_id)
                .execute()
            )

            return Response(
                {"status": "success", "message": "Coordination deleted"}
            )

    except Exception as e:
        traceback.print_exc()
        return Response(
            {"status": "error", "message": str(e)},
            status=500
        )
