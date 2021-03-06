$(document).ready(function () {
    initMainContainer();
    window.onresize = on_window_resize;
    //导航栏
    $("#collapsibleNavbar li:nth-of-type(1)").click(nav_ownInfo_click);
    $("#collapsibleNavbar li:nth-of-type(2)").click(nav_chat_click);
    $("#collapsibleNavbar li:nth-of-type(3)").click(nav_friends_li_click);
    //主容器
    $("body > div.container button.btn").click(on_sendContentButton_click);
    $("#sendContent").keydown(on_sendContent_keydown);
    //查找用户模态框
    $("#findUserModal button.btn.btn-success").click(findUserButton_click);
    $("#findUserModal .modal-body .input-group input").keydown(findUserInput_keydown);
    //用户信息模态框
    $("#informationModal [data-type=send]").click(info_sendButton_click);
    $("#informationModal [data-type=add]").click(info_addButton_click);
    $("#informationModal [data-type=delete]").click(info_deleteButton_click);
    $("#informationModal [data-type=update]").click(info_updateButton_click);
    //接收新消息事件
    document.addEventListener("messageAccept", on_messageAccept);
    //聊天记录模态框
    $("#historyModal button.btn.btn-success").click(historyModalButton_click);
    $("#historyModal .modal-body .input-group input").keydown(historyModalInput_keydown);
    //用户信息更改模态框
    $("#infoUpdateModal button.btn.btn-success").click(updateInfoButton_click);
});


function initMainContainer() {
    $("body>div.container .card-header").empty();
    let height = window.innerHeight - 190;
    $("body>div.container .card-body").css("height", height).css("max-height", height);
    $("body>div.container .my-row").empty();
    $("#sendContent").attr("disabled", "");
    $("body>div.container button.btn").attr("disabled", "");
}

function initInformationModal(nick, uid, age, gender, intro, sendHide, addHide, deleteHide, updateHide) {
    let dataTags = $("#informationModal [data-value]");

    $(dataTags[0]).attr("data-value", nick);
    $(dataTags[1]).attr("data-value", uid);
    $(dataTags[2]).attr("data-value", age);
    $(dataTags[3]).attr("data-value", gender);
    $(dataTags[4]).attr("data-value", intro);

    $(dataTags[0]).text(nick);
    $(dataTags[1]).text(uid);
    $(dataTags[2]).text(age);
    $(dataTags[3]).text(gender);
    $(dataTags[4]).text(intro);

    let buttons = $("#informationModal div.modal-footer button");
    if (sendHide) {
        $(buttons[0]).hide();
    } else {
        $(buttons[0]).show();
    }
    if (addHide) {
        $(buttons[1]).hide();
    } else {
        $(buttons[1]).show();
    }
    if (deleteHide) {
        $(buttons[2]).hide();
    } else {
        $(buttons[2]).show();
    }
    if (updateHide) {
        $(buttons[3]).hide();
    } else {
        $(buttons[3]).show();
    }
}

function nav_ownInfo_click() {
    initInformationModal(ownInfo["nick"], own_uid, ownInfo["age"], ownInfo["gender"],
        ownInfo["intro"], true, true, true, false);
}

function nav_chat_click() {
    $("a.navbar-brand").css("color", "white");
    let li_i = $("#collapsibleNavbar li:nth-of-type(2) i");
    li_i.removeClass("fa-commenting");
    li_i.addClass("fa-comment");
}

function nav_friends_li_click() {
    $("#friendListModal ul").empty();
    for (let uid in friendsInfo) {
        appendFriend(uid);
    }
}

function appendFriend(uid) {
    let friend = $("<li class=\"nav-item findUserLi\">" +
        "<div data-dismiss=\"modal\">" +
        "<span><i class=\"fa fa-user-circle-o fa-fw\"></i></span>" +
        friendsInfo[uid]["nick"] +
        "<span class=\"uid-span\">(" + uid + ")</span>" +
        "</div>" +
        "</li>");
    friend.click(function () {
        initInformationModal(friendsInfo[uid]["nick"], uid, friendsInfo[uid]["age"], friendsInfo[uid]["gender"],
            friendsInfo[uid]["intro"], false, true, false, true);
        $("#informationModal").modal("show");
    })
    $("#friendListModal ul").append(friend);
}

function on_sendContentButton_click() {
    let sendContent = $("#sendContent");
    let value = sendContent.val();
    let uid = $("body > div.container > .card").attr("data-uid");
    sendContent.val("");
    sendMessage(uid, value);
    addOwnBubble(value, new Date().format("yyyy-MM-dd hh:mm:ss"));
    appendChat(uid);
}

function on_sendContent_keydown(ev) {
    if (ev.key === "Enter") {
        on_sendContentButton_click();
    }
}

