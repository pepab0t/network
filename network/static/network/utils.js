
function renderComments(comments, postId, {user, csrftoken}) {
    const renderComment = (c) => {
        return `
        <div class='card-text'>
            <span><a href="${myGlobal.url}profile/${c.user}">${c.user}</a>:</span>
            <span>${c.text}</span>
            &emsp;
            <span><small>${c.created}</small></span>
            ${user===c.user? `<button class='close' type='button' id='btn_comment_delete_${c.id}' data-post_id=${postId} data-comment_id=${c.id}>&times;</button>` : ""}
        </div>
        `
    }

    let rendered = comments.map(renderComment);
    if (userAuthenticated(user)) {
        const comment_form = `
        <form action="" method="POST" id='comment_${postId}' data-post_id='${postId}'>
            <input type='hidden' name='csrfmiddlewaretoken' value='${csrftoken}'>
            <input type='text' name="comment_text" id="comment_input_${postId}" placeholder='Write a comment..'>
            <input type='submit' value='Comment' class='btn btn-outline-success'>
        </form>
        `
        rendered.push(comment_form);
    }

    return rendered.join('');
}

export const userAuthenticated = (user) => user !== undefined;

function commentFormSubmit(form) {
    const commentValue = form.querySelector(`#comment_input_${form.dataset.post_id}`).value;

    if (commentValue === "") {
        return false;
    }

    fetch(`${myGlobal.url}comment/${form.dataset.post_id}`, {
        method: "POST",
        headers: {
            'X-CSRFToken': myGlobal.csrftoken,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams(Object.entries({comment_text: commentValue})).toString()
    })
    .then(response => response.json())
    .then(console.log)
    .then( () => {
        createCommentSection(form.dataset.post_id);
    })
    return false;
}

function commentButtonDelete(button){
    console.log(`deleting comment ${button.dataset.comment_id}`);
    fetch(`${myGlobal.url}delete_comment/${button.dataset.comment_id}`, {
        method: 'DELETE',
        headers: {
            'X-CSRFToken': myGlobal.csrftoken
        }
    })
    .then(async res => {
        if (res.ok) {
            return true;
        }
        console.log(await res.json());
        return false;
    })
    .then((ok) => {
        if (ok) {
            createCommentSection(button.dataset.post_id);
        }
    })
    .catch(console.log);

}

function createCommentSection(postId) {
    const divComments = document.querySelector(`#comments_post_${postId}`);
    divComments.innerHTML = "";

    fetch(`${myGlobal.url}comments/${postId}`)
    .then(response => response.json())
    .then(comments => {
        divComments.innerHTML = renderComments(comments, postId, myGlobal);
        const form = divComments.querySelector(`#comment_${postId}`);
        if (form) {
            form.onsubmit = () => commentFormSubmit(form);
        }
        divComments.querySelectorAll(`button[id*=btn_comment_delete_]`)
            .forEach(button => {
                button.onclick = () => commentButtonDelete(button);
            })
    })
    .catch(e => console.log(e))
}

export function displayPosts(posts, renderPost, postDivId = "posts"){
    // fill in inner HTML
    if (posts.length === 0) {
        document.querySelector(`#${postDivId}`).innerHTML += "There is no post yet."
    } else {
        document.querySelector(`#${postDivId}`).innerHTML += posts.map(renderPost).join('');
    }
    console.log(myGlobal.url);
 
    // add post delete buttons actions
    document.querySelectorAll('button[id*=btn_delete_]')
    .forEach( (button) => {
        button.onclick = () => {
            fetch(`${myGlobal.url}delete_post/${button.dataset.post_id}`, {
                method: "DELETE",
                headers: {
                    "X-CSRFToken": myGlobal.csrftoken
                }
            })
            .then(async res => {
                if (res.ok) {
                    return true;
                } else {
                    console.log(await res.json());
                    return false;
                }
            })
            .then((ok) => {
                console.log(ok);
                if (ok) {
                    document.querySelector(`#post_${button.dataset.post_id}`).remove();
                }
            })
            .catch(e => console.log(e));
        }
    });

    // add comment sections
    posts.forEach( post => createCommentSection(post.id));

    // add like functionality
    document.querySelectorAll('div[id*=div_like_]')
    .forEach((divElement) => {
            const button = divElement.querySelector('#like');
            if (!button) {
                return;
            }
            button.onclick = () => {
                fetch(`${myGlobal.url}like/${divElement.dataset.post_id}`, {
                    method: "POST",
                    headers: {
                        "X-CSRFToken": myGlobal.csrftoken
                    }
                })
                .then(async res => [res.ok, await res.json()])
                .then(([ok, res]) => {
                    if (!ok) {
                        console.log(res);
                        return;
                    }
                    button.innerHTML = res.liked ? "Unlike": "Like";
                    divElement.querySelector('#like_count').innerHTML = `${res.likes} ${res.likes===1 ? "like": "likes"}`
                })
            }
        }
    )
}

export function generateRenderPostFn(){
    return (post) => {
        const userIsAuthor = () => post.username === myGlobal.user;

        return `
        <div class="card border-secondary mb-3" id='post_${post.id}' >
            <div class="card-header container text-center">
                <div class='row'>
                    <div class='col-md-auto'>
                        <a href='${myGlobal.url}profile/${post.username}'>${post.username}</a>
                        &emsp;
                        <small>${post.created}</small>
                    </div>
                    ${ userIsAuthor() ?
                        `
                        <div class='col col-lg-2 float-right'>
                            <button id='btn_delete_${post.id}' class='btn btn-outline-danger' data-post_id=${post.id}>Delete</button>
                        </div>
                        `
                        :
                        ""
                    }
                </div>
            </div>
            <div class="card-body">
                <div class='card'>
                    <div class='card-body row'>
                        <div class='col-md-auto'>
                            <p class="card-text">${post.text}</p>
                        </div>
                        <div class='col col-lg-2'>
                            ${userIsAuthor() ? `<button class="btn btn-secondary" id="btn_edit_${post.id}" data-post_id=${post.id}>Edit</button>` : ''}
                        </div>
                    </div>
                </div> 
                <div class='card-body' id='comments_post_${post.id}'>
                </div>
                <div id='div_like_${post.id}' data-post_id=${post.id}>
                    ${(!userIsAuthor() & userAuthenticated(myGlobal.user)) ? `<button class="btn btn-primary" id="like">${ post.liked ? "Unlike":"Like" }</button>` : ''}
                    <span id='like_count'><a href='${myGlobal.url}post/${post.id}/likes'>${post.likes} ${post.likes===1 ? 'like': 'likes'}</a></span>
                </div>
            </div>
        </div>
        `;
    }
}

export function generateFetchPostsFn(url){
    return async () => {
        const posts = await fetch(url)
                            .then(response => response.json());
        return posts;
    }
}