const uid = getQueryVariable("uid");
const ws = new WebSocket("ws://" + location.host + "/websocket/" + uid);

/**
 * 初始化面板
 */
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
    return null;
}

function initHtml() {
    let postBody = {
        "uid": uid
    }
    $.ajax("/getInformation", {
        type: "POST", data: postBody,
        success: function (data) {
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
        },
        error: function () {
            location.reload();
        }
    });
    ws.onopen = wsOnOpen;
    ws.onclose = wsOnClose;
    ws.onerror = wsOnError;
    ws.onmessage = wsOnMessage;
}

/* ↓↓这一块是写POST的方法的↓↓ */
function logout() {
    $.ajax("/logout", {
        type: "POST",
        success: function (data) {
            if (data["code"] !== "0") {
                alert(data["msg"]);
            }
            ws.close();
            window.location = "./login.html";
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
    console.log(JSON.parse(msgEv.data));
}

/* ↑↑这一块是写WebSocket的方法的↑↑ */

