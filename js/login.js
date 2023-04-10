import { validateForm, loginUser, logout } from "./logic.js";


const formLogin = document.querySelector(".form-login");

const inputUserName = document.querySelector(".form-login input.username");

const inputPassWord = document.querySelector(".form-login input.password");

const btnLogOut = document.querySelector(".header .logout .btn-logout");


formLogin.addEventListener("submit", function (e) {
    e.preventDefault();
    if(validateForm(this)) {
        loginUser(inputUserName.value, inputPassWord.value);
    }
});

btnLogOut.addEventListener("click", function (params) {
    logout();
})
