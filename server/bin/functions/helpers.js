const bcrypt = require('bcrypt');

const {
	getUserByEmailDB,
	// getUserByUserIdDB,
	addUserDB,
	createFriendlistDB
} = require('../db/helpers/subQueries/authQueries');

const generateHashedPassword = password => {
	return bcrypt.hashSync(password, 10);
};

const emailExists = email => {
	return getUserByEmailDB(email).then(result => {
		if (result) {
			return result.email;
		}
		return false;
	});
};

// const userIdExists = userId => {
//   return getUserByUserIdDB(userId).then(result => {
//     if (result) {
//       return result;
//     }
//     return false;
//   });
// };

const validatePassword = (email, password) => {
	return getUserByEmailDB(email).then(user => {
		console.log('VALIDATE PASSWORD USER', user);
		if (bcrypt.compareSync(password, user.password)) {
			console.log('password 1 :', password);
			console.log('password 2(encrypted):', user.password);
			console.log('HERE PASSWORD COMPARE', bcrypt.compareSync(password, user.password));
			return user;
		}
		return false;
	});
};

const addUser = (username, email, password) => {
	return addUserDB(username, email, generateHashedPassword(password)).then(newUser => {
		console.log('HERE BLURGGGG OASOASNOASMOASMAOS');
		if (newUser) {
			console.log('HERE ********', newUser);
			return newUser;
		}
		throw new Error();
	});
};

const createFriendlist = id => {
	return createFriendlistDB(id).then(newFriendlist => {
		console.log('friendlist creator');
		if (newFriendlist) {
			console.log('HERE ********', newFriendlist);
			return newFriendlist;
		}
		throw new Error();
	});
};

module.exports = {addUser, validatePassword, emailExists, createFriendlist};
