var UserManagerProxy = $({});


$.extend(UserManagerProxy, {
    blessUser: function(user) {
        UserManagerProxy.user = new User(user._name, user.options);
    }
});