function openChat(uid, nick) {
    initMainContainer();
    $("#chatListModal").modal("hide");
    $("#collapsibleNavbar").collapse("hide");
    $("body > .container > .card").attr("data-uid", uid);
    $("body > .container .card-header").html(nick + "<span class=\"uid-span\">(" + uid + ")</span>");
    $("#sendContent").removeAttr("disabled");
    $("body > .container button").removeAttr("disabled");
    for (let index in messageRecord[uid]) {
        let record = messageRecord[uid][index];
        if (record["sender_uid"] === own_uid) {
            addOwnBubble(record["msg"], record["time"].format("yyyy-MM-dd hh:mm:ss"));
        } else if (record["sender_uid"] === uid) {
            addFriendBubble(uid, record["msg"], record["time"].format("yyyy-MM-dd hh:mm:ss"));
        }
    }
}

function on_messageAccept(data) {
    let uid = data.detail["uid"];
    let length = messageRecord[uid].length;
    let record = messageRecord[uid][length - 1];
    if ($("body > div.container .card").attr("data-uid") === uid) {
        appendChat(uid);
        addFriendBubble(uid, record["msg"], record["time"].format("yyyy-MM-dd hh:mm:ss"));
    } else {
        $("a.navbar-brand").css("color", "yellow");
        let li_i = $("#collapsibleNavbar li:nth-of-type(2) i");
        li_i.removeClass("fa-comment");
        li_i.addClass("fa-commenting");
        appendNewChat(uid);
        if (allowNotify) {
            const notify = new Notification(friendsInfo[uid]["nick"] + "（" + uid + "）", {
                body: record["msg"], tag: uid, icon: "./favicon.ico", silent: true
            });
            notify.onclick = function () {
                nav_chat_click();
                openChat(uid, friendsInfo[uid]["nick"]);
            };
            setTimeout(function () {
                notify.close();
            }, 5 * 1000);
        }
    }
}

function addOwnBubble(msg, timeStr) {
    let bubble = $("<div class=\"col-8 col-sm-7 col-md-6 col-lg-5 own-bubble\">" +
        "<h6>" + timeStr + "</h6>" +
        "<div data-value style=\"word-wrap:break-word;font-size: 25px;\">" + msg + "</div>" +
        "</div>");
    let myRow = $("body>div.container .my-row");
    myRow.append(bubble);
    $("body>div.container .pre-scrollable").scrollTop(myRow.height());
}

function addFriendBubble(uid, msg, timeStr) {
    let bubble = $("<div class=\"col-8 col-sm-7 col-md-6 col-lg-5 friend-bubble\">" +
        "<h6>" + timeStr + "</h6>" +
        "<div data-value style=\"word-wrap:break-word;font-size: 25px;\">" + msg + "</div>" +
        "</div>");
    let myRow = $("body>div.container .my-row");
    myRow.append(bubble);
    $("body>div.container .pre-scrollable").scrollTop(myRow.height());
}

function findUserButton_click() {
    let input = $("#findUserModal input");
    let uid = input.val();
    input.val("");
    if (uid === "") {
        alert("账号不能为空");
    }
    getInformation(uid, function (resp) {
        switch (resp["code"]) {
            case "0": {
                let data = resp["data"];
                if (uid === own_uid) {
                    initInformationModal(data["nick"], data["uid"], data["age"], data["gender"], data["intro"],
                        true, true, true, false);
                } else {
                    if (Object.keys(friendsInfo).indexOf(uid) !== -1) {
                        initInformationModal(data["nick"], data["uid"], data["age"], data["gender"], data["intro"],
                            false, true, false, true);
                    } else {
                        initInformationModal(data["nick"], data["uid"], data["age"], data["gender"], data["intro"],
                            true, false, true, true);
                    }
                }
                $("#informationModal").modal("show");
                break;
            }
            case "1": {
                alert(resp["msg"]);
                break;
            }
            case "3": {
                alert(resp["msg"]);
                window.location = "./login.html";
                break;
            }
        }
    });
}

function findUserInput_keydown(ev) {
    if (ev.key === "Enter") {
        $("#findUserModal").modal("hide");
        findUserButton_click();
    }
}


function info_sendButton_click() {
    let dataTags = $("#informationModal [data-value]");
    let nick = $(dataTags[0]).attr("data-value");
    let uid = $(dataTags[1]).attr("data-value");
    openChat(uid, nick);
}

function info_addButton_click() {
    let dataTags = $("#informationModal [data-value]");
    let nick = $(dataTags[0]).attr("data-value");
    let uid = $(dataTags[1]).attr("data-value");
    let age = Number($(dataTags[2]).attr("data-value"));
    let gender = $(dataTags[3]).attr("data-value");
    let intro = $(dataTags[4]).attr("data-value");
    addFriend(own_uid, uid, function (resp) {
        switch (resp["code"]) {
            case "0": {
                alert(resp["msg"]);
                friendsInfo[uid] = {};
                friendsInfo[uid]["nick"] = nick;
                friendsInfo[uid]["age"] = age;
                friendsInfo[uid]["gender"] = gender;
                friendsInfo[uid]["intro"] = intro;
                $("#informationModal").modal("hide");
                break;
            }
            case "1":
            case "4":
            case "5": {
                alert(resp["msg"]);
                break;
            }
            case "1001":
            case "1002": {
                alert(resp["msg"]);
                window.location = "./login.html";
                break;
            }
        }
    });
}

