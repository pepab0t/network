import { displayPosts, generateFetchPostsFn, generateRenderPostFn } from "./utils.js";

const renderPost = generateRenderPostFn();
const fetchPosts = generateFetchPostsFn(`${myGlobal.url}following_posts`)

document.addEventListener('DOMContentLoaded', () => {
    fetchPosts()
    .then(posts => displayPosts(posts, renderPost));
})