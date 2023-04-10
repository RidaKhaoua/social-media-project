import { createPost } from "./logic.js";

const formAddPost = document.querySelector("#modalAddPost .form-add-post");
const inputTitle = document.querySelector("#modalAddPost .form-add-post .title");
const inputImage = document.querySelector("#modalAddPost .form-add-post .image");
const inputBody = document.querySelector("#modalAddPost .form-add-post .body");

formAddPost.addEventListener("submit", function (e) {
    e.preventDefault();
    createPost(inputTitle.value, inputBody.value, inputImage.files[0]);
})