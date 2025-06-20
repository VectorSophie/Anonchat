const protocol = location.protocol === 'https:' ? 'wss' : 'ws';
const ws = new WebSocket(`${protocol}://${location.host}`);

const messages = document.getElementById('messages');
const input = document.getElementById('input');

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);

    const div = document.createElement('div');
    div.textContent = data.text;
    div.style.color = data.type === 'system' ? '#888' : '#fff';

    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;

    if (data.type === 'vanish') {
        setTimeout(() => {
            div.remove();
        }, data.duration * 1000);
    }
};


input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && input.value.trim()) {
        ws.send(input.value);
        input.value = '';
    }
});
