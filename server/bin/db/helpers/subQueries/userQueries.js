const db = require("../../../../db/connection/db");

const getUserInfo = user_id => {
  return db
    .query({
      text: `SELECT email, username, avatar, status
			FROM users
			where id = $1
			;`,
      values: [user_id],
      name: "get_user_info"
    })
    .then(res => res.rows[0]);
};

const getNewFriendInfo = (email, user_id) => {
  return db
    .query({
      text: "SELECT username, email, avatar, status, id FROM users WHERE email=$1 and id != $2 and is_active=true;",
      values: [email, user_id],
      name: "get_new_friend_info"
    })
    .then(res => res.rows[0]);
};

//GET MY FRIENDLIST FUNCTION
//removed invitiation_accepted_ not null
const getFriendInfo = user_id => {
  return db
    .query({
      text: `SELECT f.invitation_accepted_at, f.friend_id as id, u.email as email, u.username as username, u.avatar as avatar, u.status as status
			FROM friendlists fl join friends f on fl.id = f.friendlist_id
			join users u on u.id = f.friend_id
			where fl.user_id = $1 and u.is_active = true
			;`,
      values: [user_id],
      name: "get_friend_list"
    })
    .then(res => res.rows);
};

const deleteFriend = (user_id, friend_id) => {
  console.log("info being passed to the deleteFriend query:", user_id, friend_id);
  return db
    .query({
      text: `DELETE FROM friends WHERE id IN (SELECT f.id
				FROM users u join friendlists fl on u.id = fl.user_id
				join friends f on f.friendlist_id = fl.id
				WHERE (u.id = $1 and f.friend_id = $2) or (u.id = $2 and f.friend_id = $1))
				RETURNING *;`,

      values: [user_id, friend_id],
      name: "delete_friend"
    })
    .then(res => getFriendInfo(user_id));
};

const addFriend = (user_id, friend_id) => {
  return db
    .query({
      text: `INSERT INTO friends (friend_id, friendlist_id)
		SELECT $2,
		id FROM friendlists
		WHERE user_id = $1 RETURNING *;`,
      values: [user_id, friend_id],
      name: "add_friend"
    })
    .then(() => getFriendInfo(user_id));
};

const updateUsername = (user_id, username) => {
  return db
    .query({
      text: `UPDATE users
    SET username = $2
    WHERE id = $1
    RETURNING *;
    `,
      values: [user_id, username],
      name: "update_username"
    })
    .then(res => res.rows[0]);
};

const updateAvatar = (user_id, avatar) => {
  return db
    .query({
      text: `UPDATE users
    SET avatar = $2
    WHERE id = $1
    RETURNING *;
    `,
      values: [user_id, avatar],
      name: "update_avatar"
    })
    .then(res => res.rows[0]);
};

const updateStatus = (user_id, status) => {
  return db
    .query({
      text: `UPDATE users
    SET status = $2
    WHERE id = $1
    RETURNING *;
    `,
      values: [user_id, status],
      name: "update_avatar"
    })
    .then(res => res.rows[0]);
};

module.exports = {
  getUserInfo,
  getFriendInfo,
  deleteFriend,
  addFriend,
  getNewFriendInfo,
  updateUsername,
  updateAvatar,
  updateStatus
};
