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
            var newData = {};
            (['comment', 'dateYMD', 'dateYMDHM']).forEach(function(key) {
                newData[key] = r[key];
            });
            dispatch(newData);
        });
    });

    get("Model.Bookmark.search", function (ev, matched, dispatch) {
        // searchwordもargsに入れる args.word
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
        return UserManager.user;
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
});
