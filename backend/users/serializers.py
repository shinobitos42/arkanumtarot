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
    # Aninha os turnos e folgas dentro da agenda para facilitar a vida do React
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
    # NOVO: A Agenda agora vai viajar junto com o Perfil para o Frontend
    agenda = AgendaTarologoSerializer(read_only=True)
    
    class Meta:
        model = TarologoProfile
        fields = '__all__'


# ==========================================
# SERIALIZER DO LOGIN (TOKEN JWT)
# ==========================================

# Adiciona os metadados do usuário junto aos tokens de acesso na resposta do login
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        
        # Injeta os dados da conta logada no JSON de resposta
        data['id'] = self.user.id  # <--- ESSA É A PEÇA CHAVE PARA O CHAT FUNCIONAR
        data['role'] = self.user.role
        data['first_name'] = self.user.first_name
        
        # Devolve a URL da foto de perfil no momento do login (se o usuário tiver uma)
        data['foto_perfil'] = self.user.foto_perfil.url if self.user.foto_perfil else None
        
        return data