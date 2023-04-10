const URL = "https://tarmeezacademy.com/api/v1";

let pageIndex = 0;
let lastIndex = 1;

const containerOfPosts = document.querySelector(".section-posts .posts");
const loading = document.querySelector(".loading");

const loadingBottom = document.querySelector(".loading-bottom");


const singInContent =  document.querySelector(".header .login .sing-in");

const logoutContent = document.querySelector(".header .login .logout");

const addPost = document.querySelector(".add-post");



/* work with api */
async function loginUser(name, paswd) {
    let response = await fetch(`${URL}/login`, {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
        body: JSON.stringify({
            username: name,
            password: paswd,
        }),
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
    });
    try {
        let data = await response.json();
        if(!response.ok) {
            throw new Error("error").data = data;
        }
        saveToken(data.token);
        saveDataUserInLocalStorage(data);
        hideModale("modalLogin");
        setupUi();
        showUser();
        clearForm(".form-login");
        showAlert("login succsess", "success");
        // userInfo(data.user.id);
        updateLinkProfile();
        pageIndex = 0;
        document.querySelector(".posts").textContent = "";
        setTimeout(() => {
          getPosts();
        }, 500);

    } catch (error) {   
        const {message,errors} = error;
        showError(".form-login",errors, message);
    }
}

async function register(name, username, password, img) {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("username", username);
    formData.append("password", password);
    formData.append("image", img);

    let response = await fetch(`${URL}/register`, {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
        body: formData,
        headers: {
          Accept: "application/json",
        },
    });

    try {
        let data = await response.json();
        console.log(data);
        if (!response.ok) {
            throw (new Error("error").data = data);
        }
        saveToken(data.token);
        saveDataUserInLocalStorage(data);
        hideModale("modalRegister");
        showUser();
        setupUi();
        showAlert("Register Success", "success");
        clearForm(".form-register");
    } catch (error) {
        const { message, errors } = error;
        console.log(error);
        showError(".form-register", errors, message);
        console.log("error", error);
    }
}


async function getPosts() {
  let response = await fetch(`${URL}/posts?page=${pageIndex}`);
  try {
    let data = await response.json();
    if(!response.ok) {
      throw new Error("error").data = data;
    }
    const { current_page, last_page } = data.meta;
    pageIndex = current_page;
    pageIndex += 1;
    lastIndex = last_page;
    showPosts(data.data);
    removeLoader();
    loadingBottom.classList.remove("show");
  } catch (error) {
    const {message} = error;
    showAlert(message);
    console.error(error);
  }
}

async function getPostUsers(idUser) {
  let response = await fetch(`${URL}/users/${idUser}/posts`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });
  try {
    let data = await response.json();
    if (!response.ok) {
      throw (new Error("error").data = data);
    }
    const reversData = data.data.reverse();
    console.log(reversData);
    showPosts(reversData);

    
    removeLoader();
  } catch (error) {
    const { message } = error;
    showAlert(message);
    console.error(error);
  }
}

function getMorePost() {
  let valueBottomOfWindow = document.body.offsetHeight;
  let sizeOfWindow = window.innerHeight + window.scrollY;
  if (sizeOfWindow >= valueBottomOfWindow && pageIndex <= lastIndex) {
    loadingBottom.classList.add("show");
    getPosts();
  }
}

/**
 * get Post by id
 * @param {*} id 
 */
async function getPost(id) {
  let response = await fetch(`${URL}/posts/${id}`);
  try {
    let data = await response.json();
      if(!response.ok) {
        throw new Error("error").data = data;
      }
      const {
        id,
        author: {id:id_user, profile_image, name },
        created_at,
        title,
        image,
        comments,
        comments_count,
        body,
        tags,
      } = data.data;
      postUi(id, profile_image, name, created_at, title, image, comments_count, body, tags,"appendChild", id_user);
      commentsUi(comments, image);
    } catch (error) {
    console.log(error);
  }
}

