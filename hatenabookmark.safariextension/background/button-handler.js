(function() {
    safari.application.addEventListener("command", performCommand, false);

    var bookmarkButton;

    var identifiers = {
        bookmarkButton : Extension.getIdentifier("bookmark-button")
    };

    safari.extension.toolbarItems.forEach(function (toolbarItem) {
        switch (toolbarItem.identifier) {
        case identifiers.bookmarkButton:
            bookmarkButton = toolbarItem;
            break;
        }
    });

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

    TabManager.bind("change", function (ev, activeTab) {
//        bookmarkButton.disabled = true;
        if (activeTab.url) {
            HTTPCache.counter.get(activeTab.url).next(function(count) {
                bookmarkButton.badge = count;
                return count;
            }).wait(1).next(function(count) {
                bookmarkButton.disabled = false;
            });
        } else {
            bookmarkButton.badge = 0;
            setTimeout(function() {
//                bookmarkButton.disabled = false;
            }, 100);
        }
    });
})();
