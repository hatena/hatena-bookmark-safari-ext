(function () {
    if (window.top !== window)
        return;

    function inform(timing) {
        Connect()
            .send("BookmarkButton.inform", { timing : timing })
            .recv(function () {})
            .close();
    }

    inform("reset");

    window.addEventListener("DOMContentLoaded", function () {
        inform("loaded");
    }, false);
})();
