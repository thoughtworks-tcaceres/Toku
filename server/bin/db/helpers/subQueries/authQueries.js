const db = require('../../../../db/connection/db');

//select specific user
const getUserByEmailDB = email => {
	return db
		.query({
			text: `SELECT * FROM users WHERE email = $1;`,
			values: [email],
			name: 'get_user_by_email'
		})
		.then(res => res.rows[0]);
};

const getUserByUserIdDB = userid => {
	return db
		.query({
			text: `SELECT * FROM users WHERE id = $1;`,
			values: [userid],
			name: 'get_user_by_id'
		})
		.then(res => res.rows[0]);
};

const createFriendlistDB = id => {
	console.log('does this happen at least', id);
	console.log(typeof id);
	return db
		.query({
			text: `
			INSERT INTO friendlists (user_id) VALUES ($1) RETURNING *;`,
			values: [id],
			name: 'create_friend_list'
		})
		.then(res => {
			console.log('I AM HERE NOW ********8** AFTER FRIENDLIST*****');
			return res.rows[0];
		});
};

//add user
const addUserDB = (username, email, password) => {
	return db
		.query({
			text: `INSERT INTO users (username, email, password)
      VALUES ($1, $2, $3) RETURNING *;`,
			values: [username, email, password],
			name: 'add_user_db'
		})
		.then(res => res.rows[0]);
};

module.exports = {getUserByEmailDB, getUserByUserIdDB, addUserDB, createFriendlistDB};
