function buildUserCard(user) {
    return `
        <div class="box user-btn" onclick="handleUserClick('${user.url}')">
            <img class="user-img user-btn" src="${user.avatar_url}"/>
            <p class="user-btn">${user.login}</p>
        </div>
    `;
}

export function renderUsers() {
    let aside = document.getElementById("aside-users");
    let usersPage = appState.users[appState.page-1];
    let arrUsers = usersPage.map(buildUserCard);

    var div = document.createElement("div");
    div.classList.add("aside-page");
    div.innerHTML = arrUsers.join("");

    aside.appendChild(div); 
}

export function renderModal(user) {
    const wrapper = document.getElementById("modal-wrapper");

    const modal = `
    <div class="modal is-active">
        <div class="modal-background"></div>
        <div class="modal-content">
            <div class="box">
                <article class="media">
                    <div class="media-left">
                    <figure class="image is-64x64">
                        <img class="" src="${user.avatar_url}" />
                    </figure>
                    </div>
                    <div class="media-content">
                    <div class="content">
                        <p>
                        <strong>${user.name}</strong> <small>${user.login}</small>
                        <br>
                        ${user.bio || "Bio not available"}
                        </p>
                    </div>

                    </div>
                </article>
            </div>
        </div>
        <button onClick="closeModal()" class="modal-close is-large" aria-label="close"></button>
    </div>`;

    wrapper.innerHTML = modal;
}