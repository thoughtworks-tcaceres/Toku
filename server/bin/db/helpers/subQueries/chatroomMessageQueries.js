const db = require('../../../../db/connection/db');
const {formatChatroomMessages, formatSingleMessage} = require('../dataFormatter');

const getInitialChatroomMessage = chatroom_id => {
	return db
		.query({
			text: `SELECT * FROM chatrooms c LEFT OUTER JOIN messages m on c.id = m.chatroom_id WHERE c.id = $1;`,
			values: [chatroom_id],
			name: 'get_initial_chatroom_messages'
		})
		.then(res => {
			console.log('RES ROWS 0', res.rows[0]);
			return formatChatroomMessages(res.rows[0]);
		});
};

const getAllChatroomMessages = user_id => {
	return db
		.query({
			text: `SELECT m.chatroom_id as chatroom_id, m.id as message_id, c.chatroom_type as type, c.name as name, c.avatar as avatar, m.owner_user_id as user_id, m.content as content,
			m.created_at as created_at, m.is_deleted as deleted, u.username as username
			FROM messages m JOIN user_message_views umv on umv.message_id = m.id
			JOIN users u on u.id = m.owner_user_id
			JOIN chatrooms c on c.id = m.chatroom_id
			WHERE umv.user_id = $1;
    `,
			values: [user_id],
			name: 'get_all_chatroom_messages'
		})
		.then(res => formatChatroomMessages(res.rows));
};

const getSingleChatroomMessage = message_id => {
	return db
		.query({
			text: `SELECT m.chatroom_id as chatroom_id, m.id as message_id, m.owner_user_id as user_id, m.content as content,
			m.created_at as created_at, m.is_deleted as deleted, u.username as username
			FROM messages m JOIN chatrooms c on c.id = m.chatroom_id
			JOIN users u on u.id = m.owner_user_id
			WHERE m.id = $1;
    `,
			values: [message_id],
			name: 'get_all_chatroom_messages'
		})
		.then(res => formatSingleMessage(res.rows[0]));
};

const getRecentChatroomMessages = user_id => {
	return db
		.query({
			// `text: `SELECT *
			// FROM messages m JOIN user_message_views umv on umv.message_id = m.id
			// JOIN chatrooms c on c.id = m.chatroom_id
			// WHERE umv.user_id = $1;
			text: `SELECT m.chatroom_id as chatroom_id, m.id as message_id, c.chatroom_type as type, c.name as name, c.avatar as avatar, m.owner_user_id as user_id, m.content as content,
			m.created_at as created_at, m.is_deleted as deleted, u.username as username
			FROM messages m JOIN user_message_views umv on umv.message_id = m.id
			JOIN chatrooms c on c.id = m.chatroom_id
			JOIN users u on u.id = m.owner_user_id
			WHERE umv.user_id = $1;`,
			values: [user_id],
			name: 'get_recent_chatroom_messages'
		})
		.then(res => formatChatroomMessages(res.rows));
};

const getChatroomMessages = (user_id, chatroom_id) => {
	return db
		.query({
			text: `SELECT *
			FROM messages m JOIN user_message_views umv on umv.message_id = m.id
			join chatrooms c on c.id = m.chatroom_id
			WHERE umv.user_id = $1 and m.chatroom_id = $2
			LIMIT 10;
    `,
			values: [user_id, chatroom_id],
			name: 'get_chatroom_messages'
		})
		.then(res => formatChatroomMessages(res.rows));
};

// const getInitialChatroomMessages = chatroom_id => {
//   return db
//     .query({
//       text: `SELECT * FROM chatrooms c LEFT OUTER JOIN messages m on c.id = m.chatroom_id WHERE c.id = $1;`,
//       values: [chatroom_id],
//       name: "get_initial_chatroom_messages"
//     })
//     .then(res => {
//       console.log("RES ROWS 0", res.rows[0]);
//       return formatSingleMessage(res.rows[0]);
//     });
// };

/**
 *
 **  ! messed up
 *
 */
// delete
const deleteChatroomMessage = (user_id, message_id) => {
	return db
		.query({
			text: `
      UPDATE messages SET content = 'COMMENT DELETED', updated_at = NOW(), is_deleted = true
      WHERE owner_user_id = $1 and id = $2;
			`,
			values: [user_id, message_id],
			name: 'delete_chatroom_message'
		})
		.then(res => res.rows[0]);
};

const deleteChatroomMessageViews = (user_id, message_id) => {
	return db
		.query({
			text: `
      DELETE FROM user_message_views WHERE user_id = $1 and message_id = $2;
			`,
			values: [user_id, message_id],
			name: 'delete_chatroom_message_views'
		})
		.then(res => res.rows[0]);
};

const getNewSpecificChatroomMessage = msg_id => {
	return db
		.query({
			text: `SELECT c.id as chatroom_id, c.chatroom_type as type, c.name as name, c.avatar as avatar,
      m.id as message_id, m.owner_user_id as user_id, m.content as content, m.created_at as created_at,
      m.is_deleted as deleted, u.username as username
      FROM messages m JOIN chatrooms c on c.id = m.chatroom_id
      JOIN users u on m.owner_user_id = u.id
			WHERE m.id = $1;`,
			values: [msg_id],
			name: 'get_new_specific_chatroom_message'
		})
		.then(res => formatChatroomMessages(res.rows));
};

const createChatroomMessage = (user_id, chatroom_id, content) => {
	return db
		.query({
			text: `
			with new_message_id as (INSERT INTO messages (owner_user_id, chatroom_id, content) VALUES ($1, $2, $3) returning id),
			user_array as (SELECT user_id FROM participants where chatroom_id = $2)
			INSERT INTO user_message_views (message_id, user_id) (select * from new_message_id cross join user_array) returning message_id
			;`,
			values: [user_id, chatroom_id, content],
			name: 'create_chatroom_message'
		})
		.then(res => getNewSpecificChatroomMessage(res.rows[0].message_id));
};

module.exports = {

	getAllChatroomMessages,
	getSingleChatroomMessage,
	getRecentChatroomMessages,
	getChatroomMessages,
	deleteChatroomMessage,
	createChatroomMessage,
	deleteChatroomMessageViews,
	getInitialChatroomMessage,
	getNewSpecificChatroomMessage

};
