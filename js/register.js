import { validateForm ,register } from "./logic.js";

const formRegister = document.querySelector(".form-register");

const inputFullName = document.querySelector(".form-register input.full-name");

const inputUserName = document.querySelector(".form-register input.username");

const inputPassWord = document.querySelector(".form-register input.password");

const inputImage = document.querySelector(".form-register input.image")


formRegister.addEventListener("submit", function (e) {
    e.preventDefault();
    if(validateForm(this)) {
        register(inputFullName.value, inputUserName.value, inputPassWord.value, inputImage.files[0]);
    }
})
