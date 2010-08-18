var TabManager = (function () {
    var TabManager = $({});
    var savedURL;
    var savedTab;

    window.setInterval(function () {
        var currentTab = safari.application.activeBrowserWindow.activeTab;
        var currentURL = currentTab.url;

        if (savedURL !== currentURL || savedTab !== currentTab ) {
            savedTab = currentTab;
            savedURL = currentURL;
            TabManager.trigger("change", currentTab);
        }
    }, 100);

    return TabManager;
})();
