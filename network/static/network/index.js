import { displayPosts, generateFetchPostsFn, generateRenderPostFn } from "./utils.js";

const renderPost = generateRenderPostFn();

const fetchPosts = generateFetchPostsFn('http://127.0.0.1:8000/posts');

document.addEventListener('DOMContentLoaded', () => {

    if (myGlobal.user){
        const divNewPost = document.querySelector('#new_post'); 
    
        function renderNewPostForm() {
            return `
            <div class='card-body card border-secondary'>
                <h3>New Post</h3>
                <div id='message'></div>
                <form method="POST" action=${myGlobal.url_new_post} id='form_new_post'>
                    <input type='hidden' name='csrfmiddlewaretoken' value='${myGlobal.csrftoken}'>
                    <textarea class='form-control' id='post_text' name='post_text'></textarea>
                    <br>
                    <div>
                        <input type='submit' class='btn btn-primary' value='Create Post'></input>
                    </div>
                </form>
                <button id='btn_cancel' class='btn btn-primary'>Close</button>
            </div>
            `
        }
        
        function newPostForm(status) {
            if (status) {
                divNewPost.innerHTML = renderNewPostForm();
                document.querySelector('#form_new_post').onsubmit = () => {
                    const postText = document.querySelector('#post_text');

                    if (postText.value === null | postText.value.length === 0) {
                        document.querySelector('#message').innerHTML = "<p style='color: red;'>Post cannot be empty.</p>";
                        return false;
                    }
                }
                document.querySelector('#btn_cancel').onclick = () => newPostForm(false) ;
            } else {
                divNewPost.innerHTML = '<button class="btn btn-primary" id="btn_new_post">New Post</button>';
                document.querySelector('#btn_new_post').onclick = () => newPostForm(true) ;
            }
        }
    
        newPostForm(false);
    }

    fetchPosts()
    .then(posts => displayPosts(posts, renderPost));

})