const own_uid = getQueryVariable("uid");
const token = getQueryVariable("token");
const ownInfo = {}//keys: nick, age, gender, intro
const friendsInfo = {};//keys: uid   //friendsInfo[uid]->keys: nick, age, gender, intro
const messageRecord = {};//keys: uid   //messageRecord[uid] is array
// messageRecord[uid][n]->keys: msg, sender_uid, time
let ws;

init();

/**
 * 初始化面板
 */
function init() {
    getInformation(own_uid, function (resp) {
        switch (resp["code"]) {
            case "0" : {
                let data = resp["data"];
                ownInfo["nick"] = data["nick"];
                ownInfo["age"] = data["age"];
                ownInfo["gender"] = data["gender"];
                ownInfo["intro"] = data["intro"];
                let title = "用户面板 - " + ownInfo["nick"] + " - ChatOnline";
                $("head title").text(title);
                break;
            }
            case "1": {
                location.reload();
                break;
            }
            case "1001" : {
                alert(resp["msg"]);
                window.location = "./login.html";
                break;
            }
        }
    });
    getFriendsImpl();
    $(document).ready(function () {
        ws = new WebSocket("ws://" + location.host + "/websocket/" + own_uid + "/" + token);
        ws.onopen = wsOnOpen;
        ws.onclose = wsOnClose;
        ws.onerror = wsOnError;
        ws.onmessage = wsOnMessage;
    });
}

function getQueryVariable(variable) {
    let query = window.location.search.substring(1);
    let vars = query.split("&");
    for (let i = 0; i < vars.length; i++) {
        let pair = vars[i].split("=");
        if (pair[0] === variable) {
            return pair[1];
        }
    }
    return "null";
}

function getFriendsImpl() {
    getFriends(own_uid, function (resp) {
        switch (resp["code"]) {
            case "0" : {
                for (let key in friendsInfo) {
                    delete friendsInfo[key];
                }
                for (let friend of resp["data"]) {
                    let friend_uid = friend["friend_uid"];
                    friendsInfo[friend_uid] = {};
                    friendsInfo[friend_uid]["nick"] = friend["nick"];
                    friendsInfo[friend_uid]["age"] = friend["age"];
                    friendsInfo[friend_uid]["gender"] = friend["gender"];
                    friendsInfo[friend_uid]["intro"] = friend["intro"];
                    messageRecord[friend_uid] = [];
                }
                break;
            }
            case "1": {
                console.log(resp["msg"]);
                for (let key in friendsInfo) {
                    delete friendsInfo[key];
                }
                break;
            }
            case "1001" :
            case "1002" : {
                alert(resp["msg"]);
                window.location = "./login.html";
                break;
            }
        }
    });
}

/* ↓↓这一块是写POST的方法的↓↓ */
function logout() {
    let postBody = {
        "uid": own_uid
    };
    $.ajax("/logout", {
        type: "POST", data: postBody,
        success: function (resp) {
            if (resp["code"] !== "0") {
                alert(resp["msg"]);
            }
            ws.close();
            window.location = "./login.html";
        }
    });
}

function addFriend(own_uid, friend_uid, success) {
    let postBody = {
        "own_uid": own_uid,
        "friend_uid": friend_uid
    };
    $.ajax("/addFriend", {
        type: "POST", data: postBody,
        success: success,
        error: function () {
            location.reload();
        }
    });
}

function deleteFriend(own_uid, friend_uid, success) {
    let postBody = {
        "own_uid": own_uid,
        "friend_uid": friend_uid
    };
    $.ajax("/deleteFriend", {
        type: "POST", data: postBody,
        success: success,
        error: function () {
            location.reload();
        }
    });
}

function getInformation(uid, success) {
    let postBody = {
        "uid": uid
    };
    $.ajax("/getInformation", {
        type: "POST", data: postBody,
        success: success,
        error: function () {
            location.reload();
        }
    });
}

function getHistory(own_uid, friend_uid, success) {
    let postBody = {
        "own_uid": own_uid,
        "friend_uid": friend_uid
    };
    $.ajax("/getHistory", {
        type: "POST", data: postBody,
        success: success,
        error: function () {
            location.reload();
        }
    });
}

function getFriends(own_uid, success) {
    let postBody = {
        "own_uid": own_uid
    };
    $.ajax("/getFriends", {
        type: "POST", data: postBody,
        success: success,
        error: function () {
            location.reload();
        }
    });
}

function updateInformation(own_uid, nick, age, gender, intro, success) {
    let postBody = {
        "own_uid": own_uid,
        "nick": nick,
        "age": age,
        "gender": gender,
        "intro": intro
    };
    $.ajax("/updateInformation", {
        type: "POST", data: JSON.stringify(postBody), contentType: "application/json",
        success: success,
        error: function () {
            location.reload();
        }
    });
}

/* ↑↑这一块是写POST的方法的↑↑ */

/* ↓↓这一块是写WebSocket的方法的↓↓ */
function wsOnOpen() {
    // console.log(ev);
    console.log("WebSocket成功接入服务器");
    window.setInterval(function () {
        console.log("10分钟Ping一次，防止断开");
        ws.send(JSON.stringify({"cmd": "ping"}));
    }, 10 * 60 * 1000);
}

function wsOnClose() {
    console.log("连接已关闭");
    window.location = "./login.html";
}

function wsOnError(ev) {
    alert("WebSocket发生错误" + ev.type);
    console.log(ev);
    console.log("WebSocket发生错误")
}

function wsOnMessage(msgEv) {
    let resp = JSON.parse(msgEv.data);
    switch (resp["cmd"]) {
        case "forcedOffline": {
            if (resp["code"] === "0") {
                alert(resp["msg"]);
                window.location = "./login.html";
            }
            break;
        }
        case "acceptMessage": {
            if (resp["code"] === "0") {
                messageRecord[resp["sender_uid"]].push(
                    {
                        "msg": resp["msg"],
                        "time": new Date(resp["time"]),
                        "sender_uid": resp["sender_uid"]
                    }
                );
                let actEvent = new CustomEvent("messageAccept",
                    {"detail": {"uid": resp["sender_uid"]}});
                document.dispatchEvent(actEvent);
            }
            break;
        }
        case "sendMessage": {
            switch (resp["code"]) {
                case "0": {
                    console.log(resp["msg"]);
                    break;
                }
                case "4" :
                case "5": {
                    alert("发送失败，" + resp["msg"]);
                    break;
                }
                case "500" : {
                    alert(resp["msg"]);
                    window.location = "./login.html";
                    break;
                }
            }
            break;
        }
        case "friendInfoUpdate": {
            if (resp["code"] === "0") {
                console.log(resp["msg"]);
                setTimeout(getFriendsImpl, 1000);
            }
            break;
        }
    }
}

function sendMessage(receiver_uid, message) {
    messageRecord[receiver_uid].push(
        {
            "msg": message,
            "time": new Date(),
            "sender_uid": own_uid
        }
    );
    let data = {
        "cmd": "sendMessage",
        "receiver_uid": receiver_uid,
        "msg": message
    };
    ws.send(JSON.stringify(data));
}

/* ↑↑这一块是写WebSocket的方法的↑↑ */