async function createPost(title, body, image) {
    loading.classList.add("show");
    let formData = new FormData();
    formData.append("title", title);
    formData.append("body", body);
    formData.append("image", image)
    
    let response = await fetch(`${URL}/posts`, {
      method: "POST",
      // mode: "cors",
      // credentials: "same-origin",
      body: formData,
      headers: {
        // "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${getTocken()}`,
        Accept: "application/json",
      },
    });

    try {
        let data = await response.json();
        if(!response.ok) {
            throw new Error("error").data = data;
        }
        console.log(data.data);
        const {
            id,
            author: { id: user_id, profile_image, name },
            created_at,
            title,
            image,
            comments_count,
            body,
            tags,
        } = data.data;
        postUi(
            id,
            profile_image,
            name,
            created_at,
            title,
            image,
            comments_count,
            body,
            tags,
            "prepend",
            user_id
        );
        showAlert("Post is inserted", "success");
        loading.classList.remove("show");
        hideModale("modalAddPost");
    } catch (error) {
      const {errors} = error;
      loading.classList.remove("show");
      if(errors.hasOwnProperty("image")) {
        showAlert(errors.image[1], "danger");
      } else {
        showAlert(errors.body[0], "danger");
      }
      
    }
}

async function updatePost(titlePost, bodyPost, imagePost) {
  const loading = document.querySelector("#modalUpdatePost .loading"); 
  if(localStorage.getItem("postId")) {
    loading.classList.add("show");
    const postId = localStorage.getItem("postId");
      let formData = new FormData();
      formData.append("title", titlePost);
      formData.append("body", bodyPost);
      formData.append("image", imagePost);
      formData.append("_method", "put");
    let response = await fetch(`${URL}/posts/${postId}`, {
      method: "POST",
      mode: "cors",
      cache: "no-cache",
      credentials: "same-origin",
      body: formData,
      headers: {
        Authorization: `Bearer ${getTocken()}`,
        Accept: "application/json",
      },
    });
    try {
      let data = await response.json();
      
      if(!response.ok) {
        throw new Error("error").data = data;
      } else {
        const { title, body, image } = data.data;
        updateUiPost(title, body, image);
        showAlert("the post is Updated", "success");
        loading.classList.remove("show");
        hideModale("modalUpdatePost");
      }
    } catch (error) {
      const {message} = error;
      loading.classList.remove("show");
      showAlert(message, "danger");
      console.log(error);
    }
  }
}

async function deletePost(btn) {
  const idPost = localStorage.getItem("postId");
  const cardPost = document.querySelector(`[data-id="${idPost}"]`);
  
  let response = await fetch(`${URL}/posts/${idPost}`, {
    method: "DELETE",
    headers: {
      // "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${getTocken()}`,
      Accept: "application/json",
    },
  });
  try {
    let data = await response.json();
    if(!response.ok) {
      throw new Erorr("error").data = data.data;
    }
    showAlert("The post Deleted", "sucsses");
    hideModale("modalDelete");
    cardPost.remove();
  } catch (error) {
    const {message} = error;
    showAlert(message, "danger");
    console.error(error);
  }
}

