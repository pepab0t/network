
console.log('Javascript is Running');


function renderPost(post){
    return `
    <div>${post.user}</div>
    <div>${post.text}</div>
    <br>
    `;
}

function displayPosts(posts){
    document.querySelector('#posts').innerHTML += posts.map(renderPost).join('');
}

async function fetchPosts(){
    const posts = await fetch('http://localhost:8000/posts')
                        .then(response => response.json());

    return posts;
}

document.addEventListener('DOMContentLoaded', () => {
    const divNewPost = document.querySelector('#new_post'); 

    function renderNewPostForm() {
        return `
        <div>
            <h3>New Post</h3>
            <form method="POST" action=${myGlobal.url_new_post}>
                <input type='hidden' name='csrfmiddlewaretoken' value='${myGlobal.csrftoken}'>
                <textarea id='post_text' name='post_text'></textarea>
                <br>
                <input type='submit' class='btn btn-primary' value='Create Post'></input>
            </form>
            <div>
                <button id='btn_cancel' class='btn btn-primary'>Close</button>
            </div>
        </div>
        `
    }
    
    function newPostForm(status) {
        if (status) {
            divNewPost.innerHTML = renderNewPostForm();
            document.querySelector('#btn_cancel').onclick = () => newPostForm(false) ;
        } else {
            divNewPost.innerHTML = '<button class="btn btn-primary" id="btn_new_post">New Post</button>';
            document.querySelector('#btn_new_post').onclick = () => newPostForm(true) ;
        }
    }

    
    newPostForm(false);
    fetchPosts().then(displayPosts);

})