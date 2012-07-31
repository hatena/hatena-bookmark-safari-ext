(function() {

    // ================================================== //
    // safari.extension.settings
    // ================================================== //
    var extensionSettings = {
        'content.webinfo.enabled': true,
        'popup.tags.recommendTags.enabled': true,
        'popup.tags.allTags.enabled': true,
        'background.bookmarkcounter.enabled': true,
        'popup.commentviewer.autodetect.threshold': 15,
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
        'popup.tags.showAllTags': false,
        'popup.bookmark.confirmBookmark': false,
        'popup.bookmark.postTwitter': false,
        'popup.bookmark.postFacebook': false,
        'popup.bookmark.postEvernote': false,
        'popup.bookmark.postMixiCheck': false,
        'popup.bookmark.addAsin': false,
        'popup.bookmark.lastCommentValue': {},
        'popup.lastView': 'comment'
    };

    function inform(settings) {
        Object.keys(settings).forEach(function (k) { Config.append(k, settings[k]); });
    }

    // �Ǘ��ΏۂƂȂ鍀�ڂƂ��̑����X�̏���Config �N���X�֒m�点��
    inform(extensionSettings);
    inform(tmpSettings);

    // safari.extension.settings �ŊǗ�����鍀�ڂɂ��Ă�, localStorage �֏������� (�������Ƃ�)
    if (safari.extension && safari.extension.settings) {
        Object.keys(extensionSettings).forEach(function (key) {
            var value = safari.extension.settings.getItem(key);
            Config.set(key, value);
        });
    }
})();
