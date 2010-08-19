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

    var URINormalizer = {
        db: [
            ["http://(\\w+)\\.hatena\\.(ne\\.jp|com)/([A-Za-z][\\w-]{1,30}[A-Za-z0-9])/", function (matched) {
                return "http://" + matched[1] + ".hatena." + matched[2] + "/" + matched[3] + "/";
            }],
            ["http://twitter.com/([^/]+)", function (matched) {
                return "http://twitter.com/" + matched[1];
            }]
        ],

        takeHead: function (uri) {
            return (uri.match("([a-z]+://[^/]+)/?") || { 0 : null })[0];
        },

        normalize: function (uri) {
            var normalized;

            this.db.some(function (pair) {
                var matched = uri.match(pair[0]);

                if (matched) {
                    normalized = pair[1](matched);
                    return true;
                }

                return false;
            }, this);

            return normalized ? normalized : this.takeHead(uri);
        }
    };

    function showPopularPages() {
        var tab = safari.application.activeBrowserWindow.activeTab;
        var url = tab.url;

        var normalized = URINormalizer.normalize(url);

        if (normalized) {
            Abstract.tabs.create({
                url      : "http://b.hatena.ne.jp/entrylist?sort=count&url=" + encodeURIComponent(normalized),
                selected : true
            });
        }
    }

    function performCommand(event) {
        switch (event.command) {
        case "bookmarkButtonComment":
        case "HatenaBookmarkShowBookmarkComment":
            Config.set('popup.lastView', 'comment');
            showPopup();
            break;
        case "bookmarkButtonBookmark":
        case "HatenaBookmarkAddBookmark":
            Config.set('popup.lastView', 'bookmark');
            showPopup();
            break;
        case "bookmarkButton":
            showPopup();
            break;
        case "popularPagesButton":
        case "HatenaBookmarkShowPopularPages":
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
