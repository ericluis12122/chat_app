const users = [];

const addUser = ({ id, name, room }) => {
    console.log(id);
    name = name.trim().toLowerCase();
    room = room.trim().toLowerCase();

    if(users.find(user => user.room === room && user.name === name)){
        return { error: 'Username is taken' };
    }
    const newUser = { id, name, room };
    users.push(newUser);

    return { newUser };
};

const removeUser = ({ id }) => {
    console.log(id);
    const index = users.findIndex(user => user.id === id);
    console.log(index);
    if(index !== -1) {
        return users.splice(index, 1)[0];
    }
};

const getUser = ({ id }) => users.find(user => user.id === id);

const getUsersInRoom = ({ room }) => users.filter(user => user.room === room);

module.exports = { addUser, removeUser, getUser, getUsersInRoom };