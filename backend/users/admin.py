from django.contrib import admin

# Register your models here.
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, TarologoProfile

class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ('email', 'first_name', 'role', 'is_staff')
    list_filter = ('role', 'is_staff')
    ordering = ('email',)

admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(TarologoProfile)