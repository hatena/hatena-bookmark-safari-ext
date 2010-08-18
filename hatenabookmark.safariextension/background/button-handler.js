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
        switch (event.command) {
        case "bookmarkButtonClicked":
            var tab  = safari.application.activeBrowserWindow.activeTab;
            var page = tab.page;
            page.dispatchMessage("insertIframe", "background/popup.html");
            break;
        }
    }

    TabManager.bind("change", function (ev, activeTab) {
        bookmarkButton.badge = activeTab.title.length;
    });
})();
