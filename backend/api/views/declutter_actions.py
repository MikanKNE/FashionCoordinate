from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from datetime import datetime, timezone

from ..supabase_client import supabase
from .coordinations import get_user_id_from_request


@api_view(["POST"])
def update_declutter_status(request):
    user_id, err_response = get_user_id_from_request(request)
    if err_response:
        return err_response

    item_id = request.data.get("item_id")
    action = request.data.get("action")

    if not item_id or not action:
        return Response(
            {"message": "item_id と action は必須です"},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        update_data = {}

        now = datetime.now(timezone.utc).isoformat()

        if action == "pending":
            update_data["status"] = "pending"
            update_data["status_updated_at"] = now

        elif action == "discard":
            update_data["status"] = "discard"
            update_data["status_updated_at"] = now

        elif action == "favorite":
            update_data["is_favorite"] = True

        else:
            return Response(
                {"message": "不正な action です"},
                status=status.HTTP_400_BAD_REQUEST
            )

        supabase.table("items") \
            .update(update_data) \
            .eq("item_id", item_id) \
            .eq("user_id", user_id) \
            .execute()

        return Response({"status": "ok"})

    except Exception as e:
        return Response(
            {"status": "error", "message": str(e)},
            status=500
        )
