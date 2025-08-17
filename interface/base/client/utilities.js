// utilities.js

function notify(text, duration = 3000, indicator = 'white') {
    const messageContainer = document.getElementById('messageContainer');

    const messageEl = document.createElement('p');
    messageEl.textContent = text;
    messageEl.style.marginBottom = '1rem';
    messageEl.style.opacity = '0';
    messageEl.style.transition = 'opacity 0.3s ease-in-out';
    messageEl.style.color = indicator;
    messageContainer.appendChild(messageEl);

    messageContainer.classList.add('show');
    setTimeout(() => {
        messageEl.style.opacity = '1';
    }, 10);

    setTimeout(() => {
        messageEl.style.opacity = '0';
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.parentNode.removeChild(messageEl);
            }

            if (messageContainer.children.length === 0) {
                messageContainer.classList.remove('show');
            }
        }, 300);
    }, duration);
}

window.notify = notify;

export { notify };