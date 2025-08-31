import {authenticate} from "./client/author.js";

document.addEventListener('DOMContentLoaded', async () => {
    await authenticate();
})