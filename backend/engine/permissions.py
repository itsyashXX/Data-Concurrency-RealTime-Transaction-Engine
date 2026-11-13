from rest_framework import permissions
from authentication.models import User

class IsAdminUserRole(permissions.BasePermission):
    """Permission check for admin endpoints."""
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            (request.user.role == User.Role.ADMIN or request.user.is_staff or request.user.is_superuser)
        )

class IsAccountOwner(permissions.BasePermission):
    """Permission check ensuring user owns the account."""
    def has_object_permission(self, request, view, obj):
        if hasattr(obj, 'user'):
            return obj.user == request.user
        return False
