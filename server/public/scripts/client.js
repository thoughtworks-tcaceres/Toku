const socket = io.connect('http://localhost:8080');

socket.emit('join room', 1);
socket.emit('poop', {user: 1, chatroom: 2, content: 3});

socket.on('sending new single message', (data) => {
	console.log(data);
});

socket.on('poop2', (data) => {
	console.log(data);
});
