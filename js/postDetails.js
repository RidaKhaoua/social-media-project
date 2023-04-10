import {removeLoader, isLoged, getPost, updateLinkProfile} from "./logic.js";

const urlParams = new URLSearchParams(window.location.search);
const postId = urlParams.get("id");
console.log(urlParams.get("id"))

removeLoader();
isLoged();
updateLinkProfile();
getPost(postId);



