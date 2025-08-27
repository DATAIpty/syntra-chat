import authService from './authService';
import usersService from './userService';
import chatService from './chatService';

// Main API (auth and collections)
const mainApi = {
    auth: authService,
    users: usersService,
}

// Chat API (conversations and messaging)
const chatApi = {
    chat: chatService,
}

export { mainApi, chatApi }; 
