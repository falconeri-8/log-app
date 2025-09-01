// client/profile.js

import {notify, request} from "./utilities.js";

class Manager {

    Elements = {
        'prev-btn': null,
        'next-btn': null,
        'pagination-info': null,
        'table-body': null,
        'profile-name': null,
        'profile-contact': null,
        'profile-date': null,
        'profile-description': null,
        'profile-image': null,
        'search': null,
        'fresh-profile': null,
        'save-profile': null
    }

    constructor() {
        this.Profiles = [];
        this.CurrentProfile = null;
        this.CurrentPage = 1;
        this.TotalPages = 1;
        this.file = null;
    }

    async SetElements() {
        Object.keys(this.Elements).forEach(id => {
            this.Elements[id] = document.getElementById(id);
        })
        this.Elements["fresh-profile"].addEventListener('click', () => {
            this.CurrentProfile = null;
            this.file = null;
            this.Elements["profile-name"].value = '';
            this.Elements["profile-contact"].value = '';
            this.Elements["profile-date"].value = '';
            this.Elements["profile-description"].value = '';
            this.Elements["profile-image"].src = '';
        })
        this.Elements["search"].addEventListener('keyup', (event) => {
            this.Filter(event)
        })
        this.Elements["prev-btn"].addEventListener('click', () => {
            if (this.CurrentPage > 1) {
                this.Fetch(this.CurrentPage - 1);
            }
        })
        this.Elements["next-btn"].addEventListener('click', () => {
            if (this.CurrentPage < this.TotalPages) {
                this.Fetch(this.CurrentPage + 1);
            }
        })
        this.Elements["save-profile"].addEventListener('click', () => {
            this.Save();
        })
        this.Elements["profile-image"].addEventListener('click', () => {
            this.SetImage();
        })
    }

    async Boot() {
        await this.SetElements()
        await this.Fetch();
    }
    async Fetch(page = 1, limit = 10, search) {

        const result = await request('/api/profiles/filtered',
            {
                page,
                limit,
                search
            }, 'POST', true)

        if (!result.profiles || result.profiles.length === 0) {
            notify('No Profiles Found');
            return;
        }
        if (result.success) {
            this.CurrentPage = page;
            this.TotalPages = result.sorting.pages;
            this.Profiles = result.profiles;

            this.Pagination(result.sorting);
            this.Render(this.Profiles)

        } else {
            notify('Unidentified Profile');
        }
    }

    async Filter(event) {
        event.preventDefault();
        if (event.key === 'Enter') {
            const input = document.getElementById("search").value;
            if (input) {
                await this.Fetch(1, 10, input);
            } else {
                notify('Empty Search', 2000);
                await this.Fetch(1);
            }
        }
    }

    async Save() {
        const name = this.Elements["profile-name"].value;
        const contact = this.Elements["profile-contact"].value;
        const description = this.Elements["profile-description"].value;
        const image = document.getElementById("profile-image").src;

        if (!name || !contact) {
            notify('Name and contact are required', 2000);
            return;
        }

        const formData = new FormData();

        formData.append("name", name);
        formData.append("contact", contact);
        formData.append("description", description);
        if (this.file) {
            formData.append("image", this.file);
        }

        try {
            const data = await request('/api/profiles/',
                formData
        , 'POST', true)

            if (data.success) {
                notify(data.message);
                this.Elements['fresh-profile'].click();
                await this.Fetch();
            } else {
                notify(data.message);
            }
        } catch (error) {
            notify('Error saving profile', 2000, 'red');
        }
    }

    SetImage() {
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

            this.file = file;

            try {
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.Elements['profile-image'].src = e.target.result;
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

    Render(Profiles) {
        const table_body = this.Elements["table-body"];

        while (table_body.firstChild) {
            table_body.removeChild(table_body.firstChild);
        }

        Profiles.forEach(Iterated => {
            console.log(Iterated)
            const row = document.createElement('div');
            row.className = 'table-row';
            const dataCol = document.createElement('div');
            dataCol.className = 'data-col';
            dataCol.innerHTML = `
                            <div class="data-name">
                            ${Iterated.name}
                            </div>
                            <div class="data-date">
                            ${Iterated.dateofcreation}
                            </div>
                        `;
            const actionsCol = document.createElement('div');
            actionsCol.className = 'actions-col';
            const button = document.createElement('button');
            button.className = 'btn';
            button.textContent = 'VIEW'
            button.addEventListener('click', () => this.DisplayProfile(Iterated));
            row.addEventListener('click', () => this.DisplayProfile(Iterated));
            actionsCol.appendChild(button);
            row.appendChild(dataCol);
            row.appendChild(actionsCol);
            table_body.appendChild(row);
        })

    }

    Pagination(sorting) {
        this.Elements["prev-btn"].disabled = !sorting.previous;
        this.Elements["next-btn"].disabled = !sorting.next;
        this.Elements["pagination-info"].textContent = `${sorting.start} - ${sorting.end} of ${sorting.count}`
    }

    DisplayProfile(profile) {
        this.CurrentProfile = profile;
        this.Elements["profile-name"].value = profile.name;
        this.Elements["profile-contact"].value = profile.contact;
        this.Elements["profile-date"].value = new Date(profile.dateofcreation).toDateString();
        this.Elements["profile-description"].value = profile.description;

        if (profile.image && profile.image.data) {
            this.Elements["profile-image"].src = profile.image.data;
        } else {
            this.Elements["profile-image"].src = '';
        }
    }
}

async function profileInterface() {
    const manager = new Manager();
    await manager.Boot();

    // window.ProfileManager = manager;
}

export {
    profileInterface
}