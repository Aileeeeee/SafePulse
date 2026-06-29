from django.contrib.auth import authenticate, get_user_model
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework_simplejwt.tokens import RefreshToken
from django.db.models import Q
from .serializers import SignupSerializer, UserProfileSerializer,OrganisationSerializer
from .models import Organisation

User = get_user_model()

# Helper function to generate tokens manually
def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

class SignupView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = SignupSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            tokens = get_tokens_for_user(user)

            # Return tokens flat at the root level to match LoginView
            return Response({
                'access': tokens['access'],
                'refresh': tokens['refresh'],
                'user': UserProfileSerializer(user).data,
                'message': 'Account created successfully.'
            }, status=status.HTTP_201_CREATED)
            
        return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        # Your frontend passes "username", which can be either the username string or email string
        login_field = request.data.get('username') or request.data.get('email')
        password    = request.data.get('password')

        if not login_field or not password:
            return Response(
                {'error': 'Username or email and password are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user_obj = User.objects.get(
                Q(username=login_field) | Q(email=login_field)
            )
        except User.DoesNotExist:
            return Response(
                {'error': 'Invalid credentials.'}, # Keep custom error consistent
                status=status.HTTP_401_UNAUTHORIZED
            )

        user = authenticate(username=user_obj.username, password=password)

        if user:
            refresh = RefreshToken.for_user(user)
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': UserProfileSerializer(user).data,
            }, status=status.HTTP_200_OK)

        return Response(
            {'error': 'Invalid credentials.'},
            status=status.HTTP_401_UNAUTHORIZED
        )

class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()  # Destroys the refresh token's validity
            return Response({"message": "Successfully logged out."}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": "Invalid or missing refresh token."}, status=status.HTTP_400_BAD_REQUEST)

        # 4. Note: With SimpleJWT, "Logging out" on the server usually involves 
        # blacklisting the refresh token. If you haven't enabled the Blacklist app, 
        # the client simply deletes the token locally.

class ProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class OrganisationSearchView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        query = request.query_params.get('q', '')
        if len(query) < 2:
            return Response([])
        orgs = Organisation.objects.filter(
            is_active=True,
            name__icontains=query
        )[:10]
        serializer = OrganisationSerializer(orgs, many=True)
        return Response(serializer.data)


class UsernameAvailabilityView(APIView):
    """
    GET /api/auth/username-suggestions/?first_name=Adaeze&last_name=Okafor
    Returns suggestions and checks availability.
    
    GET /api/auth/username-suggestions/?username=adaeze.okafor
    Checks if a specific username is available.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        first_name = request.query_params.get('first_name', '').lower().strip()
        last_name  = request.query_params.get('last_name', '').lower().strip()
        username   = request.query_params.get('username', '').lower().strip()

        # ── Check single username availability ────────────────────────────
        if username:
            taken = User.objects.filter(username=username).exists()
            return Response({
                'username':   username,
                'available':  not taken,
            })

        # ── Generate suggestions from first + last name ───────────────────
        if not first_name or not last_name:
            return Response(
                {'error': 'first_name and last_name are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Clean names — remove spaces and special chars
        import re
        clean_first = re.sub(r'[^a-z0-9]', '', first_name)
        clean_last  = re.sub(r'[^a-z0-9]', '', last_name)

        # Generate candidate suggestions
        candidates = [
            f"{clean_first}.{clean_last}",           # adaeze.okafor
            f"{clean_first}_{clean_last}",            # adaeze_okafor
            f"{clean_first}{clean_last}",             # adaezeokafor
            f"{clean_first[0]}{clean_last}",          # aokafor
            f"{clean_first}.{clean_last[0]}",         # adaeze.o
            f"{clean_first}{clean_last[:3]}",         # adaezeoKa
            f"{clean_last}.{clean_first}",            # okafor.adaeze
        ]

        suggestions = []
        for candidate in candidates:
            if User.objects.filter(username=candidate).exists():
                # Username taken — try adding numbers
                for i in range(1, 10):
                    numbered = f"{candidate}{i}"
                    if not User.objects.filter(username=numbered).exists():
                        suggestions.append({
                            'username':  numbered,
                            'available': True,
                        })
                        break
            else:
                suggestions.append({
                    'username':  candidate,
                    'available': True,
                })

            if len(suggestions) >= 5:
                break

        return Response({'suggestions': suggestions})

class TeamListView(APIView):
    """
    GET /api/auth/team/
    Returns field staff in the same organisation as the coordinator.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user

        if user.role == 'ADMIN':
            # Admin sees everyone
            from accounts.models import NGOUser
            team = NGOUser.objects.exclude(id=user.id)
        elif user.role == 'COORDINATOR' and user.organisation:
            from accounts.models import NGOUser
            team = NGOUser.objects.filter(
                organisation=user.organisation,
                role='FIELD_STAFF',
            ).exclude(id=user.id)
        else:
            return Response([], status=status.HTTP_200_OK)

        from accounts.serializers import UserProfileSerializer
        return Response(UserProfileSerializer(team, many=True).data)
