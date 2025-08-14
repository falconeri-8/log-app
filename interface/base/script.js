import {authenticate} from "./client/author.js";
import {profileInterface} from "./client/profile.js";

document.addEventListener('DOMContentLoaded', () => {
    authenticate();
    profileInterface();
})