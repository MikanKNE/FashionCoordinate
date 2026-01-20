# backend/api/views/declutter.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from datetime import datetime, timedelta, timezone

from ..supabase_client import supabase
from .coordinations import get_user_id_from_request


@api_view(["GET"])
def declutter_candidates(request):
    """
    断捨離候補一覧を返す API

    ルール：
    - discard / deleted は常に除外
    - pending は status_updated_at から一定期間（30日）除外
    - お気に入りは原則除外
    - スコアが一定未満のものは除外
    """
    user_id, err_response = get_user_id_from_request(request)
    if err_response:
        return err_response

    try:
        res = (
            supabase
            .table("item_usage_summary_for_suggestion")
            .select(
                "item_id, name, is_favorite, status, status_updated_at, "
                "usage_count, last_used_date, "
                "days_since_created, days_since_last_use, monthly_usage_rate"
            )
            .eq("user_id", user_id)
            .gte("days_since_created", 30)
            .or_(
                "days_since_last_use.is.null,"
                "days_since_last_use.gte.1"     # 残す選択してから◯日表示しない(後で変更)
            )
            .execute()
        )

        rows = res.data or []

    except Exception as e:
        return Response(
            {"status": "error", "message": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    results = []

    for row in rows:
        # お気に入りは断捨離対象外
        if row["is_favorite"]:
            continue

        # =================================================
        # スコア計算
        # =================================================
        score = 0
        score_breakdown = []

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
        elif row["days_since_last_use"] is not None and row["days_since_last_use"] >= 14:
            add_score("2週間以上使用されていません", 3)

        # -----------------------
        # 使用頻度
        # -----------------------
        if row["monthly_usage_rate"] < 10:
            add_score("月平均の使用回数が少ないです", 3)

        # -----------------------
        # 候補判定
        # -----------------------
        if score < 3:
            continue

        # =================================================
        # レスポンス用データ
        # =================================================
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

    return Response(results, status=status.HTTP_200_OK)
