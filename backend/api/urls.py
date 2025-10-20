from django.urls import path
from .views import items_list_create, item_detail
from .views.coordinations import coordinations_list_create, coordination_detail
from .views.usage_history import usage_list_create, usage_detail
from .views.coordination_items import coordination_items_manage

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
]