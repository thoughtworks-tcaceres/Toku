// load .env data into process.env
require("dotenv").config();
require("util").inspect.defaultOptions.depth = null;

// constant setup
const PORT = process.env.PORT || 3003;
const ENV = process.env.ENV || "development";

// server config
const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);

// database connection
const db = require("./db/connection/db.js");
db.connect();

// additional server set up
const morgan = require("morgan");
app.use(morgan("dev"));
app.use(express.json({ extended: true }));
// app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
const session = require("express-session");

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.header("Access-Control-Allow-Credentials", true);
  next();
});

app.use(
  session({
    secret: "lhl parlez",
    resave: true,
    saveUninitialized: true
  })
);

// ***** routes *****
const defaultRoutes = require("./routes/default");
app.use("/auth/", defaultRoutes);

// server initialize
app.listen(PORT, () => console.log(`Running on port ${PORT}`));
server.listen(8080);

const dbQueries = require("./bin/db/helpers/helperQueries");

// global object to store the latest socket of a user
const participantSockets = {};

/**
 * !socket global object
 * participantSockets = {'1' : 'xyz1234___1234',
 * 											'2' : 'abcdefghijklmnopqrstuvwxyz'}
 */

// ********** FUNCTIONS FOR SOCKETS **********

// ********************** SOCKETS

