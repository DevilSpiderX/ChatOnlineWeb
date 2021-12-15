function on_button0_clicked() {
    let uid = $("#user").val();
    let pwd = $("#password").val();
    if (uid === "") {
        alert("账号不能为空");
        return;
    }
    if (pwd === "") {
        alert("密码不能为空");
        return;
    }
    let postBody = {
        "uid": uid,
        "pwd": pwd
    }
    $.ajax("/login", {
        type: "POST", data: postBody,
        success: function (resp) {
            //0 成功；1 密码错误；2 uid参数不存在；3 pwd参数不存在;4 uid不存在；
            switch (resp["code"]) {
                case "0": {
                    window.location = "./panel.html?uid=" + uid + "&token=" + resp["token"];
                    break;
                }
                case "1": {
                    alert(resp["msg"]);
                    break;
                }
                case "4": {
                    alert("账号不存在");
                    break;
                }
            }
        }
    });
}

function on_password_keydown(e) {
    if (e.key === "Enter") {
        on_button0_clicked();
    }
}

$(document).ready(function () {
    $("div.row.justify-content-around > button").click(on_button0_clicked);
    $("#password").keydown(on_password_keydown);
});