from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt

from .models import Like, Post, User


def index(request):
    return render(request, "network/index.html")


def user_page(request, username: str):
    user = User.objects.filter(username=username).first()

    if user is None:
        return JsonResponse({"error": f"user {username} does not exist"}, status=404)

    return render(request, "network/user_page.html", {"viewed_user": user})


def posts(request):
    posts = Post.objects.order_by("-created")
    return JsonResponse([post.to_dict() for post in posts], status=200, safe=False)


def user_posts(request, username: str):
    user = User.objects.filter(username=username).first()

    if user is None:
        return JsonResponse({"error": f"user {username} does not exist"}, status=404)

    posts = Post.objects.filter(user=user).order_by("-created").all()
    return JsonResponse([post.to_dict() for post in posts], status=200, safe=False)


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
