import {notify} from "./utilities.js";
import {profileInterface} from "./profile.js";

async function authenticate() {
    document.querySelector('form').addEventListener('submit', async function (e) {
        e.preventDefault();
        const inputKey = document.getElementById('password').value;
        try {
            const response = await fetch('/api/access/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({key: inputKey})
            });
            const data = await response.json();
            if (data.success) {
                localStorage.setItem('authToken', data.token);
                document.querySelector('.login-container').style.display = 'none';
                notify(`Authorized`, 2000);
                setTimeout(() => {
                    document.querySelector('.main-container').style.display = 'flex';
                }, 2300)
                await profileInterface();
            } else {
                notify(`Unidentified`, 2000);
                document.getElementById('password').value = '';
            }
        } catch (error) {
            console.error('Error validating key:', error);
            document.getElementById('password').value = '';
        }
    });
}

export { authenticate };