function info_deleteButton_click() {
    let dataTags = $("#informationModal [data-value]");
    let uid = $(dataTags[1]).attr("data-value");
    deleteFriend(own_uid, uid, function (resp) {
        switch (resp["code"]) {
            case "0": {
                alert(resp["msg"]);
                delete friendsInfo[uid];
                $("#informationModal").modal("hide");
                break;
            }
            case "1": {
                alert(resp["msg"]);
                break;
            }
            case "1001":
            case "1002": {
                alert(resp["msg"]);
                window.location = "./login.html";
                break;
            }
        }
    });
}

function info_updateButton_click() {
    $("#nickUpdate").val(ownInfo["nick"]);
    $("#ageUpdate").val(ownInfo["age"]);
    $("#genderUpdate").val(ownInfo["gender"]);
    $("#introUpdate").val(ownInfo["intro"]);
}

function appendChat(uid) {
    $("#chatListModal li[data-uid=" + uid + "]").remove();
    let friend = $("<li class=\"nav-item findUserLi\" data-uid=\"" + uid + "\">" +
        "<div>" +
        "<span><i class=\"fa fa-commenting-o fa-fw\"></i></span>" +
        friendsInfo[uid]["nick"] +
        "<span class=\"uid-span\">(" + uid + ")</span>" +
        "</div>" +
        "</li>");
    friend.click(function () {
        openChat(uid, friendsInfo[uid]["nick"]);
    })
    $("#chatListModal ul").prepend(friend);
}

function appendNewChat(uid) {
    $("#chatListModal li[data-uid=" + uid + "]").remove();
    let friend = $("<li class=\"nav-item findUserLi\" data-uid=\"" + uid + "\">" +
        "<div>" +
        "<span><i class=\"fa fa-commenting-o fa-fw\"></i></span>" +
        friendsInfo[uid]["nick"] +
        "<span class=\"uid-span\">(" + uid + ")</span>" +
        "<span class=\"uid-spin\"><i class=\"fa fa-spin fa-spinner\"></i></span>" +
        "</div>" +
        "</li>");
    friend.click(function () {
        $("#chatListModal li[data-uid=" + uid + "] span.uid-spin").remove();
        openChat(uid, friendsInfo[uid]["nick"]);
    })
    $("#chatListModal ul").prepend(friend);
}

function historyModalButton_click() {
    let input = $("#historyModal input.form-control");
    let uid = input.val();
    input.val("");
    if (uid === "") {
        alert("账号不能为空");
    }
    getHistory(own_uid, uid, function (resp) {
        switch (resp["code"]) {
            case "0": {
                messageRecord[uid] = [];
                for (let record of resp["data"]) {
                    messageRecord[uid].push(
                        {
                            "msg": record["message"],
                            "time": new Date(record["time"]),
                            "sender_uid": record["sender_uid"]
                        }
                    );
                }
                appendChat(uid);
                openChat(uid, friendsInfo[uid]["nick"]);
                break;
            }
            case "1": {
                alert(resp["msg"]);
                break;
            }
            case "1001":
            case "1002": {
                alert(resp["msg"]);
                window.location = "./login.html";
                break;
            }
        }
    })
}

function historyModalInput_keydown(ev) {
    if (ev.key === "Enter") {
        $("#historyModal").modal("hide");
        historyModalButton_click();
    }
}

function updateInfoButton_click() {
    let nick = $("#nickUpdate").val();
    let age = Number($("#ageUpdate").val());
    let gender = $("#genderUpdate").val();
    let intro = $("#introUpdate").val();
    if (nick === "") {
        alert("网名不能为空");
    }
    updateInformation(own_uid, nick, age, gender, intro, function (resp) {
        switch (resp["code"]) {
            case "0": {
                ownInfo["nick"] = nick;
                ownInfo["age"] = age;
                ownInfo["gender"] = gender;
                ownInfo["intro"] = intro;
                alert(resp["msg"]);
                $("#infoUpdateModal").modal("hide");
                break;
            }
            case "1": {
                alert(resp["msg"]);
                break;
            }
            case "1001":
            case "1002": {
                alert(resp["msg"]);
                window.location = "./login.html";
                break;
            }
        }
    });
}

function on_window_resize() {
    let height = window.innerHeight - 190;
    $("body>div.container .card-body").css("height", height).css("max-height", height);
}
