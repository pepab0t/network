from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("following", views.following_page, name="following"),
    path("profile/<str:username>", views.user_page, name="user_page"),
    path("profile/<str:username>/detail", views.user_detail, name="user_followers"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("new_post", views.new_post, name="new_post"),
    path("posts", views.posts, name="posts"),
    path("posts/<str:username>", views.user_posts, name="user_posts"),
    path("following_posts", views.following_posts, name="following_posts"),
    path("follow/<int:user_id>", views.follow, name="follow"),
    path("comment/<int:post_id>", views.comment, name="comment"),
    path("comments/<int:post_id>", views.get_comments, name="comments"),
]
