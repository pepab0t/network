

function renderPost(post){
    console.log(post.username);
    console.log(myGlobal.user);

    return `
    <div class="card border-secondary mb-3" >
        <div class="card-header">
            <a href='http://localhost:8000/profile/${post.username}'>${post.username}</a>
            &emsp;
            <small>${post.created}</small>
        </div>
        <div class="card-body text-secondary">
            <p class="card-title">${post.text}</p>
        </div>
        ${post.username === myGlobal.user ? '<a href="#">Edit</a>' : ''}
        <div>
            <div>
                <p >comment</p>
            </div>
            ${ myGlobal.user !== undefined ?
                `<form>
                    <input type='text' placeholder='Write a comment..'>
                    <input type='submit' value='Comment'>
                </form>` : ""
            }
        </div>
        <div>
            ${(post.username !== myGlobal.user & myGlobal.user !== undefined) ? '<a href="#" class="btn btn-primary">Like</a>' : ''}
            <span>${post.likes} ${post.likes===1 ? 'like': 'likes'}</span>
        </div>
    </div>
    `;
}

function displayPosts(posts){
    document.querySelector('#user_posts').innerHTML += posts.map(renderPost).join('');
}


async function fetchPosts(){
    const posts = await fetch(`http://localhost:8000/post/${myGlobal.viewedUser}`)
                        .then(response => response.json());

    return posts;
}

document.addEventListener('DOMContentLoaded', () => {
    fetchPosts().then(displayPosts);
})