async function addComment(id, bodyComment) {
  let response = await fetch(`${URL}/posts/${id}/comments`, {
    method: "POST",
    mode: "cors",
    cache: "no-cache",
    credentials: "same-origin",
    
    body: JSON.stringify({
      body: bodyComment
    }),
    
    headers: {
      Authorization: `Bearer ${getTocken()}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    
  });

  try {
    let data = await response.json();
    if (!response.ok) {
      throw (new Error("error").data = data);
    }
    const commentsContainer = document.querySelector(
      ".section-posts .posts .card .comments"
    );
    console.log(data);
    const {
      author: { id, profile_image, username },
      body,
    } = data.data;
    commentsContainer.appendChild(displayComment(id, profile_image, username, body));
    showAlert("the comments insert", "success");
  } catch (error) {
    const {message} = error;
    console.log(error);
    showAlert(message, "danger");
    console.log(error);
  }
}

async function userInfo(idUser) {
  const emailUser = document.querySelector(".section-profile .info .email");
  const imageUser = document.querySelector(".section-profile .img");
  const fullName = document.querySelector(".section-profile .info .name");
  const userName = document.querySelector(".section-profile .info .user-name");
  const numberPost = document.querySelector(
    ".section-profile  .number-posts .number"
  );
  const numberComment = document.querySelector(
    ".section-profile  .number-comments .number"
  );
  const postTitleName = document.querySelector(".section-profile .posts .title");
  let respone = await fetch(`${URL}/users/${idUser}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });
  try {
    let data = await respone.json();
    if (!respone.ok) {
      throw (new Error("error").data = data);
    }
    const { id, name,email ,posts_count, comments_count, profile_image, username } =
      data.data;
    imageUser.src =
      Object.keys(profile_image).length != 0
        ? profile_image
        : "./images/yorum-icon-avatar-men-300x300.png";
    emailUser.textContent = email;
    userName.textContent = username;
    fullName.textContent = name;
    numberPost.textContent = posts_count;
    numberComment.textContent = comments_count;
    postTitleName.textContent += username;
  } catch (error) {
    const { message } = error;
    console.error(message);
  }
  
}

/* end work with api */

/* validation */
function showError(formName, error, message) {
    const form = document.querySelector(`${formName}`);
    form.classList.remove("was-validated");
    if (formName === ".form-login") {
        const showError = document.querySelector(`${formName} .show-error`);
        showError.textContent = "";
        if (!checkPassword(formName, error) && !checkUserName(formName, error)) {
            showError.textContent = message;
        }
    } else {
        checkUserName(formName, error);
        checkPassword(formName, error);
    }
}

function checkUserName(formName, error) {
    const inputUserName = document.querySelector(`${formName} input.username`);
    const invalideFeedbackUserName = document.querySelector(
        `${formName} .invalid-feedback.username`
    );
    if(typeof error === "object"){
        if (error.hasOwnProperty("username")) {
          inputUserName.classList.add("is-invalid");
          invalideFeedbackUserName.textContent = error.username[0];
          return true;
        } else {
          inputUserName.classList.remove("is-invalid");
          inputUserName.classList.add("is-valid");
        }
    }
    return false;
}

function checkPassword(formName, error) {
    const inputPassWord = document.querySelector(`${formName} input.password`);

    const invalideFeedbackPassword = document.querySelector(
        `${formName} .invalid-feedback.password`
    );
    if(typeof error === "object") {
        if (error.hasOwnProperty("password")) {
            inputPassWord.classList.add("is-invalid");
            invalideFeedbackPassword.textContent = error.password[0];
            return true;
        } else {
            inputPassWord.classList.remove("is-invalid");
            inputPassWord.classList.add("is-valid");
        }
    }
    
    return false;
}

function validateForm(elem) {
  if (elem.checkValidity()) {
    return true;
  }
  elem.classList.add("was-validated");
  return false;
}

function getTocken(params) {
    if(localStorage.getItem("token")) {
        const token = localStorage.getItem("token");
        return token;
    } 
}

/* validation */


/* display  data*/

function showUser(params) {
  if (localStorage.getItem("token")) {
    const getDataUser = JSON.parse(localStorage.getItem("user"));
    const { username, id, profile_image } = getDataUser;
    const infoUser = document.querySelector(".header .login .info-user a");
    const link = document.createElement("a");
    link.href =`profile.html?id=${id}`;
    const imgUser = document.createElement("img");
    imgUser.src =
      Object.keys(profile_image).length > 0
        ? profile_image
        : "../images/yorum-icon-avatar-men-300x300.png";
    imgUser.alt = "image user";
    link.appendChild(imgUser)
    infoUser.appendChild(link);

    const nameUser = document.createElement("span");
    nameUser.textContent = username;
    infoUser.appendChild(nameUser);
  }
}


function showPosts(data) {
    if (Array.isArray(data)) {
        return data.map((item) => {
        const {
            id,
            author: {id:id_user, profile_image, name },
            created_at,
            title,
            image,
            comments_count,
            body,
            tags,
        } = item;
        
        postUi(
          id,
          profile_image,
          name,
          created_at,
          title,
          image,
          comments_count,
          body,
          tags,
          "appendChild",
          id_user
        );
        
        });
    }
}

function postUi(id,profile_image, name, created_at, title, image, comments_count, body, tags, nameMethode ,id_user="") {
        const card = document.createElement("div");
        card.className += "card shadow mt-3";
        card.dataset.id = id;
        const cardHeader = document.createElement("div");
        cardHeader.className += "card-header d-flex align-items-center";
        const link = document.createElement("a");
        link.href = `profile.html?id=${id_user}`;
        const imgUser = document.createElement("img");
        imgUser.className += "border border-2 rounded-circle";
        imgUser.src =
            Object.keys(profile_image).length > 0
                ? profile_image
                : "../images/yorum-icon-avatar-men-300x300.png";
        imgUser.alt = "image user";
        link.appendChild(imgUser);
        cardHeader.appendChild(link);

        const nameUser = document.createElement("span");
        nameUser.className += "fw-bold";
        nameUser.textContent = "@" + name;
        cardHeader.appendChild(nameUser);
        card.appendChild(cardHeader);

        if(localStorage.getItem("user")) {
          const data = JSON.parse(localStorage.getItem("user"));
          if (data.id === id_user) {
            cardHeader.appendChild(createtUpdateBtn(title, body));
            cardHeader.appendChild(createDeleteBtn());
          }

        }
        

        const cardBody = document.createElement("div");
        cardBody.className += "card-body";
        cardBody.setAttribute("role", "button");

        const imgPost = document.createElement("img");
        imgPost.className += "img-fluid rounded mb-2 image ";
        imgPost.src =
            Object.keys(image).length > 0
                ? image
                : "../images/maison-nature-scaled.jpg";
        imgPost.alt = "image nature";
        cardBody.appendChild(imgPost);

        const time = document.createElement("p");
        time.className += "card-text fw-bold text-secondary";
        time.textContent = created_at;
        cardBody.appendChild(time);

        const cardTitle = document.createElement("h5");
        cardTitle.className += "card-title";
        cardTitle.textContent = title || "Unkonw";
        cardBody.appendChild(cardTitle);

        const description = document.createElement("p");
        description.className += "card-text body";
        description.textContent = body;
        cardBody.appendChild(description);

        const hr = document.createElement("hr");
        cardBody.appendChild(hr);

        const comments = document.createElement("div");
        comments.className += "number-comments";

        const icon = ` <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pen"
                    viewBox="0 0 16 16">
                    <path
                        d="m13.498.795.149-.149a1.207 1.207 0 1 1 1.707 1.708l-.149.148a1.5 1.5 0 0 1-.059 2.059L4.854 14.854a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.606-.606l1-4a.5.5 0 0 1 .131-.232l9.642-9.642a.5.5 0 0 0-.642.056L6.854 4.854a.5.5 0 1 1-.708-.708L9.44.854A1.5 1.5 0 0 1 11.5.796a1.5 1.5 0 0 1 1.998-.001zm-.644.766a.5.5 0 0 0-.707 0L1.95 11.756l-.764 3.057 3.057-.764L14.44 3.854a.5.5 0 0 0 0-.708l-1.585-1.585z" />
                </svg>`;

        comments.innerHTML += icon;

        const numberComments = document.createElement("span");
        numberComments.textContent = `(${comments_count}) comments`;

        comments.appendChild(numberComments);

        displayTags(tags, comments);

        cardBody.appendChild(comments);

        card.appendChild(cardBody);
        cardBody.addEventListener("click", function (params) {
          window.location.href = `postDetails.html?id=${id}`;
        })
        containerOfPosts[nameMethode](card);
}

// this function for edit post 
function createtUpdateBtn(title, body) {
  const updatePost = document.createElement("p");
  updatePost.className += "flex-fill text-end fw-bold mb-2";
  updatePost.setAttribute("role", "button");
  updatePost.setAttribute("data-bs-toggle", "modal");
  updatePost.setAttribute("data-bs-target", "#modalUpdatePost");
  updatePost.textContent = "...";

    updatePost.addEventListener("click", function (e) {
      const titleInput = document.querySelector("#modalUpdatePost .title");
      const bodyInput = document.querySelector("#modalUpdatePost .body");
      titleInput.value = title;
      bodyInput.value = body;
      const id = this.parentElement.parentElement.getAttribute("data-id");
      localStorage.setItem("postId", id);
    });
    
  return updatePost;
}

function createDeleteBtn() {
  const btnDelete = document.createElement("button");
  btnDelete.className += "btn btn-danger ms-2 btn-delete";
  btnDelete.setAttribute("data-bs-toggle", "modal");
  btnDelete.setAttribute("data-bs-target", "#modalDelete");
  btnDelete.textContent = "Delete";
  btnDelete.addEventListener("click", function name(params) {
    let idPost = this.parentElement.parentElement.getAttribute("data-id");
    localStorage.setItem("postId", idPost);
  })
  return btnDelete;
}

function commentsUi(commentsData) {
  const containerPost = document.querySelector(".section-posts .posts .card");
  const commentsContainer = document.createElement("div");
  commentsContainer.className = "comments";
      containerPost.appendChild(commentsContainer);

  if(commentsData.length > 0) {
    commentsData.map((item) => {
      const {
        author: {id, profile_image, username },
        body,
      } = item;
      commentsContainer.appendChild(displayComment(id, profile_image, username, body));
    });
  } 
    formComment();
}

function formComment() {
  const commentsContainer = document.querySelector(".section-posts .posts .card");
  /* Comment form */
  const form = document.createElement("form");
  form.className = "form-comment row g-3 p-2";

  const inputContanier = document.createElement("div");
  inputContanier.className = "col-md-12 d-flex";

  const inputComment = document.createElement("input");
  inputComment.type = "text";
  inputComment.placeholder = "add comment...";
  inputComment.className = "form-control";
  inputContanier.appendChild(inputComment);

  const addBtn = document.createElement("button");
  addBtn.className = "btn btn-primary";
  addBtn.type = "submit";
  addBtn.textContent = "add";
  inputContanier.appendChild(addBtn);
  form.appendChild(inputContanier);
  commentsContainer.appendChild(form);

  //event
  form.addEventListener("submit", function name(e) {
    e.preventDefault();
    const input = document.querySelector(".form-comment input");
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get("id");
    addComment(postId, input.value);
    input.value = "";
  });
  /* End Comment form */
}

function displayComment(id_user,profile_image, username, body) {
  const comment = document.createElement("div");
  comment.className += "comment rounded-2 p-2 mb-2";
  /* comment top */
  const commentTop = document.createElement("div");
  commentTop.className = "comment-top mb-2";
  const link = document.createElement("a");
  link.href = `profile.html?id=${id_user}`;
  const img = document.createElement("img");
  img.className = "border border-2 rounded-circle";
  img.src =
    Object.keys(profile_image).length > 0
      ? profile_image
      : "../images/yorum-icon-avatar-men-300x300.png";
  img.alt = "image of user";
  link.appendChild(img);
  commentTop.appendChild(link);

  const name = document.createElement("span");
  name.textContent = username;
  commentTop.appendChild(name);

  comment.appendChild(commentTop);
  /*  end comment top */

  /*  comment bottom */
  const commentBottom = document.createElement("div");
  commentBottom.className = "comment-bottom";

  const bodyOfComment = document.createElement("p");
  bodyOfComment.textContent = body;
  commentBottom.appendChild(bodyOfComment);

  comment.appendChild(commentBottom);

  /*  End Comment bottom */
  return comment;
}

function displayTags(tags, parentElm) {
  if (tags.length > 0) {
    for (let tag of tags) {
      const span = document.createElement("span");
      span.className += "bg-secondary text-white rounded-75";
      span.textContent = tag.name;
      parentElm.appendChild(span);
    }
  }
}

function updateUiPost(titlePost, bodyPost, imagePost) {
  if (localStorage.getItem("postId")) {
    const id = localStorage.getItem("postId");
    const title = document.querySelector(`[data-id="${id}"] .card-title`);
    const body = document.querySelector(`[data-id="${id}"] .body`);
    const image = document.querySelector(`[data-id="${id}"] .image`);
    console.log(image);
    title.textContent = titlePost;
    body.textContent = bodyPost;
    image.src = imagePost;
  }
}


/* display data*/


/* interaction with browser */

function hideModale(modalName) {
  const modal = document.querySelector(`#${modalName}`);
  const modalInstance = bootstrap.Modal.getInstance(modal);
  modalInstance.hide();
}

function clearForm(formName) {
  const typeInputs = ["text", "password", "file"];
  const form = document.querySelector(`${formName}`);
  form.classList.remove("was-validate");

  if (formName === ".form-login") {
    const showError = document.querySelector(`${formName} .show-error`);
    showError.textContent = "";
  }

  const allInputs = [...form.elements];

  allInputs.forEach((item) => {
    if (typeInputs.includes(item.type)) {
      item.classList.remove("is-valid");
    }
  });
  form.reset();
}

function saveToken(token) {
  if (!localStorage.getItem("token")) {
    localStorage.setItem("token", token);
  }
}

function saveDataUserInLocalStorage({ user }) {
  if (!localStorage.getItem("user")) {
    localStorage.setItem("user", JSON.stringify(user));
  }
}

function removeLoader() {
    const loader = document.querySelector(".loader-content");
    if (Boolean(loader)) loader.remove();
}

function setupUi() {
  const token = localStorage.getItem("token");
  if (token !== null) {
    singInContent.classList.add("hidden");
    logoutContent.classList.add("show");
    if(addPost !== null) {
      addPost.classList.add("active");
    }
  } else {
    logoutContent.classList.remove("show");
    singInContent.classList.remove("hidden");
    if (addPost !== null) {
        addPost.classList.remove("active");
    }
  
  }
}

function showAlert(message, type) {
  const alertPlaceholder = document.querySelector(".alert-content");
  alertPlaceholder.className += ` alert alert-${type} active`;
  alertPlaceholder.textContent = message;

  setTimeout(() => {
    alertPlaceholder.classList.remove("active");
    alertPlaceholder.classList.remove(`alert-${type}`);
    alertPlaceholder.textContent = "";
  }, 3000);
}

function isLoged() {
  if (localStorage.getItem("token")) {
    showUser();
  }
  setupUi();
}

function logout(params) {
  const infoUser = document.querySelector(".header .login .info-user a");
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  setupUi();
  pageIndex = 0;
  document.querySelector(".posts").textContent = "";
  if(location.pathname.includes("home")) {
    setTimeout(() => {
      getPosts();
    }, 500);
  }
  infoUser.innerHTML = "";
  showAlert("logout successfully", "success");
  isNotInHomePage();
  updateLinkProfile();
}

function isNotInHomePage(params) {
  if(!location.pathname.includes("home.html")) {
    location.href = "home.html";
  }
}

function updateLinkProfile() {
  const linkProfile = document.querySelector(".header  a.profile-link");
  if (localStorage.getItem("user") || location.pathname.includes("profile.html")) {
      linkProfile.removeAttribute("data-bs-toggle", "modal");
      linkProfile.removeAttribute("data-bs-target", "#modalLogin");
    const data = JSON.parse(localStorage.getItem("user"));
    linkProfile.href += `?id=${data.id}`;
  } else {
    linkProfile.href = "profile.html";
    linkProfile.setAttribute("data-bs-toggle", "modal");
    linkProfile.setAttribute("data-bs-target", "#modalLogin");
  }
}


/* interaction with browser */


export {
    getPosts,
    getPost,
    getMorePost,
    createPost,
    updatePost,
    deletePost,
    userInfo,
    getPostUsers,
    validateForm,
    loginUser,
    isLoged,
    logout,
    register,
    removeLoader,
    updateLinkProfile,
}