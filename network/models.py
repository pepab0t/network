from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    id = models.AutoField(primary_key=True)


class Post(models.Model):

    id = models.AutoField(primary_key=True)

    user = models.ForeignKey("User", on_delete=models.CASCADE, related_name="posts")
    text = models.TextField(blank=False, null=False, max_length=500)
    created = models.DateTimeField(auto_now_add=True, blank=True)

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.user.username,
            "text": self.text,
            "created": self.created.strftime(r"%c"),
            "likes": self.likes.count(),  # type: ignore
            "liked": False if self.likes.filter(user=self.user).first() else False,  # type: ignore
            "comments": [c.to_dict() for c in self.comments.order_by("created")],  # type: ignore
        }


class Like(models.Model):

    id = models.AutoField(primary_key=True)

    user = models.ForeignKey("User", on_delete=models.CASCADE, related_name="likes")
    post = models.ForeignKey("Post", on_delete=models.CASCADE, related_name="likes")


class Comment(models.Model):
    id = models.AutoField(primary_key=True)

    text = models.TextField(blank=False, null=False, max_length=100)
    user = models.ForeignKey("User", on_delete=models.CASCADE, related_name="comments")
    post = models.ForeignKey("Post", on_delete=models.CASCADE, related_name="comments")
    created = models.DateTimeField(auto_now_add=True, blank=True)

    def to_dict(self):
        return {
            "user": self.user.username,
            "text": self.text,
            "created": self.created.strftime(r"%c"),
        }


class Follow(models.Model):
    id = models.AutoField(primary_key=True)

    follower = models.ForeignKey(
        "User", on_delete=models.CASCADE, related_name="following"
    )
    follows = models.ForeignKey(
        "User", on_delete=models.CASCADE, related_name="followers"
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["follower", "follows"], name="all_keys_unique_together")  # type: ignore
        ]
