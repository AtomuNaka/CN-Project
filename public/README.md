This project was bootstrapped with Create React App.

# Simple Chat-app for Computer Network Phase2

This app is using React and Node.js for frontend, Socket.io for transmitting socket,
and MongoDB for database.

# Getting startted with the app

1. Make a .env file

cd public
cp .env.example .env
cd ..
cd server
cp .env.example .env
cd ..

Make sure to change the MONGO_URL to your own url in the .env file in server.

2. Install the dependencies

cd server
yarn
cd ..
cd public
yarn
cd ..

3. Start the development server

// For Frontend

cd public
yarn start

// For Backend

cd server
yarn start

Now you can open localhost:3000 in your browser

# Requirements

Just for the convenience, I have put some references to grade the score.

1. 留言板功能
   public\src\components\ChatContainer.jsx
   public\src\pages\Chat.jsx
   server\index.js

2. 註冊登入登出功能
   public\src\pages\Login.jsx
   public\src\components\Logout.jsx
   public\src\pages\Register.jsx
   server\controllers\userController.js

3. 聲音串流/網路電話
   public\src\components\RecordView.jsx
   public\src\components\ChatInput.jsx
   public\src\components\ConvertAudio.jsx

4. 影片串流/網路視訊
   public\src\components\ChatContainer.jsx
   public\src\pages\CallRoom.jsx

5. 額外功能
   Things that I implemented:

   multithread
   persistent HTTP
   process multiple request
   sending emoji
   user avatar
   change avatar image
   file selection
