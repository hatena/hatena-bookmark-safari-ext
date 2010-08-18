var TabManager = (function () {
    var TabManager = $({});
    var savedURL;

    window.setInterval(function () {
        var currentTab = safari.application.activeBrowserWindow.activeTab;
        var currentURL = currentTab.url;

        if (currentURL && savedURL !== currentURL) {
            savedURL = currentURL;
            TabManager.trigger("change", currentTab);
        }
    }, 100);

    return TabManager;
})();
