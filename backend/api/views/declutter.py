# backend/api/views/declutter.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from datetime import date

from ..supabase_client import supabase
from .coordinations import get_user_id_from_request


def get_current_season() -> str:
    month = date.today().month
    if month in (12, 1, 2):
        return "冬"
    elif month in (3, 4, 5):
        return "春"
    elif month in (6, 7, 8):
        return "夏"
    else:
        return "秋"


@api_view(["GET"])
def declutter_candidates(request):
    """
    断捨離候補一覧を返す API（本番用・完成版）

    - tier 判定（review / strong）
    - 季節補正
    - クールダウンは view 側で処理済み
    """

    user_id, err_response = get_user_id_from_request(request)
    if err_response:
        return err_response

    try:
        res = (
            supabase
            .table("item_usage_summary_for_suggestion")
            .select(
                "item_id, name, category, is_favorite, season_tag, "
                "usage_count, last_used_date, "
                "days_since_created, days_since_last_use, monthly_usage_rate"
            )

            .eq("user_id", user_id)
            .gte("days_since_created", 90)
            .execute()
        )
        rows = res.data or []

    except Exception as e:
        return Response(
            {"status": "error", "message": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    current_season = get_current_season()
    results = []

    for row in rows:
        # ---------------------------------
        # 安全装置
        # ---------------------------------
        if row["is_favorite"]:
            continue

        score = 0
        score_breakdown = []

        def add_score(reason: str, point: int):
            nonlocal score
            score += point
            score_breakdown.append({
                "reason": reason,
                "point": point,
            })

        # ---------------------------------
        # 登録期間
        # ---------------------------------
        dsc = row["days_since_created"]

        if dsc >= 365:
            add_score("登録から1年以上経過しています", 3)
        elif dsc >= 180:
            add_score("登録から半年以上経過しています", 2)
        elif dsc >= 90:
            add_score("登録から3ヶ月以上経過しています", 1)

        # ---------------------------------
        # 最終使用日
        # ---------------------------------
        if row["last_used_date"] is None:
            add_score("一度も使用されていません", 4)
        else:
            dslu = row["days_since_last_use"]
            if dslu >= 365:
                add_score("1年以上使用されていません", 5)
            elif dslu >= 180:
                add_score("半年以上使用されていません", 3)
            elif dslu >= 90:
                add_score("3ヶ月以上使用されていません", 1)

        # ---------------------------------
        # 使用頻度
        # ---------------------------------
        mur = row["monthly_usage_rate"]

        if mur < 0.2:
            add_score("ほとんど使用されていません", 3)
        elif mur < 0.5:
            add_score("使用頻度が低いです", 2)
        elif mur < 1:
            add_score("たまにしか使用されていません", 1)

        # ---------------------------------
        # 季節補正
        # ---------------------------------
        item_seasons = row.get("season_tag", [])

        if item_seasons and current_season:
            if current_season not in item_seasons:
                add_score("季節外のため、判断を保留します", -2)

        # ---------------------------------
        # tier 判定
        # ---------------------------------
        if score >= 9:
            tier = "strong"
            tier_label = "強い断捨離候補"
        elif score >= 7:
            tier = "review"
            tier_label = "見直し候補"
        else:
            continue

        # ---------------------------------
        # レスポンス
        # ---------------------------------
        results.append({
            "item_id": row["item_id"],
            "name": row["name"],
            "declutter_score": score,
            "tier": tier,
            "tier_label": tier_label,
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
