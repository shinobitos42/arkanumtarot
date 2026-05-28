from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import CustomUser, TarologoProfile

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'first_name', 'role', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        validated_data['username'] = validated_data.get('email')
        user = CustomUser.objects.create_user(**validated_data)
        return user

class TarologoProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = TarologoProfile
        fields = '__all__'

# NOVO: Adiciona os metadados do usuário junto aos tokens de acesso na resposta do login
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        
        # Injeta os dados da conta logada no JSON de resposta
        data['id'] = self.user.id  # <--- ESSA É A PEÇA CHAVE PARA O CHAT FUNCIONAR
        data['role'] = self.user.role
        data['first_name'] = self.user.first_name
        
        return data