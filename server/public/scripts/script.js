$(document).ready(function() {
	formSubmit();
	// getMessageData();
});

const loadNewSingleData = (data) => {
	console.log(data);

	const singleMessage = `<ul>
	<li>********************</li>
		<li>message id: ${data.id}</li>
		<li>user id: ${data.user_id}</li>
    <li>chatroom id: ${data.chatroom_id}</li>
		<li>content: ${data.content}</li>
		<li>********************</li></ul>`;
	$(`#message-box${data.chatroom_id}`).prepend(singleMessage);
};

const formSubmit = () => {
	$('form').on('submit', function(event) {
		event.preventDefault();
		const data = {
			message: $('#message').val(),
			user: $('#user-id').val(),
			chatroom: $('#chatroom-id').val()
		};
		$('#message').val('');
		console.log('form submit button clicked');
		socket.emit('new msg', data);
	});
};

// const loadNewData = (data) => {
// 	console.log(data);
// 	$('#message-box > ul').text('');

// 	const newData = data.map((record) => {
// 		return `<li>message id: ${record.message_id}</li>
//     <li>user id: ${record.user_id}</li>
//     <li>chatroom id: ${record.chatroom_id}</li>
//     <li>content: ${record.content}</li>`;
// 	});

// 	$('#message-box > ul').append(newData);
// };

// const getMessageData = () => {
// 	$('#chatroom-submit').on('click', function() {
// 		const data = {
// 			chatroom: $('#chatroom-id').val(),
// 			user: $('#user-id').val()
// 		};
// 		console.log('clicked get message data button');
// 		socket.emit('get chatroom data', data);
// 	});
// };
