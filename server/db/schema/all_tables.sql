-- CREATE EXTENSION IF NOT EXISTS citext; 

-- DROP TABLE IF EXISTS users CASCADE;
-- DROP TABLE IF EXISTS friendlists CASCADE;
-- DROP TABLE IF EXISTS friends CASCADE;
-- DROP TABLE IF EXISTS blacklists CASCADE;
-- DROP TABLE IF EXISTS blocks CASCADE;
-- DROP TABLE IF EXISTS chatrooms CASCADE;
-- DROP TABLE IF EXISTS participants CASCADE;
-- DROP TABLE IF EXISTS messages CASCADE;
-- DROP TABLE IF EXISTS user_message_views CASCADE;
 
-- CREATE TABLE IF NOT EXISTS users (
--   id SERIAL PRIMARY KEY NOT NULL,
--   email citext NOT NULL UNIQUE,
--   password varchar(255) NOT NULL,
--   username varchar(255) NOT NULL,
--   avatar varchar(255) DEFAULT 'https://i1.wp.com/www.mvhsoracle.com/wp-content/uploads/2018/08/default-avatar.jpg?w=300&ssl=1',
--   status varchar(255),
--   is_active boolean NOT NULL DEFAULT true,
--   created_at timestamp DEFAULT NOW(),
--   updated_at timestamp DEFAULT NOW()
-- );

-- -- CREATE TABLE IF NOT EXISTS friends (
-- --   id SERIAL PRIMARY KEY NOT NULL,
-- --   user1_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
-- --   user2_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
-- --   invitation_accepted_at timestamp,
-- --   CONSTRAINT unique_friendship UNIQUE(user1_id,user2_id),
-- --   CONSTRAINT not_friend_self CHECK (user1_id != user2_id)
-- -- );

-- -- CREATE TABLE IF NOT EXISTS blocks (
-- --   id SERIAL PRIMARY KEY NOT NULL,
-- --   block_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
-- --   blockee_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
-- --   CONSTRAINT not_block_self CHECK (block_user_id != blockee_user_id)
-- -- );

-- CREATE TABLE IF NOT EXISTS friendlists (
--   id SERIAL PRIMARY KEY NOT NULL,
--   user_id INTEGER UNIQUE NOT NULL REFERENCES users (id) ON DELETE CASCADE
-- );

-- CREATE TABLE IF NOT EXISTS friends (
--   id SERIAL PRIMARY KEY NOT NULL,
--   friendlist_id INTEGER REFERENCES friendlists (id) ON DELETE CASCADE,
--   friend_id INTEGER REFERENCES users (id) ON DELETE CASCADE,
--   invitation_sent_at timestamp DEFAULT NOW(),
--   invitation_accepted_at timestamp,
--   CONSTRAINT unique_friendship UNIQUE(friendlist_id,friend_id)
-- );

-- CREATE TABLE IF NOT EXISTS blacklists (
--   id SERIAL PRIMARY KEY NOT NULL,
--   user_id INTEGER UNIQUE NOT NULL REFERENCES users (id) ON DELETE CASCADE
-- );

-- CREATE TABLE IF NOT EXISTS blocks (
--   id SERIAL PRIMARY KEY NOT NULL,
--   blacklist_id INTEGER REFERENCES blacklists (id) ON DELETE CASCADE,
--   user_id INTEGER REFERENCES users (id) ON DELETE CASCADE
-- );

-- CREATE TABLE IF NOT EXISTS chatrooms (
--   id SERIAL PRIMARY KEY NOT NULL,
--   chatroom_type VARCHAR(20) NOT NULL,
--   name VARCHAR(30) NOT NULL,
--   avatar VARCHAR(255),
--   created_at timestamp DEFAULT NOW(),
--   updated_at timestamp DEFAULT NOW(),
--   CONSTRAINT type_check CHECK (chatroom_type IN ('group', 'single'))
-- );

-- CREATE TABLE IF NOT EXISTS participants (
--   id SERIAL PRIMARY KEY NOT NULL,
--   user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
--   chatroom_id INTEGER NOT NULL REFERENCES chatrooms (id) ON DELETE CASCADE,
--   is_admin BOOLEAN default false NOT NULL,
--   created_at timestamp DEFAULT NOW(),
--   updated_at timestamp DEFAULT NOW(),
--   CONSTRAINT unique_participant UNIQUE(user_id,chatroom_id)
-- );

-- CREATE TABLE IF NOT EXISTS messages (
--   id SERIAL PRIMARY KEY NOT NULL,
--   owner_user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
--   chatroom_id INTEGER NOT NULL REFERENCES chatrooms (id),
--   content VARCHAR(255) NOT NULL,
--   is_deleted BOOLEAN DEFAULT false NOT NULL,
--   created_at timestamp DEFAULT NOW(),
--   updated_at timestamp DEFAULT NOW()
-- );

-- CREATE TABLE IF NOT EXISTS user_message_views (
--   id SERIAL PRIMARY KEY NOT NULL,
--   user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
--   message_id INTEGER NOT NULL REFERENCES messages (id) ON DELETE CASCADE,
--   CONSTRAINT unique_user_message_view UNIQUE(user_id,message_id)
-- );