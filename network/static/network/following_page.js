import { generateFetchPostsFn, generateRenderPostFn } from "./utils.js";

const renderPost = generateRenderPostFn(myGlobal);
const fetchPosts = generateFetchPostsFn('http://localhost:8000/following_posts')

function displayPosts(posts) {
    document.querySelector('#posts').innerHTML += posts.map(renderPost).join('');
}

document.addEventListener('DOMContentLoaded', () => {
    fetchPosts()
    .then(displayPosts);
})