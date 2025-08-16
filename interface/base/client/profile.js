import {notify} from "./utilities.js";

let profileId = 'default'

async function getProfile() {

}

async function setImage() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';

    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            notify('Image size limit 5MB', 2000);
            return;
        }

        try {
            const reader = new FileReader();
            reader.onload = function (e) {
                document.getElementById('profile-image').src = e.target.result;
                notify('Image Updated', 2000);
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('Error setting image:', error);
            notify('Error setting image', 2000);
        }
    };

    input.click();
}

async function saveProfile() {
    const name = document.getElementById("profile-name").value;
    const contact = document.getElementById("profile-contact").value;
    const description = document.getElementById("profile-description").value;
    // const image = document.getElementById("profile-image").src;
    const date = new Date().toISOString().split('T')[0];

    if (!name || !contact) {
        notify('Name and contact are required', 2000);
        return;
    }

    const token = localStorage.getItem('authToken');
    if (!token) {
        notify('Please login first', 2000);
        return;
    }

    try {
        const response = await fetch(`/api/profiles/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                name,
                contact,
                description,
            })
        })
        const data = await response.json();
        if (data.success) {
            notify(data.message, 2000);
        } else {
            notify(data.message, 2000);
        }
    } catch (error) {
        notify('Error saving profile', 2000);
    }
}

async function freshProfile() {
    document.getElementById("profile-name").value = '';
    document.getElementById("profile-contact").value = '';
    document.getElementById("profile-date").value = '';
    document.getElementById("profile-description").value = '';
    document.getElementById("profile-image").src = '';
    profileId = 'default';
}

async function displayProfile(data) {
    const profile = data.profile;
    profileId = profile.id;
    document.getElementById("profile-name").value = profile.name;
    document.getElementById("profile-contact").value = profile.contact;
    document.getElementById("profile-date").value = profile.dateofcreation;
    document.getElementById("profile-description").value = profile.description;
}

async function filterProfile(event) {
    event.preventDefault();
    if (event.key === 'Enter') {
        const input = document.getElementById("search").value;
        if (input) {
            const response = await fetch(`/api/profiles/name/${input}`);
            const data = await response.json();
            if (data.success) {
                const profile = data.profile;
                const table_body = document.getElementById('table-body');
                const row = document.createElement('div');
                row.className = 'table-row';
                const dataCol = document.createElement('div');
                dataCol.className = 'data-col';
                dataCol.innerHTML = `
                    <div class="data-name">
                    ${profile.name}
                    </div>
                    <div class="data-date">
                    ${profile.dateofcreation}
                    </div>
                `;
                const actionsCol = document.createElement('div');
                actionsCol.className = 'actions-col';

                const button = document.createElement('button');
                button.className = 'btn';
                button.textContent = 'VIEW';
                button.addEventListener('click', () => displayProfile(data));

                actionsCol.appendChild(button);
                row.appendChild(dataCol);
                row.appendChild(actionsCol);

                while (table_body.firstChild) {
                    table_body.removeChild(table_body.firstChild);
                }
                table_body.appendChild(row);

            } else {
                notify('Unidentified Profile', 2000);
            }
        } else {
            notify('Empty Search', 2000);
        }
    }
}

async function profileInterface() {
    document.getElementById("profile-image").onclick = setImage;
    document.getElementById("fresh-profile").onclick = freshProfile;
    document.getElementById("search").onkeyup = filterProfile;
    document.getElementById("save-profile").onclick = saveProfile;
}

window.displayProfile = displayProfile;

export { profileInterface };