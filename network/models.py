from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    id = models.AutoField(primary_key=True)


class Post(models.Model):

    id = models.AutoField(primary_key=True)

    user = models.ForeignKey("User", on_delete=models.CASCADE, related_name="posts")
    text = models.TextField(blank=False, null=False)
    created = models.DateTimeField(auto_now_add=True, blank=True)

    def to_dict(self):
        return {
            "username": self.user.username,
            "text": self.text,
            "created": self.created.strftime(r"%c"),
            "likes": self.likes.count(),  # type: ignore
        }


class Like(models.Model):

    id = models.AutoField(primary_key=True)

    user = models.ForeignKey("User", on_delete=models.CASCADE, related_name="likes")
    post = models.ForeignKey("Post", on_delete=models.CASCADE, related_name="likes")
