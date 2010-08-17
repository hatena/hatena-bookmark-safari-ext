/**
 * @requires Connect.js
 */

var UserManagerProxy = $({});

$.extend(UserManagerProxy, {
    blessUser: function(user) {
        UserManagerProxy.user = new User(user._name, user.options);
    },

    saveBookmark: function (url) {
        Connect()
            .send("UserManager.user.saveBookmark", url).recv(function (_) {})
            .close();
    },

    deleteBookmark: function (url) {
        Connect()
            .send("UserManager.user.deleteBookmark", url).recv(function (_) {})
            .close();
    }
});

