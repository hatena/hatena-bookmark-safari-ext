(function () {
    function locationMatched(patterns) {
        var href = document.documentURI;
        return patterns.some(function (pat) { return href.indexOf(pat) === 0; });
    }

    var LOGIN_CHECK_PATTERNS = [
        "http://b.hatena.ne.jp/guide/safari_register",
        "http://b.hatena.ne.jp/guide/safari_loggedin",
        "http://www.hatena.ne.jp/login",
        "https://www.hatena.ne.jp/login"
    ];

    var LOGOUT_CHECK_PATTERNS = [
        "http://www.hatena.ne.jp/logout",
        "https://www.hatena.ne.jp/logout"
    ];

    var ADD_BOOKMARK_PATTERNS = [
        "http://b.hatena.ne.jp/entry/",
        "http://b.hatena.ne.jp/entry?"
    ];

    if (locationMatched(LOGIN_CHECK_PATTERNS)) {
        Connect()
            .send("LoginCheck", { url : document.documentURI })
            .recv(function () {})
            .close();
    }

    if (locationMatched(LOGOUT_CHECK_PATTERNS)) {
        Connect()
            .send("Logout", { url : document.documentURI })
            .recv(function () {})
            .close();
    }

    if (locationMatched(ADD_BOOKMARK_PATTERNS)) {
        document.addEventListener("DOMContentLoaded", function () {
            var addBookmarkButton = document.querySelector(".add-bookmark");

            if (addBookmarkButton) {
                addBookmarkButton.addEventListener("click", function (ev) {
                    if (ev.button)
                        return;

                    var matched = ev.target.href.match(/\?url=(.*)$/);
                    if (!matched) return;

                    ev.preventDefault();
                    ev.stopPropagation();
                    var entryURL = decodeURIComponent(matched[1]);

                    Connect().send("PopupManager.show", { url : entryURL, view : "bookmark" }).recv(function (ev) {}).close();
                });
            }
        });
    }
})();
