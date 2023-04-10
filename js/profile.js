import { isLoged, userInfo, updateLinkProfile, getPostUsers } from "./logic.js";

const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get("id");
console.log(urlParams.get("id"));

isLoged();

updateLinkProfile();

userInfo(userId);
getPostUsers(userId);