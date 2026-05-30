from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import (
    CustomUser, 
    TarologoProfile, 
    AgendaTarologo, 
    TurnoTrabalho, 
    Folga, 
    TransacaoFinanceira
)

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'first_name', 'role', 'password', 'foto_perfil']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        validated_data['username'] = validated_data.get('email')
        user = CustomUser.objects.create_user(**validated_data)
        return user


# ==========================================
# SERIALIZERS DA AGENDA
# ==========================================

class TurnoTrabalhoSerializer(serializers.ModelSerializer):
    class Meta:
        model = TurnoTrabalho
        fields = ['id', 'dia_semana', 'hora_inicio', 'hora_fim']

class FolgaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Folga
        fields = ['id', 'data']

class AgendaTarologoSerializer(serializers.ModelSerializer):
    turnos = TurnoTrabalhoSerializer(many=True, read_only=True)
    folgas = FolgaSerializer(many=True, read_only=True)

    class Meta:
        model = AgendaTarologo
        fields = ['id', 'duracao_sessao', 'intervalo', 'turnos', 'folgas']


# ==========================================
# SERIALIZERS DE FINANÇAS E PERFIL
# ==========================================

class TransacaoFinanceiraSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransacaoFinanceira
        fields = '__all__'


class TarologoProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    # ATALHO: Expõe o e-mail de forma plana no perfil do tarólogo (tarologo.email)
    email = serializers.EmailField(source='user.email', read_only=True)
    agenda = AgendaTarologoSerializer(read_only=True)
    
    class Meta:
        model = TarologoProfile
        fields = '__all__'


# ==========================================
# SERIALIZER DO LOGIN (TOKEN JWT)
# ==========================================

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        
        # Injeta os dados da conta logada no JSON de resposta
        data['id'] = self.user.id  
        data['role'] = self.user.role
        data['first_name'] = self.user.first_name
        # CORREÇÃO: Enviando o email para o frontend salvar no localStorage no login!
        data['email'] = self.user.email  
        
        # Devolve a URL da foto de perfil no momento do login (se o usuário tiver uma)
        data['foto_perfil'] = self.user.foto_perfil.url if self.user.foto_perfil else None
        
        return data