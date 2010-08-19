(function() {
    safari.application.addEventListener("command", performCommand, false);

    var identifiers = {
        bookmarkButton : Extension.getIdentifier("bookmark-button")
    };

    function getBookmarkButton() {
        var bookmarkButton;
        safari.extension.toolbarItems.forEach(function (toolbarItem) {
            switch (toolbarItem.identifier) {
            case identifiers.bookmarkButton:
                bookmarkButton = toolbarItem;
                return;
            }
        });
        return bookmarkButton;
    }


    function performCommand(event) {
        function showPopup() {
            var tab  = safari.application.activeBrowserWindow.activeTab;
            var page = tab.page;

            page.dispatchMessage("showPopup", {});
        }
        switch (event.command) {
        case "bookmarkButtonComment":
            Config.set('popup.lastView', 'comment');
            showPopup();
            break;
        case "bookmarkButtonBookmark":
            Config.set('popup.lastView', 'bookmark');
            showPopup();
            break;
        case "bookmarkButton":
            showPopup();
            break;
        }
    }

    function shouldShowCounter (tab) {
        return tab.url
            && tab.url.indexOf('https') !== 0
            && Config.get('background.bookmarkcounter.enabled');
    }

    TabManager.bind("change", function (ev, activeTab) {
        var bookmarkButton = getBookmarkButton();
        if (shouldShowCounter(activeTab)) {
            HTTPCache.counter.get(activeTab.url).next(function(count) {
                bookmarkButton.badge = count;
            });
        } else {
            bookmarkButton.badge = 0;
        }
    });
})();
