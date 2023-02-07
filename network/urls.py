from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("profile/<str:username>", views.user_page, name="user_page"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("new_post", views.new_post, name="new_post"),
    path("posts", views.posts, name="posts"),
    path("post/<str:username>", views.user_posts, name="user_posts"),
]
