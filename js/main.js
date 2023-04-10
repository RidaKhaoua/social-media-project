import { getPosts, getMorePost, isLoged, updateLinkProfile } from "./logic.js";


getPosts();
isLoged();

updateLinkProfile();

window.addEventListener("scroll", function (params) {
    getMorePost();
})