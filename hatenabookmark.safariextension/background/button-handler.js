(function() {
    safari.application.addEventListener("command", performCommand, false);

    safari.extension.toolbarItems.forEach(function (toolbarItem) {
        var id = Extension.getIdentifier("bookmark-button");
        if (toolbarItem.identifier == id) {
            initBookmarkButton(toolbarItem);
        }
    });

    function initBookmarkButton(button) {
    }

    function performCommand(event) {
        switch (event.command) {
        case "bookmarkButtonClicked":
            var tab  = safari.application.activeBrowserWindow.activeTab;
            var page = tab.page;
            page.dispatchMessage("insertIframe", "background/popup.html");
            break;
        }
    }
})();
