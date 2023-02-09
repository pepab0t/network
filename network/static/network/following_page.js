import { displayPosts, generateFetchPostsFn, generateRenderPostFn } from "./utils.js";

const renderPost = generateRenderPostFn();
const fetchPosts = generateFetchPostsFn('http://127.0.0.1:8000/following_posts')

document.addEventListener('DOMContentLoaded', () => {
    fetchPosts()
    .then(posts => displayPosts(posts, renderPost));
})