io.on("connect", socket => {
  // ********** FUNCTIONS FOR SOCKETS **********
  const initialLoad = async user_id => {
    try {
      const activeChatrooms = await dbQueries.getActiveChatrooms(user_id);
      activeChatrooms.forEach(chatroom => socket.join(chatroom.chatroom_id));
      const recentChatroomMessages = await dbQueries.getRecentChatroomMessages(user_id);
      const friendList = await dbQueries.getFriendInfo(user_id);
      const userInformation = await dbQueries.getUserInfo(user_id);
      socket.emit("initial message data", recentChatroomMessages);
      socket.emit("friendlist data", friendList);
      socket.emit("initial user information", userInformation);

      // io.to(chatroom.chatroom_id).emit('new chatroom joined', `${socket.id} joined room ${chatroom.id}`);
    } catch (error) {
      console.log("Error! :", error);
    }
  };

  const refreshFriendList = async user_id => {
    try {
      const friendList = await dbQueries.getFriendInfo(user_id);
      socket.emit("friendlist data", friendList);
    } catch (error) {
      console.log("Error! :", error);
    }
  };

  const createNewChatroom = async (type, name, creatorUserId, usersArr, avatar = "") => {
    try {
      if (type === "single") {
        console.log("HERE0000");
        const existingChatroom = await dbQueries.checkInChatAlready(usersArr[0], usersArr[1]);
        console.log("HERE0000", existingChatroom);
        const prevChatroomNumber = existingChatroom ? existingChatroom : null;
        console.log("HERE00009999999", prevChatroomNumber);
        if (prevChatroomNumber) {
          console.log("I AM IN THIS IF STATEMENT 1111111");
          const newMessage = await botMessageEmit(prevChatroomNumber.chatroom_id, "reopen chatroom", creatorUserId);
          console.log("NEW MESSAGE: -------- ", newMessage);
          return;
        }
      }

      console.log("I AM IN THE ELSE STATEMENT SECTIIIIOOOONNN");
      const newParticipants = await dbQueries.createChatroom(type, name, creatorUserId, usersArr, avatar);
      const newChatroomId = newParticipants[0].chatroom_id;
      usersArr.forEach(user => {
        console.log("USER1234:", user);
        if (io.sockets.sockets[participantSockets[user]]) {
          console.log("USER 123:", user);
          io.sockets.sockets[participantSockets[user]].join(newChatroomId);
        }
      });
      botMessageEmit(newChatroomId, "user created chatroom", creatorUserId);
      usersArr.forEach(user => {
        console.log("userrrrrr123:", user);
        console.log(`${user} has joined the room`);
        botMessageEmit(newChatroomId, "user joined chatroom", user);
        console.log("useruseruseruser123456789");
      });
    } catch (error) {
      //bot creates message to the entire chatroom
      //bot emits message to the entire chatroom
      // io.to(newChatroomId).emit("new chatroom message",*insert bot's message here*)
      console.log("Error! :", error);
    }
  };

  const createNewMessage = async (user_id, chatroom_id, content) => {
    try {
      const newChatroomMessage = await dbQueries.createChatroomMessage(user_id, chatroom_id, content);
      console.log("NEW CHATROOM MESSAGE:", newChatroomMessage[0]);
      io.to(chatroom_id).emit("new chatroom message", newChatroomMessage[0]);
    } catch (error) {
      console.log("Error! :", error);
    }
  };

  const deleteMessage = async (user_id, message_id, creator_id) => {
    console.log("before try");
    try {
      const deletedChatroomMessage = await dbQueries.deleteChatroomMessage(user_id, message_id);
      await dbQueries.deleteChatroomMessageViews(user_id, message_id);
      const deletedMsg = await dbQueries.getSingleChatroomMessage(message_id);
      socket.emit("delete my message", deletedMsg);
      console.log(deletedMsg);
      if (user_id === creator_id) {
        // const updatedDeletedContentMessage = await dbQueries.getSingleChatroomMessage(message_id);
        socket.to(deletedMsg.chatroom).emit("delete owner message", deletedMsg);
      }
    } catch (error) {
      console.log("Error! :", error);
    }
  };

  const deleteViewableMessages = async (user_id, chatroom_id) => {
    try {
      const deleted = await dbQueries.deleteViewableMessages(user_id, chatroom_id);
      console.log("the messages that have been deleted from views", deleted);
      socket.emit("delete viewable messages", chatroom_id);
    } catch (error) {
      console.log("Error! :", error);
    }
  };

  const leaveChatroom = async (user_id, chatroom_id) => {
    try {
      if (io.sockets.sockets[participantSockets[user_id]]) {
        console.log("USER 123:", user_id);
        io.sockets.sockets[participantSockets[user_id]].leave(chatroom_id);
      }
      await deleteViewableMessages(user_id, chatroom_id);
      await dbQueries.deleteChatroomParticipant(user_id, chatroom_id);
      botMessageEmit(chatroom_id, "user left chatroom", user_id);
    } catch (error) {
      console.log("Error! :", error);
    }
  };

  const addParticipantsToChatroom = async (chatroom_id, usersArr) => {
    try {
      await dbQueries.addMultipleChatroomParticipants(usersArr, chatroom_id);
      usersArr.forEach(user => {
        if (io.sockets.sockets[participantSockets[user]]) {
          console.log("USER TO ADD TO CHATROOM:", user);
          io.sockets.sockets[participantSockets[user]].join(chatroom_id);
        }
      });
      usersArr.forEach(user => {
        botMessageEmit(chatroom_id, "user joined chatroom", user);
      });
    } catch (error) {
      console.log("Error! :", error);
    }
  };

  const addFriend = async (user_id, friend_id) => {
    try {
      const friendlist = await dbQueries.addFriend(user_id, friend_id);
      const friendlist2 = await dbQueries.addFriend(friend_id, user_id);
      console.log("SERVER SIDE CHECKING FIRNEDLIST", friendlist);
      socket.emit("friendlist data", friendlist);
    } catch (error) {
      console.log("Error! :", error);
    }
  };

  const deleteFriend = async (user_id, friend_id) => {
    try {
      const friendlist = await dbQueries.deleteFriend(user_id, friend_id);
      console.log("deleted friendlist");
      console.log("FRRRRRRRRRRRR:", friendlist);
      socket.emit("friendlist data", friendlist);
    } catch (error) {
      console.log("Error! :", error);
    }
  };

  const searchNewFriend = async (email, user_id) => {
    console.log("BEFOPRE TRY checking to see what the email is in the server", email);

    try {
      console.log("checking to see what the email is in the server", email);
      const friend = await dbQueries.getNewFriendInfo(email, user_id);
      if (!friend) {
        throw new Error();
      }
      socket.emit("found friend", friend);
      console.log("CHECKING WHAT FRIEND IS ", friend);
    } catch (error) {
      console.log("Error! :", error);
    }
  };

  const updateUsername = async (user_id, username) => {
    try {
      const newUserProfile = await dbQueries.updateUsername(user_id, username);
      console.log("CHECKING TO SEE IN SERVER API TO SEE IF WE GET BACK NEW USER INFO", newUserProfile);
      socket.emit("updated username data", newUserProfile);
    } catch (error) {
      console.log("Error! :", error);
    }
  };

  const updateAvatar = async (user_id, avatar) => {
    try {
      const newUserAvatar = await dbQueries.updateAvatar(user_id, avatar);
      console.log("CHECKING TO SEE IN SERVER SIDE IF WE GET BACK NEW USER AVATAR", newUserAvatar);
      socket.emit("updated avatar data", newUserAvatar);
    } catch (error) {
      console.log("Error! :", error);
    }
  };

  const updateStatus = async (user_id, status) => {
    try {
      const newUserStatus = await dbQueries.updateStatus(user_id, status);
      console.log("new user status", newUserStatus);
      socket.emit("updated status data", newUserStatus);
    } catch (error) {
      console.log("Error! :", error);
    }
  };

  const botMessageCreateContent = (typeOfAction, user) => {
    let messageContent = "";
    switch (typeOfAction) {
      case "user joined chatroom":
        return (messageContent += `${user} has joined the chatroom.`);
      case "user left chatroom":
        return (messageContent += `${user} has left the chatroom.`);
      case "user created chatroom":
        return (messageContent += `${user} has created the chatroom.`);
      case "user admin status updated":
        return (messageContent += `${user} admin status been changed.`);
      case "reopen chatroom":
        return (messageContent += `${user} has requested to restart chatroom.`);
      default:
        return null;
    }
  };

  const botMessageEmit = async (chatroom_id, type_of_action, user_id) => {
    try {
      const userName = await dbQueries.getUserInfo(user_id);
      const msgContent = botMessageCreateContent(type_of_action, userName.username);
      const botMessage = await dbQueries.createChatroomMessage(0, chatroom_id, msgContent);
      io.to(chatroom_id).emit("new chatroom message", botMessage[0]);
    } catch (error) {
      console.log("Error! :", error);
    }
  };

  const updateChatroomName = async (chatroomid, avatar) => {
    try {
      const updatedChatroomInfo = await dbQueries.updateChatroomName(chatroomid, avatar);
      io.to(chatroomid).emit("updated chat data", updatedChatroomInfo);
    } catch (error) {
      console.log("Error! :", error);
    }
  };

  const updateChatroomAvatar = async (chatroomid, avatar) => {
    try {
      const updatedChatroomInfo = await dbQueries.updateChatroomAvatar(chatroomid, avatar);
      io.to(chatroomid).emit("updated chat data", updatedChatroomInfo);
    } catch (error) {
      console.log("Error! :", error);
    }
  };

  const fetchChatroomParticipants = async chatroomid => {
    try {
      const chatroomParticipants = await dbQueries.participantsInChatroom(chatroomid);
      socket.emit("get chatroom participants", chatroomParticipants);
    } catch (error) {
      console.log("Error! :", error);
    }
  };

  socket.on("initialize", data => {
    console.log("user_id from client", data);
    socket.userid = data;
    let currentSocket = participantSockets[socket.userid];
    if (currentSocket && io.sockets.sockets[currentSocket]) {
      console.log("currently logged in socket: ", participantSockets[currentSocket]);
      //send a message to the client about to be disconnected (pop up saying they got disconnected, etc)
      io.to(currentSocket).emit("to be disconnected");
      //potentially add in a timeout? (delay)
      io.sockets.sockets[currentSocket].disconnect();
    }
    participantSockets[socket.userid] = socket.id;
    console.log("new socket :", participantSockets[socket.userid]);
    console.log(participantSockets);

    initialLoad(socket.userid); //function to send initial data

    socket.on("create new chatroom", newChatroomData => {
      const { type, name, usersArr, avatar } = newChatroomData;
      createNewChatroom(type, name, socket.userid, usersArr, avatar);
    });

    socket.on("send message", newMessage => {
      console.log(newMessage);
      const { userId, chatroomId, content } = newMessage;
      createNewMessage(userId, chatroomId, content);
    });

    socket.on("delete msg", data => {
      console.log(data);
      deleteMessage(socket.userid, data.msg_id, data.creatorId);
    });

    socket.on("delete chatroom button", chatroom_id => {
      console.log("I AM HERE. DELETE CHATROOM BUTTON.", chatroom_id);
      deleteViewableMessages(socket.userid, chatroom_id);
    });

    socket.on("search friend", data => {
      console.log(data);
      searchNewFriend(data.email, socket.userid);
    });

    socket.on("add new friend", friendToAdd => {
      addFriend(socket.userid, friendToAdd.id);
    });

    socket.on("delete friend", friendToDelete => {
      console.log("FRIEND-TO-DELETE", friendToDelete);
      deleteFriend(socket.userid, friendToDelete);
    });

    socket.on("create single chat", data => {
      console.log("CREATE SINGLE FREIND", data);
      createNewChatroom(data.type, data.name, data.creatorUserId, data.usersArr, data.avatar);
    });

    socket.on("create group chat", data => {
      console.log("CREATE GROUP CHAT", data);
      createNewChatroom(data.type, data.name, data.creatorUserId, data.usersArr, data.avatar);
    });

    socket.on("change name", data => {
      console.log("CHANGE NAME", data);
      updateUsername(data.creatorUserId, data.username);
    });

    socket.on("change status", data => {
      console.log("CHANGE status", data);
      updateStatus(data.creatorUserId, data.status);
    });

    socket.on("leave chatroom", ({ user_id, chatroom_id }) => {
      console.log("LEAVE CHATROOM HERE");
      console.log("user_id:", user_id);
      console.log("chatroom_id:", chatroom_id);
      leaveChatroom(user_id, chatroom_id);
    });

    socket.on("change url", data => {
      console.log("CHANGE URL", data);
      updateAvatar(data.creatorUserId, data.avatar);
    });

    socket.on("change chat name", data => {
      console.log("change chat name", data);
      updateChatroomName(data.chatroomId, data.name);
    });

    socket.on("change chat avatar", data => {
      console.log("change chat avatar", data);
      updateChatroomAvatar(data.chatroomId, data.avatar);
    });

    socket.on("fetch chatroom participants", data => {
      console.log("fetch chatroom participants", data);
      fetchChatroomParticipants(data);
    });

    socket.on("add chatroom participants", data => {
      console.log("add chatroom participants", data);
      addParticipantsToChatroom(data.id, data.usersArr);
    });

    socket.on("fetch friend list", () => {
      console.log("FETCHING FRIEND LIST");
      refreshFriendList(socket.userid);
    });
  });
});
