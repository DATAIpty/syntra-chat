import authService from './authService';
import usersService from './userService';

const api = {
    auth: authService,
    users: usersService,
}

export default api;