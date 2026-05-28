from django.contrib import admin
from .models import Sessao, Mensagem, RegistroAkashico

@admin.register(Sessao)
class SessaoAdmin(admin.ModelAdmin):
    # Alterado 'status' para 'status_sessao'
    list_display = ('id', 'consulente', 'tarologo', 'tipo', 'status_sessao', 'data_criacao')
    list_filter = ('status_sessao', 'tipo')
    search_fields = ('consulente__first_name', 'consulente__email', 'tarologo__first_name', 'tarologo__email')

@admin.register(Mensagem)
class MensagemAdmin(admin.ModelAdmin):
    # Alterado 'timestamp' para 'criado_em'
    list_display = ('id', 'sessao', 'remetente', 'tipo', 'criado_em')
    list_filter = ('tipo', 'criado_em')
    search_fields = ('remetente__first_name', 'remetente__email', 'texto')

@admin.register(RegistroAkashico)
class RegistroAkashicoAdmin(admin.ModelAdmin):
    list_display = ('id', 'sessao', 'data_arquivamento')
    search_fields = ('sessao__consulente__first_name', 'resumo_leitura')