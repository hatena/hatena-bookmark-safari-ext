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
                event.target.disabled = !validateURL(tab.url);
                break;
            default:
                break;
            }
        default:
            break;
        }
    }

    var identifiers = {
        bookmarkButton         : Extension.getIdentifier("bookmark-button"),
        bookmarkButtonComment  : Extension.getIdentifier("bookmark-button-comment"),
        bookmarkButtonBookmark : Extension.getIdentifier("bookmark-button-bookmark"),
        popularPagesButton     : Extension.getIdentifier("popular-pages-button"),
    };
    var bookmarkIdentifiersInOrder = ['bookmarkButtonComment', 'bookmarkButton', 'bookmarkButtonBookmark'];

    var buttonImages = {};
    buttonImages[Extension.getIdentifier("bookmark-button")] = {
        done: safari.extension.baseURI + 'images/bookmark_checked.png',
        yet:  safari.extension.baseURI + 'images/bookmark.png'
    };
    buttonImages[Extension.getIdentifier("bookmark-button-comment")] = {
        done: safari.extension.baseURI + 'images/comment_checked.png',
        yet:  safari.extension.baseURI + 'images/comment.png'
    };
    buttonImages[Extension.getIdentifier("bookmark-button-bookmark")] = {
        done: safari.extension.baseURI + 'images/append_checked.png',
        yet:  safari.extension.baseURI + 'images/append.png'
    };

    buttonImages[Extension.getIdentifier("popular-pages-button")] = {
        done: safari.extension.baseURI + 'images/entrylist_checked.png',
        yet:  safari.extension.baseURI + 'images/entrylist.png'
    };


    // 指定したkeyのだけ
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

    // ポップアップを出すボタン
    // 最初のブクマボタンにブクマカウンタがでる
    function getBookmarkButtons() {
        var buttons = [];
        bookmarkIdentifiersInOrder.forEach(function(key) {
            safari.extension.toolbarItems.forEach(function (toolbarItem) {
                if (toolbarItem.identifier === identifiers[key]) buttons.push(toolbarItem);
            });
        });
        return buttons;
    }

    function showPopup(view, url) {
        var tab  = safari.application.activeBrowserWindow.activeTab;
        var page = tab.page;

        page.dispatchMessage("showPopup", {view: view, url: url});
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
        var url;
        if (event.userInfo && event.userInfo.url) {
            url = event.userInfo.url;
        }

        switch (event.command) {
        case "bookmarkButtonComment":
        case "HatenaBookmarkShowBookmarkComment":
            showPopup('comment', url);
            break;
        case "bookmarkButtonBookmark":
        case "HatenaBookmarkAddBookmark":
            showPopup('bookmark', url);
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
        // バッジ表示
        // たくさんあるとき先頭の
        // 1つもないときやめる
        if (!activeTab) activeTab = safari.application.activeBrowserWindow.activeTab;
        if (shouldShowCounter(activeTab)) {
            HTTPCache.counter.get(activeTab.url).next(function(count) {
                var buttons = getBookmarkButtons();
                var firstButton = buttons.shift();
                if (firstButton) {
                    firstButton.badge = count;
                    buttons.forEach(function(b) {
                        b.badge = 0;
                    });
                }
            });
        } else {
            getBookmarkButtons().forEach(function(b) {
                b.badge = 0;
            });
        }

        if (UserManager.user) {
            // ブクマ済のとき画像変える
            if (!getBookmarkButtons()) return;
            UserManager.user.hasBookmark(activeTab.url).next(function(bool) {
                safari.extension.toolbarItems.forEach(function (button) {
                    var url = buttonImages[button.identifier][bool ? 'done' : 'yet'];
                    if (url) button.image = url;
                });
            });
        }
    });


    safari.application.addEventListener("contextmenu", handleContextMenu, false);

    function handleContextMenu(event) {
        if (event.userInfo && event.userInfo.nodeName.toLowerCase() === "a") {
            if (validateURL(event.userInfo.url)) {
                event.contextMenu.appendContextMenuItem("HatenaBookmarkShowBookmarkComment", "リンク先のはてなブックマークコメントを表示");
            }
        } else {
            if (validateURL(event.target.url)) {
                if (getBookmarkButtons().length == 0) {
                    // ブクマボタンでてないとき
                    event.contextMenu.appendContextMenuItem("HatenaBookmarkAddBookmark", "このページをはてなブックマークに追加");
                    event.contextMenu.appendContextMenuItem("HatenaBookmarkShowBookmarkComment", "このページのはてなブックマークコメントを表示");
                }
                console.log(getBookmarkButtons());
                if (!getBookmarkButton('popularPagesButton')) {
                    // 人気エントリ表示ボタンがでてないときコンテキストメニュー出す
                    event.contextMenu.appendContextMenuItem("HatenaBookmarkShowPopularPages", "このページの人気エントリを表示");
                }
            }
        }
    }

})();
