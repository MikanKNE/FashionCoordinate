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
        score_breakdown = []

        # -----------------------
        # スコア加算用ヘルパー
        # -----------------------
        def add_score(reason: str, point: int):
            nonlocal score
            score += point
            score_breakdown.append({
                "reason": reason,
                "point": point,
            })

        # -----------------------
        # 登録期間
        # -----------------------
        if row["days_since_created"] >= 60:
            add_score("登録から60日以上経過", 2)
        elif row["days_since_created"] >= 30:
            add_score("登録から30日以上経過", 1)

        # -----------------------
        # 最終使用日
        # -----------------------
        if row["last_used_date"] is None:
            add_score("一度も使用されていません", 4)
        elif row["days_since_last_use"] >= 14:
            add_score("2週間以上使用されていません", 3)

        # -----------------------
        # 使用頻度
        # -----------------------
        if row["monthly_usage_rate"] < 10:
            add_score("月平均の使用回数が少ないです", 3)

        # -----------------------
        # お気に入り
        # -----------------------
        if not row["is_favorite"]:
            add_score("お気に入り登録されていません", 1)

        # -----------------------
        # 候補判定
        # -----------------------
        if score < 3:
            continue

        results.append({
            "item_id": row["item_id"],
            "name": row["name"],
            "declutter_score": score,
            "is_declutter_candidate": True,
            "score_breakdown": score_breakdown,
            "stats": {
                "usage_count": row["usage_count"],
                "last_used_date": row["last_used_date"],
                "days_since_created": row["days_since_created"],
                "days_since_last_use": row["days_since_last_use"],
                "monthly_usage_rate": row["monthly_usage_rate"],
            }
        })

    return Response(results)
