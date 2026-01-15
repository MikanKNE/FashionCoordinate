# backend/api/urls.py
from django.urls import path
from .views.items import items_list_create, item_detail
from .views.coordinations import coordinations_list_create, coordination_detail
from .views.usage_history import usage_list_create, usage_detail, usage_by_date
from .views.coordination_items import coordination_items_manage, get_all_coordination_items
from .views.subcategories import subcategories_list
from .views.storages import storages_list_create, storage_detail
from .views.users import users_list_create, user_detail, user_update_email, user_update_password
from .views.protected_view import protected_view
from .views.items_image import item_image
from .views.item_image_batch import item_image_batch
from .views.declutter import declutter_candidates
from .views.ai_image_analysis import image_analysis_preview
from .views.declutter_actions import update_declutter_status

urlpatterns = [
    # items
    path("items/", items_list_create),
    path("items/<int:item_id>/", item_detail),

    # coordinations
    path("coordinations/", coordinations_list_create),
    path("coordinations/<int:coordination_id>/", coordination_detail),

    # usage_history
    path("usage_history/", usage_list_create),
    path("usage_history/<int:history_id>/", usage_detail),

    # coordination_items
    path("coordination_items/", coordination_items_manage),
    path("coordination_items/all/", get_all_coordination_items),

    # subcategories
    path("subcategories/", subcategories_list),

    # storages
    path("storages/", storages_list_create,),
    path("storages/<int:storage_id>/", storage_detail,),

    # users
    path("users/", users_list_create),
    path("users/<uuid:user_id>/", user_detail),
    path("users/<uuid:user_id>/email/", user_update_email),
    path("users/<uuid:user_id>/password/", user_update_password),

    # protected view
    path("protected/", protected_view),

    # usage by date
    path("usage_history/date/<str:date_str>/", usage_by_date),
    path("items/<int:item_id>/image/", item_image),
    path("api/items/images/", item_image_batch),
    path("items/declutter_candidates/", declutter_candidates),

    # image analysis preview
    path("image_analysis/preview/", image_analysis_preview),
    path("items/declutter/action/", update_declutter_status),
]