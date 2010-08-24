(function() {

    // ================================================== //
    // safari.extension.settings
    // ================================================== //
    var extensionSettings = {
        'popup.window.width': {
            'default': 550,
            type: 'unsignedInt'
        },
        'popup.window.height': {
            'default': 450,
            type: 'unsignedInt'
        },

        'content.webinfo.enabled': true,
        'popup.tags.recommendTags.enabled': true,
        'popup.tags.allTags.enabled': true,
        'background.bookmarkcounter.enabled': true,
        'popup.commentviewer.autodetect.threshold': 15,
        'contextmenu.enabled': true,
        'content.fans.enabled': true,
        'shortcut.addBookmark.key': 'b',
        'shortcut.addBookmark.ctrl': true,
        'shortcut.addBookmark.shift': true,
        'shortcut.addBookmark.alt': false,
        'shortcut.addBookmark.meta': false,
        'shortcut.showComment.key': 'c',
        'shortcut.showComment.ctrl': true,
        'shortcut.showComment.shift': true,
        'shortcut.showComment.alt': false,
        'shortcut.showComment.meta': false
    };

    // ================================================== //
    // localStorage
    // ================================================== //
    var tmpSettings = {
        'popup.search.lastWord': '',
        'popup.commentviewer.togglehide': false,
        'popup.tags.showAllTags': false,
        'popup.bookmark.confirmBookmark': false,
        'popup.bookmark.postTwitter': false,
        'popup.bookmark.addAsin': false,
        'popup.bookmark.lastCommentValue': {},
        'popup.lastView': 'comment'
    };

    function inform(settings) {
        Object.keys(settings).forEach(function (k) { Config.append(k, settings[k]); });
    }

    // 管理対象となる項目とその他諸々の情報をConfig クラスへ知らせる
    inform(extensionSettings);
    inform(tmpSettings);

    // safari.extension.settings で管理される項目については, localStorage へ書き込む (同期をとる)
    if (safari.extension && safari.extension.settings) {
        Object.keys(extensionSettings).forEach(function (key) {
            var value = safari.extension.settings.getItem(key);
            console.log("Sync " + key);
            console.log(Config.get(key) + " => " + value);
            Config.set(key, value);
        });
    }
})();
