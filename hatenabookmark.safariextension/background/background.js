console.log('background loading');

var isEuraAgreed = function() {
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
    if (isEuraAgreed()) {
        UserManager.loginWithRetry(15 * 1000);
    }
});

// login check
setInterval(function() {
    if (isEuraAgreed()) {
        UserManager.login();
    }
}, 1000 * 60 * 15);

// chrome webdatabase 5M 制限のため、tag 参照テーブルを作らない
Model.Bookmark.afterSave = function() {
}

// debug
/*
setTimeout(function() {
    var url = 'http://d.hatena.ne.jp/HolyGrail/20091107/1257607807';
    url = 'http://b.hatena.ne.jp/articles/200911/598';
    url = 'http://www.amazon.co.jp/exec/obidos/ASIN/B002T9VBP8/hatena-uk-22/ref=nosim';
    url = 'http://b.hatena.ne.jp/entry/s/addons.mozilla.org/ja/firefox/addon/1843';
    url = 'https://addons.mozilla.org/ja/firefox/addon/1843';
    // url = 'http://hail2u.net/blog/webdesign/yui3-css-reset-problem.html?xx';
    url = 'http://example.com/';
    url = '/background/popup.html?debug=1&url=' + encodeURIComponent(url);
    // var url = 'http://www.hatena.ne.jp/';
    Abstract.tabs.create({
        url: url,
    });
}, 10);

/*
setTimeout(function() {
    var url = '/tests/test.html';
    Abstract.tabs.create({
        url: url,
    });
}, 10);
*/

/*
setTimeout(function() {
chrome.windows.create({url:'../tests/test.html'});
}, 10);
*/

console.log('background loaded');
