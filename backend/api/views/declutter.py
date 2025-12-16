# backend/api/views/declutter.py
from rest_framework.decorators import api_view
from rest_framework.response import Response

from ..supabase_client import supabase
from .coordinations import get_user_id_from_request

@api_view(["GET"])
def declutter_candidates(request):
    user_id, err_response = get_user_id_from_request(request)
    if err_response:
        return err_response

    try:
        res = (
            supabase
            .table("item_usage_summary")
            .select(
                "item_id, name, is_favorite, usage_count, last_used_date, "
                "days_since_created, days_since_last_use, monthly_usage_rate"
            )
            .eq("user_id", user_id)
            .gte("days_since_created", 30)  # テスト条件
            .execute()
        )

        rows = res.data or []

    except Exception as e:
        return Response(
            {"status": "error", "message": str(e)},
            status=500
        )

    results = []

    for row in rows:
        score = 0
        reasons = []

        if row["days_since_created"] >= 60:
            score += 2
        elif row["days_since_created"] >= 30:
            score += 1

        if row["last_used_date"] is None:
            score += 4
            reasons.append("一度も使用されていません")
        elif row["days_since_last_use"] >= 14:
            score += 3
            reasons.append("2週間以上使用されていません")

        if row["monthly_usage_rate"] < 10:
            score += 3
            reasons.append("月平均の使用回数が少ないです")

        if not row["is_favorite"]:
            score += 1
            reasons.append("お気に入り登録されていません")

        if score < 3:
            continue

        results.append({
            "item_id": row["item_id"],
            "name": row["name"],
            "declutter_score": score,
            "is_declutter_candidate": True,
            "reasons": reasons,
            "stats": {
                "usage_count": row["usage_count"],
                "last_used_date": row["last_used_date"],
                "days_since_created": row["days_since_created"],
            }
        })

    return Response(results)
