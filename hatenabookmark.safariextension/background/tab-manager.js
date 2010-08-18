var TabManager = (function () {
    var TabManager = $({});
    var activeTab;

    window.setInterval(function () {
        var currentTab = safari.application.activeBrowserWindow.activeTab;

        if (!activeTab || activeTab !== currentTab) {
            activeTab = currentTab;
            TabManager.trigger("change", currentTab);
        }
    }, 50);

    return TabManager;
})();
