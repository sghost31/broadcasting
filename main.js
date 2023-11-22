const videoElement = document.getElementById('videoElement');
const messageInput = document.getElementById('messageInput');
const chatMessages = document.getElementById('chatMessages');

let socket;

// Connect to the WebSocket server
function connectToSocket() {
    socket = new WebSocket('ws://localhost:3000');

    socket.addEventListener('message', (event) => {
        const message = JSON.parse(event.data);

        if (message.type === 'offer') {
            handleOffer(message);
        } else if (message.type === 'answer') {
            handleAnswer(message);
        } else if (message.type === 'ice-candidate') {
            handleIceCandidate(message);
        } else if (message.type === 'chat') {
            appendMessage(message.sender, message.text);
        }
    });
}

// Handle offer, answer, ice-candidate as in the previous example

function sendMessage() {
    const text = messageInput.value;
    const message = { type: 'chat', text, sender: 'You' };

    socket.send(JSON.stringify(message));
    appendMessage('You', text);

    messageInput.value = '';
}

function appendMessage(sender, text) {
    const messageElement = document.createElement('div');
    messageElement.innerText = `${sender}: ${text}`;
    chatMessages.appendChild(messageElement);
}

// Initialize video stream
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then((stream) => {
        videoElement.srcObject = stream;
        videoElement.play();
    })
    .catch((error) => {
        console.error('Error accessing media devices:', error);
    });

// Connect to the WebSocket server when the page loads
connectToSocket();
