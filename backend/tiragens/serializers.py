from rest_framework import serializers
from .models import Sessao, Mensagem, RegistroAkashico

class MensagemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Mensagem
        fields = '__all__'
        # O remetente será preenchido automaticamente pelo Django na View
        read_only_fields = ['remetente']

# 1. Movemos o RegistroAkashicoSerializer para cima para ele poder ser usado pela Sessão
class RegistroAkashicoSerializer(serializers.ModelSerializer):
    class Meta:
        model = RegistroAkashico
        fields = '__all__'

class SessaoSerializer(serializers.ModelSerializer):
    # Campos virtuais calculados para entregar ao React a interface pronta
    guia_nome = serializers.SerializerMethodField()
    guia_img = serializers.SerializerMethodField()
    consulente_nome = serializers.SerializerMethodField()
    tipo_leitura = serializers.CharField(source='get_tipo_display', read_only=True)
    data_formatada = serializers.SerializerMethodField()
    hora_formatada = serializers.SerializerMethodField()
    
    # 2. A MÁGICA: Injeta os dados do Registro Akáshico dentro do JSON da Sessão
    registro_akashico = RegistroAkashicoSerializer(read_only=True)
    
    class Meta:
        model = Sessao
        fields = [
            'id', 'tipo', 'status_sessao', 'pergunta_principal', 'contexto', 
            'guia_nome', 'guia_img', 'consulente_nome', 'tipo_leitura', 
            'data_formatada', 'hora_formatada', 'data_criacao', 'nota',
            'registro_akashico' # <-- Campo adicionado na lista
        ]

    def get_guia_nome(self, obj):
        if obj.tarologo:
            return obj.tarologo.first_name
        return "Aguardando Guia..."

    def get_guia_img(self, obj):
        # Verifica se o tarólogo tem foto no perfil
        if obj.tarologo and hasattr(obj.tarologo, 'tarologo_profile') and obj.tarologo.tarologo_profile.foto_perfil:
            return obj.tarologo.tarologo_profile.foto_perfil.url
        return None

    def get_consulente_nome(self, obj):
        return obj.consulente.first_name if obj.consulente.first_name else obj.consulente.email

    def get_data_formatada(self, obj):
        data = obj.data_agendada if obj.tipo == 'AGENDADA' and obj.data_agendada else obj.data_criacao
        return data.strftime('%d/%m/%Y')

    def get_hora_formatada(self, obj):
        if obj.status_sessao == 'aguardando_guia':
            return "Fila de Espera"
        if obj.status_sessao == 'ao_vivo':
            return "Agora"
        data = obj.data_agendada if obj.tipo == 'AGENDADA' and obj.data_agendada else obj.data_criacao
        return data.strftime('%H:%M')