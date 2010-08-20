console.log('background loading');

var isEulaAgreed = function() {
    return !!localStorage.eula;
}

UserManager.bind('UserChange', function() {
    if (UserManager.user) Sync.init();
});

Sync.bind('complete', function() {
    // Manager.editBookmark('http://example.com/');
    $(document).trigger('BookmarksUpdated');
});

$(document).ready(function() {
    // console.log('ready');
    if (isEulaAgreed()) {
        UserManager.loginWithRetry(15 * 1000);
    }
});

// login check
setInterval(function() {
    if (isEulaAgreed()) {
        UserManager.login();
    }
}, 1000 * 60 * 15);

// chrome webdatabase 5M 制限のため、tag 参照テーブルを作らない
Model.Bookmark.afterSave = function() {
}

console.log('background loaded');
