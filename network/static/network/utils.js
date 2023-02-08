
export function generateRenderPostFn(myGlobal){
    return (post) => {
        const userIsAuthor = () => post.username === myGlobal.user;
        const userAuthenticated = () => myGlobal.user !== undefined;
    
        return `
        <div class="card border-secondary mb-3" >
            <div class="card-header">
                <a href='http://localhost:8000/profile/${post.username}'>${post.username}</a>
                &emsp;
                <small>${post.created}</small>
            </div>
            <div class="card-body">
                <p class="card-text">${post.text}</p>
            </div>
            ${userIsAuthor() ? '<a href="#">Edit</a>' : ''}
            <div>
                <div>
                    <p >comment</p>
                </div>
                ${ userAuthenticated() ?
                    `<form>
                        <input type='text' placeholder='Write a comment..'>
                        <input type='submit' value='Comment'>
                    </form>` : ""
                }
            </div>
            <div>
                ${(!userIsAuthor() & userAuthenticated()) ? '<a href="#" class="btn btn-primary">Like</a>' : ''}
                <span>${post.likes} ${post.likes===1 ? 'like': 'likes'}</span>
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