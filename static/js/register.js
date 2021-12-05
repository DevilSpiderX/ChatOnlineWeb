function on_register_clicked() {
    let uid = $("#user").val();
    let pwd = $("#password").val();
    let nick = $("#nick").val();
    let age = $("#age").val();
    let gender = $("#gender").val();
    let intro = $("#intro").val();
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
        "pwd": pwd,
        "nick": nick,
        "age": age,
        "gender": gender,
        "intro": intro
    }
    $.ajax("/register", {
        type: "POST", data: postBody,
        success: function (data) {
            switch (data["code"]) {
                case "0": {
                    alert("注册成功");
                    window.location = "./login.html";
                    break;
                }
                case "1": {
                    alert("注册失败");
                    break;
                }
                case "2": {
                    alert("用户名已存在，请换一个用户名");
                    break;
                }
            }
        }
    });
}