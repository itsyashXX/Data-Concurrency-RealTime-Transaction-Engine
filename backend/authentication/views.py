from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
from .models import User
from .serializers import RegisterSerializer, LoginSerializer, UserProfileSerializer

def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0].strip()
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

class RegisterView(generics.CreateAPIView):
    """Register a new customer account."""
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Audit log creation
        try:
            from engine.models import AuditLog
            AuditLog.objects.create(
                user=user,
                action='AUTH_REGISTER',
                ip_address=get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', '')[:500],
                details={'email': user.email, 'full_name': user.full_name}
            )
        except Exception:
            pass

        refresh = RefreshToken.for_user(user)
        refresh['email'] = user.email
        refresh['role'] = user.role
        refresh['full_name'] = user.full_name

        return Response({
            "message": "User registered successfully.",
            "user": UserProfileSerializer(user).data,
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    """Authenticate user with email and password."""
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        user_data = data['user']
        try:
            from engine.models import AuditLog
            AuditLog.objects.create(
                user_id=user_data['id'],
                action='AUTH_LOGIN',
                ip_address=get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', '')[:500],
                details={'email': user_data['email']}
            )
        except Exception:
            pass

        return Response(data, status=status.HTTP_200_OK)


class LogoutView(APIView):
    """Blacklist refresh token upon logout."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response({"detail": "Refresh token is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            token = RefreshToken(refresh_token)
            token.blacklist()

            from engine.models import AuditLog
            AuditLog.objects.create(
                user=request.user,
                action='AUTH_LOGOUT',
                ip_address=get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', '')[:500],
                details={'email': request.user.email}
            )

            return Response({"message": "Successfully logged out."}, status=status.HTTP_200_OK)
        except TokenError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(generics.RetrieveUpdateAPIView):
    """Retrieve or update authenticated user profile."""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserProfileSerializer

    def get_object(self):
        user = self.request.user
        user.touch_heartbeat()
        return user


class HeartbeatView(APIView):
    """Keep user active status alive."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        request.user.touch_heartbeat()
        return Response({"status": "alive", "last_heartbeat": request.user.last_heartbeat})
