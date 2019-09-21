const formatSingleMessage = inputMessage => {
	return {
		chatroom: inputMessage.chatroom_id,
		message: {
			id: inputMessage.message_id,
			user_id: inputMessage.user_id,
			content: inputMessage.content,
			created_at: inputMessage.created_at,
			deleted: inputMessage.deleted,
			username: inputMessage.username
		}
	};
};

//format chatroom messages
const formatChatroomMessages = messages => {
	let distinctChatrooms = new Set();
	let chatroomArr = [];

	messages.forEach(message => {
		distinctChatrooms.add(message.chatroom_id);
	});
	distinctChatrooms = [...distinctChatrooms];

	distinctChatrooms.forEach(chatroom => {
		if (!chatroomArr.find(chatroom => chatroomArr.id === chatroom)) {
			const {name, avatar, type, chatroom_id: id} = messages.find(message => message.chatroom_id === chatroom);
			const newChatroom = {id, type, name, avatar};
			newChatroom.messages = [];
			chatroomArr.push(newChatroom);
		}
	});

	chatroomArr.forEach((chatroom, index) => {
		messages.forEach(message => {
			if (message.chatroom_id === chatroom.id) {
				const {message_id: id, user_id, content, created_at, deleted, username} = message;
				const newMessage = {id, user_id, content, created_at, deleted, username};
				chatroomArr[index].messages.push(newMessage);
			}
		});
	});

	return chatroomArr;
};

module.exports = {formatChatroomMessages, formatSingleMessage};
