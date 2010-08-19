
(function() {
    var defaults = {
        // ================================================== //
        // safari.extension.settings
        // ================================================== //

        'popup.window.width': {
            'default': 550,
            type: 'unsignedInt'
        },
        'popup.window.height': {
            'default': 450,
            type: 'unsignedInt'
        },
        'popup.search.result.threshold': {
            'default': 200,
            type: 'unsignedInt'
        },

        'content.webinfo.enabled': true,
        'popup.tags.recommendTags.enabled': true,
        'popup.tags.complete.enabled': true,
        'popup.tags.allTags.enabled': true,
        'background.bookmarkcounter.enabled': true,
        'popup.commentviewer.autodetect.threshold': 15,
        'contextmenu.enabled': true,

        // ================================================== //
        // localStorage
        // ================================================== //

        'popup.search.lastWord': '',
        'popup.commentviewer.togglehide': false,
        'popup.tags.showAllTags': false,
        'popup.bookmark.confirmBookmark': false,
        'popup.bookmark.postTwitter': false,
        'popup.bookmark.addAsin': false,
        'popup.bookmark.lastCommentValue': {},
        'popup.lastView': 'comment'
    };
    Object.keys(defaults).forEach(function(key) {
        Config.append(key, defaults[key]);
    });
})();

