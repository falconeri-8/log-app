// utilities.js

function notify(text, duration = 3000, indicator = 'white') {
    const messageContainer = document.getElementById('messageContainer');

    const message = document.createElement('p');
    message.textContent = text;
    message.style.marginBottom = '1rem';
    message.style.opacity = '0';
    message.style.transition = 'opacity 0.3s ease-in-out';
    message.style.color = indicator;
    messageContainer.appendChild(message);

    messageContainer.classList.add('show');
    setTimeout(() => {
        message.style.opacity = '1';
    }, 10);

    setTimeout(() => {
        message.style.opacity = '0';
        setTimeout(() => {
            if (message.parentNode) {
                message.parentNode.removeChild(message);
            }

            if (messageContainer.children.length === 0) {
                messageContainer.classList.remove('show');
            }
        }, 300);
    }, duration);
}

async function request(endpoint = '/', body = {}, method, hasAuth = false, headers = {}) {
    const config = {
        method,
        body,
        headers: {
            ...headers
        }
    }
    if (hasAuth) {
        config.headers.Authorization = `Bearer ${localStorage.getItem('authToken')}`
    }
    if (!body instanceof FormData) {
        config.headers['Content-Type'] = 'application/json';
    }
    if (body && method !== 'GET') {
        if (!body instanceof FormData) {
            config.body = JSON.stringify(body);
        }
    }
    try {
        const response = await fetch(endpoint, config);
        if (!response.ok) {
            notify(`HTTP Status -  ${response.status}`);
        }
        return response.json();
    } catch (error) {
        notify(error.message, 3000, 'red');
    }
}

window.notify = notify;

export {
    notify,
    request
};