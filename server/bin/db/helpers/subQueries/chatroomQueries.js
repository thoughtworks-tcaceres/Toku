const db = require("../../../../db/connection/db");

const checkInChatAlready = (user1_id, user2_id) => {
  return db
    .query({
      text: `select t1.id as chatroom_id from (select c.id as id from participants p join chatrooms c on p.chatroom_id = c.id where p.user_id = $1 and c.chatroom_type='single') as t1
      join (select c.id as id from participants p join chatrooms c on p.chatroom_id = c.id where p.user_id = $2 and c.chatroom_type='single') as t2 on t1.id = t2.id;`,
      values: [user1_id, user2_id],
      name: "check_in_chat_already"
    })
    .then(res => res.rows[0]);
};

const createChatroom = (chatroom_type, name, user_id, users_arr, avatar) => {
  const newAvatar =
    avatar === "" ? "http://www.newdesignfile.com/postpic/2012/08/group-people-icon-team_357813.png" : avatar;
  return db
    .query({
      text: `
			with new_chat_id as (INSERT INTO chatrooms (chatroom_type, name, avatar) VALUES ($1,$2,$3) returning id)
			insert into participants (user_id, chatroom_id, is_admin) 
				(select user_id, id, user_id = $4 from new_chat_id cross join unnest($5::integer[]) as user_id) returning *;
    `,
      values: [chatroom_type, name, newAvatar, user_id, users_arr],
      name: "create_chatroom"
    })
    .then(res => res.rows);
};

addMultipleChatroomParticipants = (usersArr, chatroom_id) => {
  let queryString = "";
  queryString += `INSERT INTO participants (chatroom_id, user_id) VALUES `;
  usersArr.forEach((user, index) => {
    queryString += `(${chatroom_id},${user})`;
    queryString += index === usersArr.length - 1 ? "" : ",";
  });
  queryString += " RETURNING *;";

  return db.query({
    text: queryString,
    // values: [usersArr, chatroom_id],
    name: "add_multiple_chatroom_participants"
  });
};

const addChatroomParticipant = (user_id, chatroom_id) => {
  return db
    .query({
      text: `
		INSERT INTO participants (user_id, chatroom_id) VALUES ($1,$2) RETURNING *`,
      values: [user_id, chatroom_id],
      name: "add_chatroom_participant"
    })
    .then(res => res.rows[0]);
};

const getActiveChatrooms = user_id => {
  return db
    .query({
      text: `SELECT *
		FROM participants
		WHERE user_id = $1
		;`,
      values: [user_id],
      name: "get_active_chatrooms"
    })
    .then(res => res.rows);
};

const updateChatroom = (chatroom_id, name = null, avatar = null) => {
  let queryString = "";
  let queryValues = [];
  if (!avatar && !name) {
    queryString = `UPDATE chatrooms
		SET name = $2, avatar = $3
		WHERE id = $1
    RETURNING *;
		`;
    queryValues = [chatroom_id, name, avatar];
  } else if (!name) {
    queryString = `UPDATE chatrooms
			SET name = $2
			WHERE id = $1
    RETURNING *;
		`;
    queryValues = [chatroom_id, name];
  } else {
    queryString = `UPDATE chatrooms
		SET avatar = $2
		WHERE id = $1
		RETURNING *;
		`;
    queryValues = [chatroom_id, avatar];
  }
  return db
    .query({
      text: queryString,
      values: queryValues,
      name: "update_chatroom"
    })
    .then(res => res.rows[0]);
};

// update --> this toggles the is_admin status
const updateChatroomParticipant = (user_id, chatroom_id) => {
  return db.query({
    text: `UPDATE participants
		SET is_admin = NOT is_admin
		WHERE user_id = $1 and chatroom_id = $2
		RETURNING *`,
    values: [user_id, chatroom_id],
    name: "update_chatroom_participant"
  });
};

// delete
const deleteChatroomParticipant = (user_id, chatroom_id) => {
  return db.query({
    text: `DELETE
		FROM participants
		WHERE user_id = $1 and chatroom_id = $2
		RETURNING *`,
    values: [user_id, chatroom_id],
    name: "update_chatroom_participant"
  });
};

const deleteViewableMessages = (user_id, chatroom_id) => {
  return db
    .query({
      text: `
			DELETE FROM user_message_views WHERE user_id = $1 and message_id IN
			(SELECT id FROM messages where chatroom_id = $2) RETURNING *;
		`,
      values: [user_id, chatroom_id],
      name: "leave_chatroom_remove_messages"
    })
    .then(res => res.rows);
};

const participantsInChatroom = chatroom_id => {
  return db
    .query({
      text: `select u.id as user_id, u.email as email, u.username as username, u.avatar as avatar, p.is_admin as admin
    from users u join participants p on u.id = p.user_id
    where p.chatroom_id = $1`,
      values: [chatroom_id],
      name: "participants_in_chatroom"
    })
    .then(res => res.rows);
};

const updateChatroomName = (chatroom_id, chatroom_name) => {
  return db
    .query({
      text: `UPDATE chatrooms SET name = $2
      WHERE id = $1 RETURNING *;`,
      values: [chatroom_id, chatroom_name],
      name: "update_chatroom_name"
    })
    .then(res => res.rows[0]);
};

const updateChatroomAvatar = (chatroom_id, chatroom_avatar) => {
  return db
    .query({
      text: `UPDATE chatrooms SET avatar = $2
      WHERE id = $1 RETURNING *;`,
      values: [chatroom_id, chatroom_avatar],
      name: "update_chatroom_avatar"
    })
    .then(res => res.rows[0]);
};

module.exports = {
  createChatroom,
  addChatroomParticipant,
  getActiveChatrooms,
  updateChatroom,
  updateChatroomParticipant,
  deleteChatroomParticipant,
  deleteViewableMessages,
  checkInChatAlready,
  participantsInChatroom,
  updateChatroomName,
  updateChatroomAvatar,
  addMultipleChatroomParticipants
};
