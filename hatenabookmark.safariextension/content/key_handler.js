(function () {
    if (window.top !== window)
        return;

    var settings;

    var KeyManager = {
        commands: {},

        start: function () {
            window.addEventListener("keypress", this, true);
        },

        stop: function () {
            window.removeEventListener("keypress", this, true);
        },

        add: function (prefix, func) {
            this.commands[prefix] = func;
        },

        correctCharCode: function (charCode) {
            if (charCode >= 0x61 && charCode <= 0x7a)
                return charCode;

            if (charCode >= 0x41 && charCode <= 0x5a)
                return charCode + 32;

            return charCode + 96;
        },

        checkEquality: function (prefix, ev) {
            var key = String.fromCharCode(this.correctCharCode(ev.charCode));

            return (settings[prefix]["key"]   == key)
                && (settings[prefix]["shift"] == ev.shiftKey)
                && (settings[prefix]["ctrl"]  == ev.ctrlKey)
                && (settings[prefix]["alt"]   == ev.altKey)
                && (settings[prefix]["meta"]  == ev.metaKey);
        },

        execCommand: function (prefix, ev) {
            this.commands[prefix](ev);
        },

        handleEvent: function (ev) {
            for (var prefix in this.commands) {
                if (this.checkEquality(prefix, ev))
                    return this.execCommand(prefix, ev);
            }
        }
    };

    KeyManager.add("addBookmark", function () {
        console.log("Add Book Mark");
        Connect().send("PopupManager.show", {
            url  : location.href,
            view : "bookmark"
        }).recv(function () {}).close();
    });

    KeyManager.add("showComment", function () {
        console.log("Show Comment");
        Connect().send("PopupManager.show", {
            url  : location.href,
            view : "comment"
        }).recv(function () {}).close();
    });

    Connect()
        .send("Config.get.shortcuts").recv(function (ev) {
            settings = ev.message;

            if (settings["shortcut.addBookmark.key"] !== "disabled" &&
                settings["shortcut.showComment.key"] !== "disabled") {
                KeyManager.start();
            }
        })
        .close();
})();
