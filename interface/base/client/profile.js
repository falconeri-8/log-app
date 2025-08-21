import {notify} from "./utilities.js";

let profileId = 'default'
let currentPage = 1;
let totalPages = 1;

async function updatePagination(sorting) {
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const pageInfo = document.getElementById('pagination-info');

    prevBtn.disabled = !sorting.previous;
    nextBtn.disabled = !sorting.next;

    pageInfo.textContent = `${sorting.start}-${sorting.end} of ${sorting.count}`
}

async function renderProfiles(page = 1, limit = 10, search = '') {

    try {
        const response = await fetch('/api/profiles/filtered', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                page,
                limit,
                search
            })
        })
        const data = await response.json();

        if (!data.profiles || data.profiles.length === 0) {
            notify('No Profiles Found');
            return;
        }

        if (data.success) {
            currentPage = page;
            totalPages = data.sorting.pages;

            updatePagination(data.sorting);

            const profiles = data.profiles;
            const table_body = document.getElementById('table-body');
            while (table_body.firstChild) {
                table_body.removeChild(table_body.firstChild);
            }
                profiles.forEach(profile => {
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
                button.textContent = 'VIEW'
                button.addEventListener('click', () => displayProfile(profile));
                row.addEventListener('click', () => displayProfile(profile));
                actionsCol.appendChild(button);
                row.appendChild(dataCol);
                row.appendChild(actionsCol);
                table_body.appendChild(row);
            })
        } else {
            notify('Unidentified Profile');
        }
    } catch (error) {
        notify('Error fetching profiles');
    }
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
            await renderProfiles(); // await renderProfiles(currentPage);
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

async function displayProfile(profile) {
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
            await renderProfiles(1, 10, input);
        } else {
            notify('Empty Search', 2000);
            await renderProfiles(1);
        }
    }
}

async function profileInterface() {
    document.getElementById("profile-image").onclick = setImage;
    document.getElementById("fresh-profile").onclick = freshProfile;
    document.getElementById("search").onkeyup = filterProfile;
    document.getElementById("save-profile").onclick = saveProfile;
    document.getElementById('prev-btn').onclick = () => {
        if (currentPage > 1) {
            renderProfiles(currentPage - 1);
        }
    };
    document.getElementById('next-btn').onclick = () => {
        if (currentPage < totalPages) {
            renderProfiles(currentPage + 1);
        }
    };
    await renderProfiles();
}

window.displayProfile = displayProfile;

export { profileInterface };