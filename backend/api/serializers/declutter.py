# backend/api/serializers/declutter.py
from rest_framework import serializers


class DeclutterCandidateSerializer(serializers.Serializer):
    item_id = serializers.IntegerField()
    name = serializers.CharField()
    declutter_score = serializers.IntegerField()
    is_declutter_candidate = serializers.BooleanField()
    reasons = serializers.ListField(child=serializers.CharField())

    stats = serializers.DictField()
