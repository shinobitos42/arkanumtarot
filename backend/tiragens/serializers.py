from rest_framework import serializers
from .models import Sessao, Mensagem, RegistroAkashico

class MensagemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Mensagem
        fields = '__all__'
        read_only_fields = ['remetente']


class RegistroAkashicoSerializer(serializers.ModelSerializer):
    class Meta:
        model = RegistroAkashico
        fields = '__all__'


class SessaoSerializer(serializers.ModelSerializer):
    guia_nome = serializers.SerializerMethodField()
    guia_img = serializers.SerializerMethodField()
    # NOVO: Adicionado campo para trazer o email do guia
    guia_email = serializers.SerializerMethodField() 
    consulente_nome = serializers.SerializerMethodField()
    # NOVO: Puxa direto o email do consulente relacionado
    consulente_email = serializers.EmailField(source='consulente.email', read_only=True) 
    
    tipo_leitura = serializers.CharField(source='get_tipo_display', read_only=True)
    data_formatada = serializers.SerializerMethodField()
    hora_formatada = serializers.SerializerMethodField()
    
    registro_akashico = RegistroAkashicoSerializer(read_only=True)
    
    class Meta:
        model = Sessao
        fields = [
            'id', 'tipo', 'status_sessao', 'pergunta_principal', 'contexto', 
            'guia_nome', 'guia_img', 'guia_email', 'consulente_nome', 'consulente_email', 
            'tipo_leitura', 'data_formatada', 'hora_formatada', 'data_criacao', 'nota',
            'registro_akashico'
        ]

    def get_guia_nome(self, obj):
        if obj.tarologo:
            return obj.tarologo.first_name
        return "Aguardando Guia..."

    def get_guia_img(self, obj):
        if obj.tarologo and hasattr(obj.tarologo, 'tarologo_profile') and obj.tarologo.tarologo_profile.foto_perfil:
            return obj.tarologo.tarologo_profile.foto_perfil.url
        return None

    # NOVO: Método para buscar o email do oraculista da sessão
    def get_guia_email(self, obj):
        if obj.tarologo:
            return obj.tarologo.email
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