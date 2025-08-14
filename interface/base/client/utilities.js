function notify(text, duration = 3000) {
    const messageContainer = document.getElementById('messageContainer');

    // Create new message element
    const messageEl = document.createElement('p');
    messageEl.textContent = text;
    messageEl.style.marginBottom = '1rem';
    messageEl.style.opacity = '0';
    messageEl.style.transition = 'opacity 0.3s ease-in-out';

    // Add to the end (bottom) of the container 
    messageContainer.appendChild(messageEl);

    // Show container and fade in message
    messageContainer.classList.add('show');
    setTimeout(() => {
        messageEl.style.opacity = '1';
    }, 10);

    // Set timeout to fade out and remove this specific message
    setTimeout(() => {
        messageEl.style.opacity = '0';
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.parentNode.removeChild(messageEl);
            }

            // Hide container if no messages left
            if (messageContainer.children.length === 0) {
                messageContainer.classList.remove('show');
            }
        }, 300);
    }, duration);
}

window.notify = notify;

export { notify };