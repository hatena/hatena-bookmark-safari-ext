Response(function (get, deferred) {
    get("HTTPCache.comment.get", function (ev, matched, dispatch) {
        var url = ev.message;
        HTTPCache.comment.get(url).next(function(r) {
            dispatch(r);
        });
    });

    get("HTTPCache.usertags.get", function (ev, matched, dispatch) {
        var username = ev.message;
        HTTPCache.usertags.get(username).next(function(r) {
            dispatch(r);
        });
    });

    get("HTTPCache.entry.get", function (ev, matched, dispatch) {
        var url = ev.message;
        HTTPCache.entry.get(url).next(function(r) {
            dispatch(r);
        });
    });

    get("Model.Bookmark.findByUrl", function (ev, matched, dispatch) {
        var url = ev.message;
        Model.Bookmark.findByUrl(url).next(function(r) {
            var newData;

            if (r) {
                newData = {};
                ['comment', 'dateYMD', 'dateYMDHM'].forEach(function (key) {
                    newData[key] = r[key];
                });
            }

            dispatch(newData);
        });
    });

    get("Model.Bookmark.search", function (ev, matched, dispatch) {
        // searchword„ÇÇargs„Å´ÂÖ•„Çå„Çã args.word
        var args = ev.message;
        var word = args.word;

        Model.Bookmark.search(word, args).next(function(res) {
            dispatch(res.map(function(r) {
                return {
                    title: r.title,
                    url: r.url,
                    body: r.body,
                    tags: r.tags,
                    dateYMD: r.dateYMD
                };
            }));
        });
    });

    get("UserManager.user", function (ev, matched, dispatch) {
        // TODO: îÒìØä˙ìIÇ… dispatch ÇµÇƒÇ‚ÇÁÇ»Ç¢Ç∆Ç®Ç©ÇµÇ≠Ç»ÇÈÅH
        setTimeout(function () {
            dispatch(UserManager.user);
        }, 0);
    });

    get("UserManager.user.saveBookmark", function (ev, matched, dispatch) {
        var url = ev.message;
        UserManager.user.saveBookmark(url);
        return url;
    });

    get("UserManager.user.deleteBookmark", function (ev, matched, dispatch) {
        var url = ev.message;
        UserManager.user.deleteBookmark(url);
        return url;
    });

    get("SiteinfoManager.getSiteinfoForURL", function (ev, matched, dispatch) {
        var url = ev.message;
        return SiteinfoManager.getSiteinfoForURL(url);
    });

    get("SiteinfoManager.getSiteinfosWithXPath", function (ev, matched, dispatch) {
        return SiteinfoManager.getSiteinfosWithXPath();
    });

    get("PopupManager.show", function (ev, matched, dispatch) {
        safari.application.activeBrowserWindow.activeTab.page.dispatchMessage("showPopup", ev.message);
        return "dummy";
    });

    get("Config.set", function (ev, matched, dispatch) {
        var args = ev.message;
        Config.set(args.key, args.value);
        return "dummy";
    });

    get("Config.get", function (ev, matched, dispatch) {
        var args = ev.message;
        return Config.get(args.key);
    });

    get("LoginCheck", function (ev, matched, dispatch) {
        console.log('login by url: ' + ev.message.url);
        UserManager.loginWithRetry(15 * 1000);
        return "dummy";
    });

    get("Logout", function (ev, matched, dispatch) {
        console.log('logout by url: ' + ev.message.url);
        setTimeout(function() {
            UserManager.logout();
        }, 200);
        return "dummy";
    });
});
