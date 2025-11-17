# backend/api/urls.py
from django.urls import path
from .views import items_list_create, item_detail
from .views.coordinations import coordinations_list_create, coordination_detail
from .views.usage_history import usage_list_create, usage_detail
from .views.coordination_items import coordination_items_manage
from .views import protected_view
from .views import usage_history

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

    # protected view
    path("protected/", protected_view.protected_view),
    
    # usage by date
    path("usage_history/date/<str:date_str>/", usage_history.usage_by_date),
]