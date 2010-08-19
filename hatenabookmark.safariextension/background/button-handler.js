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

    function showPopup() {
        var tab  = safari.application.activeBrowserWindow.activeTab;
        var page = tab.page;

        page.dispatchMessage("showPopup", {});
    }

    function showPopularPages() {
        var tab  = safari.application.activeBrowserWindow.activeTab;
        var url = tab.url;

        var head = (url.match("([a-z]+://[^/]+)/?") || { 0 : null })[0];
        if (head) {
            Abstract.tabs.create({
                url      : "http://b.hatena.ne.jp/entrylist?sort=count&url=" + encodeURIComponent(head),
                selected : true
            });
        }
    }

    function performCommand(event) {
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
        case "popularPagesButton":
            showPopularPages();
            break;
        }
    }

    function shouldShowCounter (tab) {
        return tab.url
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
