const own_uid = getQueryVariable("uid");
const token = getQueryVariable("token");
const ws = new WebSocket("ws://" + location.host + "/websocket/" + own_uid + "/" + token);

initHtml();

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

/**
 * 初始化面板
 */
function initHtml() {
    getInformation(own_uid, function (data) {
        switch (data["code"]) {
            case "0" : {
                let title = "用户面板 - " + data["msg"]["nick"] + " - ChatOnline"
                $("head title").text(title);
                break;
            }
            case "3" : {
                alert(data["msg"]);
                window.location = "./login.html";
                break;
            }
        }
    });
    ws.onopen = wsOnOpen;
    ws.onclose = wsOnClose;
    ws.onerror = wsOnError;
    ws.onmessage = wsOnMessage;
}

/* ↓↓这一块是写POST的方法的↓↓ */
function logout() {
    let postBody = {
        "uid": own_uid
    };
    $.ajax("/logout", {
        type: "POST", data: postBody,
        success: function (data) {
            if (data["code"] !== "0") {
                alert(data["msg"]);
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

function getFriends(uid, success) {
    let postBody = {
        "uid": uid
    };
    $.ajax("/getFriends", {
        type: "POST", data: postBody,
        success: success,
        error: function () {
            location.reload();
        }
    });
}

/* ↑↑这一块是写POST的方法的↑↑ */

/* ↓↓这一块是写WebSocket的方法的↓↓ */
function wsOnOpen(ev) {
    console.log(ev);
    console.log("WebSocket成功接入服务器");
}

function wsOnClose() {
    console.log("连接已关闭");
}

function wsOnError(ev) {
    alert("WebSocket发生错误" + ev.type);
    console.log(ev);
    console.log("WebSocket发生错误")
}

function wsOnMessage(msgEv) {
    let data = JSON.parse(msgEv.data);
    console.log(data);
    switch (data["cmd"]) {
        case "forcedOffline": {

            break;
        }
        case "acceptMessage": {

            break;
        }
        case "sendMessage": {

            break;
        }
    }
}

function sendMessage(receiver_uid, message) {
    let data = {
        "cmd": "sendMessage",
        "receiver_uid": receiver_uid,
        "msg": message
    };
    ws.send(JSON.stringify(data));
}

/* ↑↑这一块是写WebSocket的方法的↑↑ */

