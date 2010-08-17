Response(function (get, deferred) {
    get("HTTPCache.comment.get", function (ev, matched, dispatch) {
        var url = ev.message;
        HTTPCache.comment.get(url).next(function(r) {
            dispatch(r);
        });
    });

    get("UserManager.user", function (ev, matched, dispatch) {
        console.log(UserManager.user);
        return UserManager.user;
    });

});
