class Fiora {
    constructor() {
        const socket = require('socket.io-client')('http://suisuijiang.com:10615/');
        this.socket = socket;

        socket.on('connect', function (socket) {
            console.log("on connect");
        });
        socket.on('event', function (data) {
            console.log('event', data);
        });
        socket.on('disconnect', function () {
            console.log("disconnect");
        });
        socket.on('groupMessage', ({
            type,
            content,
            createTime,
            from: {
                avatar,
                username,
            },
            to: {
                _id
            }
        }) => {
            if(avatar.match(/\w{1,10}/)){
                avatar=`https://ooo.0o0.ooo/2016/12/03/584253eca7025.jpeg`;
            }
            let room;
            for (const i in this.groupMap) {
                if (this.groupMap[i] === _id) {
                    room = i;
                    break;
                }
            }
            console.log(this.groupMap, _id)
            if (!room || !this.listeners[room]) {
                return;
            }
            const message = {
                type,
                content,
                avatar,
                name: username,
                time: (new Date(createTime)).getTime()
            }
            console.log(message);
            this.listeners[room].forEach(function (cb) {
                cb(message);
            });

        });
        Object.assign(this, {
            listeners: {},
            groupMap: {},
        });
    }
    login(username, password) {
        return new Promise((resolve, reject) => {
            this.socket.emit("message", {
                data: {
                    username,
                    password
                },
                method: "POST",
                path: "/auth"
            }, (result) => {
                if (result.status === 201) {
                    this.token = result.data.token;
                    result.data.user.groups.forEach((group) => {
                        this.groupMap[group.name] = group._id;
                    });

                    resolve();
                } else {
                    reject(result.data);
                }
            });
        });
    }
    send(room, type, content) {
        return new Promise((resolve, reject) => {
            this.socket.emit("message", {
                method: "POST",
                path: "/groupMessage",
                data: {
                    content,
                    token: this.token,
                    linkmanId: this.groupMap[room],
                    type,
                },
            }, ({
                data,
                status
            }) => {
                console.log("data",data,status)
                if (status === 201) {
                    resolve();
                } else {
                    reject(data);
                }
            })
        });
    }
    join(groupName) {
        return new Promise((resolve, reject) => {
            this.socket.emit("message", {
                data: {
                    groupName,
                    token: this.token,
                },
                method: "POST",
                path: "/group/members"
                    //            avatar: "http://cr.mdzzapp.com/images/expressions/喷.png"
            }, (result) => {
                console.log(result);
                if (result.status === 201) {
                    this.groupMap[groupName] = result.data._id;
                    resolve();
                } else {
                    reject(result.data);
                }
            });
        });

    }
    listen(room, cb) {
        if (!this.listeners[room]) {
            this.listeners[room] = [];
        }
        this.listeners[room].push(cb);
    }
}
module.exports = Fiora;
//var fiora = new Fiora();
//fiora.login("name", "pwd").then(function () {
//    console.log("success");
//    fiora.join("god").catch(function (e) {
//        console.log(e);
//    });
//    fiora.join("cr").catch(function (e) {
//        console.log(e);
//    });
//
//    fiora.send("god", "text", "api test");
//    fiora.listen("god", function (message) {
//        console.log("cr", message);
//    });
//    fiora.listen("cr", function (message) {
//        console.log("cr", message);
//    });
//    fiora.listen("fiora", function (message) {
//        console.log("fiora", message);
//    });
//
//}).catch(function (e) {
//    console.log(e);
//});
