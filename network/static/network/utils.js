
export function renderComments(comments, postId, {user, csrftoken}) {
    const renderComment = (c) => {
        return `
        <div class='card-text'>
            <span><a href="http://127.0.0.1:8000/profile/${c.user}">${c.user}</a>:</span>
            <span>${c.text}</span>
            &emsp;
            <span><small>${c.created}</small></span>
            ${user===c.user? "<button class='close' type='button'>&times;</button>" : ""}
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
    const commentValue = document.querySelector(`#comment_input_${form.dataset.post_id}`).value;

    if (commentValue === "") {
        return false;
    }

    fetch(`http://127.0.0.1:8000/comment/${form.dataset.post_id}`, {
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
        fetch(`http://127.0.0.1:8000/comments/${form.dataset.post_id}`)
        .then(response => response.json())
        .then(comments => {
            document.querySelector('#comments').innerHTML = renderComments(comments, form.dataset.post_id, myGlobal);
            document.querySelector(`#${form.id}`).onsubmit = () => commentFormSubmit(form);
        })
    }
    )

    return false;
}

export function displayPosts(posts, renderPost, postDivId = "posts"){
    // fill in inner HTML
    if (posts.length === 0) {
        document.querySelector(`#${postDivId}`).innerHTML += "There is no post yet."
    } else {
        document.querySelector(`#${postDivId}`).innerHTML += posts.map(renderPost).join('');
    }
    
    // add comment delete buttons actions
    document.querySelectorAll('button[id*=btn_delete_]')
    .forEach( (button) => {
        button.onclick = () => {
            console.log(`clicked ${button.id}`)
        }
    });

    // add comment form submit actions
    document.querySelectorAll('form[id*=comment_]')
    .forEach( form => {
        form.onsubmit = () => commentFormSubmit(form)
    })
}

export function generateRenderPostFn(){
    return (post) => {
        const userIsAuthor = () => post.username === myGlobal.user;
    
        return `
        <div class="card border-secondary mb-3" >
            <div class="card-header container text-center">
                <div class='row'>
                    <div class='col-md-auto'>
                        <a href='http://127.0.0.1:8000/profile/${post.username}'>${post.username}</a>
                        &emsp;
                        <small>${post.created}</small>
                    </div>
                    ${ userIsAuthor() ?
                        `
                        <div class='col col-lg-2'>
                            <button id='btn_delete_${post.id}' class='btn btn-outline-danger'>Delete</button>
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
                            ${userIsAuthor() ? `<button class="btn btn-secondary" id="btn_edit_${post.id}">Edit</button>` : ''}
                        </div>
                    </div>
                </div> 
                <div class='card-body' id='comments'>
                    ${ renderComments(post.comments, post.id, myGlobal) }
                </div>
                <div>
                    ${(!userIsAuthor() & userAuthenticated()) ? '<a href="#" class="btn btn-primary">Like</a>' : ''}
                    <span>${post.likes} ${post.likes===1 ? 'like': 'likes'}</span>
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