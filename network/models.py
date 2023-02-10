from django.contrib.auth.models import AbstractUser, AnonymousUser
from django.db import models


class User(AbstractUser):
    id = models.AutoField(primary_key=True)


class Post(models.Model):

    id = models.AutoField(primary_key=True)

    user = models.ForeignKey("User", on_delete=models.CASCADE, related_name="posts")
    text = models.TextField(blank=False, null=False, max_length=500)
    created = models.DateTimeField(auto_now_add=True, blank=True)

    def to_dict(self, request_user=None):
        if request_user is None or isinstance(request_user, AnonymousUser):
            liked = False
        else:
            liked = False if self.likes.filter(user=request_user).first() is None else True  # type: ignore
        return {
            "id": self.id,
            "username": self.user.username,
            "text": self.text,
            "created": self.created.strftime(r"%H:%M %d.%m.%Y"),
            "likes": self.likes.count(),  # type: ignore
            "liked": liked,
            "comments": [c.to_dict() for c in self.comments.order_by("created")],  # type: ignore
        }


class Like(models.Model):
    id = models.AutoField(primary_key=True)

    user = models.ForeignKey("User", on_delete=models.CASCADE, related_name="likes")
    post = models.ForeignKey("Post", on_delete=models.CASCADE, related_name="likes")
    created = models.DateTimeField(auto_now_add=True, blank=False, null=False)

class Comment(models.Model):
    id = models.AutoField(primary_key=True)

    text = models.TextField(blank=False, null=False, max_length=100)
    user = models.ForeignKey("User", on_delete=models.CASCADE, related_name="comments")
    post = models.ForeignKey("Post", on_delete=models.CASCADE, related_name="comments")
    created = models.DateTimeField(auto_now_add=True, blank=False, null=False)

    def to_dict(self):
        return {
            "id": self.id,
            "user": self.user.username,
            "text": self.text,
            "created": self.created.strftime(r"%H:%M %d.%m.%Y"),
        }


class Follow(models.Model):
    id = models.AutoField(primary_key=True)

    follower = models.ForeignKey(
        "User", on_delete=models.CASCADE, related_name="following"
    )
    follows = models.ForeignKey(
        "User", on_delete=models.CASCADE, related_name="followers"
    )
    created = models.DateTimeField(auto_now_add=True, blank=False, null=False)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["follower", "follows"], name="all_keys_unique_together")  # type: ignore
        ]
