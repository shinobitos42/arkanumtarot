from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from django.db.models import Avg

from .models import CustomUser, TarologoProfile
from tiragens.models import Sessao 
from .serializers import UserSerializer, TarologoProfileSerializer, CustomTokenObtainPairSerializer

class RegisterView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = UserSerializer

class TarologoListView(generics.ListAPIView):
    queryset = TarologoProfile.objects.select_related('user').all()
    serializer_class = TarologoProfileSerializer
    permission_classes = [AllowAny]  # <--- PERMISSÃO PÚBLICA 

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

# NOVA VIEW INTELIGENTE: Serve tanto para Consulente quanto para Tarólogo
class UserMeView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.user.role == 'TAROLOGO':
            return TarologoProfileSerializer
        return UserSerializer

    def get_object(self):
        # Se for Tarólogo, puxa o Perfil. Se for Consulente, puxa o Usuário base.
        if self.request.user.role == 'TAROLOGO':
            return TarologoProfile.objects.get(user=self.request.user)
        return self.request.user

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        data = serializer.data
        
        # PREPARAÇÃO PARA O CÍRCULO PREMIUM (Assinatura)
        data['is_premium'] = False 
        
        # Só injeta estatísticas de Tarô se for um Tarólogo
        if request.user.role == 'TAROLOGO':
            sessoes = Sessao.objects.filter(tarologo=request.user)
            
            # CÁLCULO REAL DA AVALIAÇÃO (Média das estrelas!)
            media = sessoes.aggregate(Avg('nota'))['nota__avg']
            nota_calculada = round(media, 1) if media else 5.0
            
            stats = {
                "saldo_disponivel": float(instance.saldo_disponivel),
                "total_tiragens": sessoes.count(),
                "total_clientes": sessoes.values('consulente').distinct().count(),
                "nota_media": nota_calculada 
            }
            data.update(stats)
            
        return Response(data)

    def update(self, request, *args, **kwargs):
        # Habilita o PATCH (Salvar Data de Nascimento, etc)
        partial = kwargs.pop('partial', True)
        instance = self.get_object()
        
        serializer = self.get_serializer_class()(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        return Response(serializer.data)