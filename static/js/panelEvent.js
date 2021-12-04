$(document).ready(function () {
    $("#collapsibleNavbar li:nth-of-type(1)").click(nav_ownInfo_click);
    $("#collapsibleNavbar li:nth-of-type(3)").click(nav_friends_li_click);
    $("#findUserModal button.btn.btn-success").click(findUserButton_click);
    $("#informationModal [data-type=send]").click(info_sendButton_click);
    $("#informationModal [data-type=add]").click(info_addButton_click);
    $("#informationModal [data-type=delete]").click(info_deleteButton_click);
});

function initInformationModal(nick, uid, age, gender, intro, sendHide, addHide, deleteHide) {
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
}

function nav_ownInfo_click() {
    initInformationModal(ownInfo["nick"], own_uid, ownInfo["age"], ownInfo["gender"],
        ownInfo["intro"], true, true, true);
}

function nav_friends_li_click() {
    $("#friendListModal ul")[0].innerHTML = "";
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
            friendsInfo[uid]["intro"], false, true, false);
        $("#informationModal").modal("show");
    })
    $("#friendListModal ul").append(friend);
}

function findUserButton_click() {
    let uid = $("#findUserModal input").val();
    if (uid === "") {
        alert("账号不能为空");
    }
    getInformation(uid, function (data) {
        switch (data["code"]) {
            case "0": {
                let msg = data["msg"];
                if (uid === own_uid) {
                    initInformationModal(msg["nick"], msg["uid"], msg["age"], msg["gender"], msg["intro"],
                        true, true, true);
                } else {
                    if (Object.keys(friendsInfo).indexOf(uid) !== -1) {
                        initInformationModal(msg["nick"], msg["uid"], msg["age"], msg["gender"], msg["intro"],
                            false, true, false);
                    } else {
                        initInformationModal(msg["nick"], msg["uid"], msg["age"], msg["gender"], msg["intro"],
                            true, false, true);
                    }
                }
                $("#informationModal").modal("show");
                break;
            }
            case "1": {
                alert(data["msg"]);
                break;
            }
            case "3": {
                alert(data["msg"]);
                window.location = "./login.html";
                break;
            }
        }
    });
}

function info_sendButton_click() {

}

function info_addButton_click() {
    let dataTags = $("#informationModal [data-value]");
    let nick = $(dataTags[0]).attr("data-value");
    let uid = $(dataTags[1]).attr("data-value");
    let age = Number($(dataTags[2]).attr("data-value"));
    let gender = $(dataTags[3]).attr("data-value");
    let intro = $(dataTags[4]).attr("data-value");
    addFriend(own_uid, uid, function (data) {
        switch (data["code"]) {
            case "0": {
                alert(data["msg"]);
                friendsInfo[uid] = {};
                friendsInfo[uid]["nick"] = nick;
                friendsInfo[uid]["age"] = age;
                friendsInfo[uid]["gender"] = gender;
                friendsInfo[uid]["intro"] = intro;
                $("#informationModal").modal("hide");
                break;
            }
            case "1":
            case "5":
            case "6": {
                alert(data["msg"]);
                break;
            }
            case "4": {
                alert(data["msg"]);
                window.location = "./login.html";
                break;
            }
        }
    });
}

function info_deleteButton_click() {
    let dataTags = $("#informationModal [data-value]");
    let uid = $(dataTags[1]).attr("data-value");
    deleteFriend(own_uid, uid, function (data) {
        switch (data["code"]) {
            case "0": {
                alert(data["msg"]);
                delete friendsInfo[uid];
                $("#informationModal").modal("hide");
                break;
            }
            case "1": {
                alert(data["msg"]);
                break;
            }
            case "4": {
                alert(data["msg"]);
                window.location = "./login.html";
                break;
            }
        }
    });
}