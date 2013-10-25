var isEulaAgreed = function() {
    return localStorage.acceptEULA === 'true';
}

UserManager.bind('UserChange', function() {
    if (UserManager.user) Sync.init();
});

Sync.bind('complete', function() {
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
}, 1000 * 60 * 29);

// chrome webdatabase 5M 制限のため、tag 参照テーブルを作らない
// chrome拡張がこういうことなのでおいとく
Model.Bookmark.afterSave = function() {
}

$(document).bind('BookmarksUpdated', function(event) {
    TabManager.trigger('change');
});

safari.application.addEventListener('message', function (messageEvent) {
    switch (messageEvent.name) {
    case 'acceptEULA':
        localStorage.acceptEULA = 'true';
        break;
    case 'requestEulaConfirmation':
        var accept = localStorage.acceptEULA;
        messageEvent.target.page.dispatchMessage('respondEulaConfirmation', { accept: accept });
        break;
    }
}, false);
