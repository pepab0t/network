from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt

from .models import Comment, Follow, Like, Post, User


def index(request):
    return render(
        request,
        "network/index.html",
        {"script": "network/index.js", "title": "All posts"},
    )


def user_page(request, username: str):
    user = User.objects.filter(username=username).first()

    if user is None:
        return JsonResponse({"error": f"user {username} does not exist"}, status=404)

    return render(request, "network/user_page.html", {"viewed_user": user})


@login_required
def following_page(request):
    return render(
        request,
        "network/index.html",
        {"script": "network/following_page.js", "title": "Following"},
    )


def posts(request):
    posts = Post.objects.order_by("-created")
    return JsonResponse([post.to_dict() for post in posts], status=200, safe=False)


def user_posts(request, username: str):
    user = User.objects.filter(username=username).first()

    if user is None:
        return JsonResponse({"error": f"user {username} does not exist"}, status=404)

    posts = Post.objects.filter(user=user).order_by("-created").all()
    return JsonResponse([post.to_dict() for post in posts], status=200, safe=False)


@login_required
def following_posts(request):
    following = request.user.following.all()
    users = User.objects.filter(followers__in=following)
    posts = Post.objects.filter(user__in=users).order_by("-created")

    return JsonResponse([post.to_dict() for post in posts], status=200, safe=False)


@login_required
def follow(request, user_id: int):
    user = User.objects.get(pk=user_id)

    if (status := request.GET.get("status", None)) is None:
        return JsonResponse(
            {"error": "query parameter `status: bool` not specified"}, status=400
        )

    if status not in {"true", "false"}:
        return JsonResponse({"error": "status must be true/false"}, status=400)

    if status == "true":
        if user is None:
            return JsonResponse({"error": f"no user with id {user_id}"}, status=400)

        if user == request.user:
            return JsonResponse({"error": "You cannot follow yourself"}, status=400)
        try:
            f = Follow(follower=request.user, follows=user)
            f.save()
        except IntegrityError:
            return JsonResponse({"error": "You cannot follow user twice"}, status=400)
        followers = user.followers.count()  # type: ignore

        return JsonResponse(
            {"message": f"Successfully following user {user}", "followers": followers},
            status=200,
        )
    else:
        f = Follow.objects.filter(follower=request.user, follows=user).first()
        if f is None:
            return JsonResponse(
                {"error": f"Follow ({request.user} -> {user}) not found"}, status=404
            )
        f.delete()
        followers = user.followers.count()  # type: ignore
        return JsonResponse(
            {
                "message": f"User {request.user} successfully unfollowed {user}",
                "followers": followers,
            },
            status=200,
        )


def user_detail(request, username: str):
    user = User.objects.filter(username=username).first()

    if user is None:
        return JsonResponse({"error": f"user {username} not found"}, status=400)

    if request.user.is_authenticated:
        i_am = bool(Follow.objects.filter(follower=request.user, follows=user).first())
    else:
        i_am = None

    return JsonResponse(
        {
            "followers": user.followers.count(),  # type: ignore
            "following": user.following.count(),  # type: ignore
            "username": user.username,
            "i_am_follower": i_am,
        },
        status=200,
    )


@login_required
def like(request, post_id: int):
    if not request.method == 'POST':
        return JsonResponse({"error": "Invalid request method"}, status=400)

    post = Post.objects.get(pk=post_id)

    like = Like.objects.filter(user=request.user, post=post).first()
    if like is None:
        Like.objects.create(user=request.user, post=post)
        return JsonResponse(
            {
                "message": f"Successfully added like to post {post}",
                "likes": post.likes.count(), # type: ignore
                "liked": True
            },
            status=200,
        )
    else:
        like.delete()
        return JsonResponse(
            {
                "message": f"Successfully unliked post {post}",
                "likes": post.likes.count(), # type: ignore
                "liked": False
            },
            status=200,
        )


@login_required
def comment(request, post_id: int):
    if request.method == "POST":
        post = Post.objects.get(pk=post_id)

        text = request.POST.get("comment_text", None)

        print(text)

        if text is None:
            return JsonResponse(
                {"error": "Missing argument `comment_text`"}, status=400
            )
        if text == "":
            return HttpResponse(
                {"error":"Empty comment not allowed"}, status=400
            )

        comment = Comment(post=post, user=request.user, text=text)
        comment.save()

        return JsonResponse({"message": "Comment posted"}, status=200)

    return HttpResponse(content="Unauthorized", status=403, content_type="text/plain")


def get_comments(request, post_id: int):
    post = Post.objects.get(pk=post_id)

    comments = Comment.objects.filter(post=post).order_by("created")

    return JsonResponse([c.to_dict() for c in comments], status=200, safe=False)


@csrf_exempt
@login_required
def new_post(request):
    if request.method == "POST":
        text = request.POST.get("post_text", None)
        if text is None:
            return JsonResponse({"error": "no attribute `post_text`"}, status=400)

        post = Post(user=request.user, text=text)
        post.save()

    return HttpResponseRedirect(reverse("index"))


@csrf_exempt
def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(
                request,
                "network/login.html",
                {"message": "Invalid username and/or password."},
            )
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(
                request, "network/register.html", {"message": "Passwords must match."}
            )

        # Attempt to create new user
        try:
            user = User.objects.create_user(
                username=username, email=email, password=password
            )
            user.save()
        except IntegrityError:
            return render(
                request, "network/register.html", {"message": "Username already taken."}
            )
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")
