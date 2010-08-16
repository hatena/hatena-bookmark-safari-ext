console.log('background loading');

var isEuraAgreed = function() {
    return !!localStorage.eula;
}

var ConnectMessenger = $({});

ConnectMessenger = $({});

ConnectMessenger.bind('login_check', function(data) {
    // console.log('login by url: ' + data.url);
    UserManager.loginWithRetry(15 * 1000);
});

ConnectMessenger.bind('logout', function(data) {
    // console.log('logout by url: ' + data.url);
    setTimeout(function() {
        UserManager.logout();
    }, 200);
});

ConnectMessenger.bind('get_siteinfo_for_url', function(event, data, port) {
    if (Config.get('content.webinfo.enabled')) {
        // console.log('got request of siteinfo for ' + data.url);
        SiteinfoManager.sendSiteinfoForURL(data.url, port);
    }
});

ConnectMessenger.bind('get_siteinfos_with_xpath', function(event, data, port) {
    if (Config.get('content.webinfo.enabled')) {
        // console.log('got request of siteinfos whose domain is XPath');
        SiteinfoManager.sendSiteinfosWithXPath(port);
    }
});

var bookmarkeditBridgePorts = {};
ConnectMessenger.bind('bookmarkedit_bridge_set', function(event, data, port) {
    var url = data.url;
    var disconnectHandler = function() {
        port.onDisconnect.removeListener(disconnectHandler);
        delete bookmarkeditBridgePorts[url];
    }
    bookmarkeditBridgePorts[url] = port;
    port.onDisconnect.addListener(disconnectHandler);
});

ConnectMessenger.bind('bookmarkedit_bridge_get', function(event, data, port) {
    // console.log('!get' + data.url);
    var url = data.url;
    // console.log(bookmarkeditBridgePorts);
    var bridgePort = bookmarkeditBridgePorts[url];
    if (bridgePort) {
        bridgePort.onMessage.addListener(function(info, con) {
            if (info.message == 'bookmarkedit_bridge_recieve' && data.url == url) {
                console.log('recieve!!');
                port.postMessage({
                    message: info.message,
                    data: info.data
                });
            }
        });

        bridgePort.postMessage({
            message: 'get',
            data: {}
        });
    }
});

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

if (false) {  // commentout out-----------------------------------------------
    // TODO: documentのfocus, blurイベントを取れなくて困ってる これが取れないと，横のタブに行って戻っても出たままになってしまう activeTabを50msごとに取ってはどうか，とか言ってた


Abstract.tabs.onUpdated.addListener(function(tabId, opt) {
    if (opt.status === 'loading')
        Manager.updateTabById(tabId);
});

Abstract.tabs.onSelectionChanged.addListener(function(tabId) {
    Manager.updateCurrentTab();
});

chrome.browserAction.onClicked.addListener(function(tab) {
    var url = tab.url;
    var info = window.popupWinInfo;
    if (info) {
        chrome.windows.getAll(null, function(allWindows) {
            var flag = false;
            for (var i = 0;  i < allWindows.length; i++) {
                if (parseInt(allWindows[i].id) == parseInt(info.windowId)) {
                    flag = allWindows[i];
                    break;
                }
            }
            if (flag) {
                Abstract.tabs.get(info.tabId, function(tab) {
                    if (URI.parse(tab.url).param('url') != url) {
                        var port = Abstract.tabs.connect(window.popupWinInfo.tabId);
                        port.postMessage({
                            message: 'popup-reload',
                            data: {
                                url: url,
                            }
                        });
                    }
                    flag.focus();
                });
            } else {
                delete window.popupWinInfo;
                setTimeout(function() {
                    window.open('/background/popup.html?url=' + encodeURIComponent(url));
                }, 10);
            }
        });
    } else {
        chrome.windows.getCurrent(function(w) {
            setTimeout(function() {
                window.open('/background/popup.html?url=' + encodeURIComponent(url));
            }, 10);
        });
    }
});

/*
chrome.browserAction.onClicked.addListener(function(tab) {
    Manager.editBookmarkTab(tab);
});
*/

chrome.self.onConnect.addListener(function(port, name) {
  port.onMessage.addListener(function(info, con) {
      if (!localStorage.eula) return;

      if (info.message)
          ConnectMessenger.trigger(info.message, [info.data, con]);
  });
});

}                               // commentout end-----------------------------------------------

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
