from django.contrib import admin
from django.urls import path
from chatbot.views import chatbot_query
from chatbot.page2 import trending_news_api
from django.shortcuts import render
def home(request):
    return render(request, "index.html")

urlpatterns = [
    path('admin/', admin.site.urls),
    path('chatbot/', chatbot_query, name='chatbot_query'),
    path('', home, name='home'),
    path("api/trending-news/", trending_news_api, name="trending_news_api"), 
]