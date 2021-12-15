function on_button_clicked() {
    let uid = $("#user").val();
    let pwd = $("#password").val();
    let new_pwd = $("#new_password").val();
    if (uid === "") {
        alert("账号不能为空");
        return;
    }
    if (pwd === "") {
        alert("旧密码不能为空");
        return;
    }
    if (new_pwd === "") {
        alert("新密码不能为空");
        return;
    }
    let postBody = {
        "own_uid": uid,
        "pwd": pwd,
        "new_pwd": new_pwd
    }
    $.ajax("/updatePassword", {
        type: "POST", data: postBody,
        success: function (resp) {
            switch (resp["code"]) {
                case "0": {
                    alert("修改成功");
                    break;
                }
                case "1": {
                    alert("修改失败");
                    break;
                }
                case "5":
                case "6": {
                    alert(resp["msg"]);
                    break;
                }
            }
        }
    });
}