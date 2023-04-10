import { updatePost, deletePost } from "./logic.js";
const formUpdatePost = document.querySelector("#modalUpdatePost .form-Update-post");
const title = document.querySelector("#modalUpdatePost .form-Update-post .title");
const body = document.querySelector("#modalUpdatePost .form-Update-post .body");
const image = document.querySelector("#modalUpdatePost .form-Update-post .image");
const btnDelete = document.querySelector("#modalDelete .delete");

formUpdatePost.addEventListener("submit", function name(e) {
    e.preventDefault();
    updatePost(title.value, body.value, image.files[0]);
})

btnDelete.addEventListener("click", function () {
    deletePost();
})

