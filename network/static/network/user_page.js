import { displayPosts, generateFetchPostsFn, generateRenderPostFn } from "./utils.js";

const renderPost = generateRenderPostFn();

const fetchPosts = generateFetchPostsFn(`http://127.0.0.1:8000/posts/${myGlobal.viewedUser}`);

document.addEventListener('DOMContentLoaded', () => {
    fetchPosts().then(posts => displayPosts(posts, renderPost, "user_posts"));

    fetch(`http://127.0.0.1:8000/profile/${myGlobal.viewedUser}/detail`)
    .then(response => response.json())
    .then(detail => {
        if (detail.i_am_follower === null){
            return;
        }
        
        const btnFollow = document.querySelector('#btn_follow');
        if (btnFollow !== null) {
            btnFollow.innerHTML = detail.i_am_follower ? "Unfollow" : "Follow";
            btnFollow.onclick = async () => {
                const detail = await fetch(`http://127.0.0.1:8000/profile/${myGlobal.viewedUser}/detail`).then(response => response.json());
                const data = await fetch(`http://127.0.0.1:8000/follow/${myGlobal.viewedUserId}?status=${!detail.i_am_follower}`).then(response => response.json());
                if (data.error) {
                    console.log(data.error);
                    return
                }
                document.querySelector('#followers').innerHTML = `${data.followers} Followers`;
                document.querySelector('#following').innerHTML = `${detail.following} Following`;
                btnFollow.innerHTML = !detail.i_am_follower ? "Unfollow" : "Follow";
            }
        }
    })
})