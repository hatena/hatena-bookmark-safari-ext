(function () {
    function locationMatched(patterns) {
        var href = location.href;
        return patterns.some(function (pat) { return href.indexOf(pat) === 0; });
    }

    var LOGIN_CHECK_PATTERNS = [
        "http://b.hatena.ne.jp/guide/chrome_register",
        "http://www.hatena.ne.jp/login",
        "https://www.hatena.ne.jp/login"
    ];

    var LOGOUT_CHECK_PATTERNS = [
        "http://www.hatena.ne.jp/logout",
        "https://www.hatena.ne.jp/logout"
    ];

    if (locationMatched(LOGIN_CHECK_PATTERNS)) {
        Connect()
            .send("LoginCheck", { url : location.href })
            .recv(function () {})
            .close();
    }


    if (locationMatched(LOGOUT_CHECK_PATTERNS)) {
        Connect()
            .send("Logout", { url : location.href })
            .recv(function () {})
            .close();
    }
})();
