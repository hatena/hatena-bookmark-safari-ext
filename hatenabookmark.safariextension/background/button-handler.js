(function() {
    safari.application.addEventListener("command", performCommand, false);
    safari.application.addEventListener("validate", validateCommand, false);

    function validateURL(url) {
        return url && /^https?:\/\//.test(url);
    }

    function validateCommand(event) {
        switch(event.target.toString()) {
        case "[object SafariExtensionToolbarItem]":
            switch (event.command) {
            case "bookmarkButtonComment": // toolbar items
            case "HatenaBookmarkShowBookmarkComment":
            case "bookmarkButtonBookmark":
            case "HatenaBookmarkAddBookmark":
            case "bookmarkButton":
            case "popularPagesButton":
            case "HatenaBookmarkShowPopularPages":
                var tab  = safari.application.activeBrowserWindow.activeTab;
                event.target.disabled = !validateURL(tab.url);
            }
            break;
        case "[object SafariExtensionContextMenuItem]":
            switch(event.command) {
            case "HatenaBookmarkAddBookmark": // context menues
            case "HatenaBookmarkShowBookmarkComment":
            case "HatenaBookmarkShowPopularPages":
                var tab  = safari.application.activeBrowserWindow.activeTab;
                event.target.disabled = !(Config.get('contextmenu.enabled') && validateURL(tab.url));
                break;
            default:
                break;
            }
        default:
            break;
        }
    }

    var identifiers = {
        bookmarkButton : Extension.getIdentifier("bookmark-button")
    };

    function getBookmarkButton(key) {
        if (!key) key = 'bookmarkButton';
        var bookmarkButton;
        safari.extension.toolbarItems.forEach(function (toolbarItem) {
            switch (toolbarItem.identifier) {
            case identifiers[key]:
                bookmarkButton = toolbarItem;
                return;
            }
        });
        return bookmarkButton;
    }

    function showPopup(view) {
        var tab  = safari.application.activeBrowserWindow.activeTab;
        var page = tab.page;

        page.dispatchMessage("showPopup", {view: view});
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
            showPopup('comment');
            break;
        case "bookmarkButtonBookmark":
        case "HatenaBookmarkAddBookmark":
            showPopup('bookmark');
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
            && tab.url !== 'about:blank'
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

        UserManager.user.hasBookmark(activeTab.url).next(function(bool) {
            // TODO: ボタン複数ある場合は?
            if (bool) {
                getBookmarkButton().image = safari.extension.baseURI + 'images/add-twitter.png';
            } else {
                getBookmarkButton().image = safari.extension.baseURI + 'images/bookmark.png';
            }
        });
    });
})();
