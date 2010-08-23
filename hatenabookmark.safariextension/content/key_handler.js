(function () {
    if (window.top !== window)
        return;

    var settings;

    var KeyManager = {
        commands: {},

        start: function () {
            window.addEventListener("keydown", this, true);
        },

        stop: function () {
            window.removeEventListener("keydown", this, true);
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

        correctKeyCode: function (keyCode) {
            if (keyCode >= 0x61 && keyCode <= 0x7a)
                return keyCode;

            if (keyCode >= 0x41 && keyCode <= 0x5a)
                return keyCode + 32;

            return -1;
        },

        checkEquality: function (prefix, ev) {
            var keyCode = this.correctKeyCode(ev.keyCode);

            if (keyCode < 0)
                return false;

            var key = String.fromCharCode(keyCode);

            // console.log("Handled " + key);

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
                if (this.checkEquality(prefix, ev)) {
                    this.execCommand(prefix, ev);

                    ev.stopPropagation();
                    ev.preventDefault();

                    return;
                }
            }
        }
    };

    KeyManager.add("addBookmark", function () {
        Connect().send("PopupManager.show", {
            url  : location.href,
            view : "bookmark"
        }).recv(function () {}).close();
    });

    KeyManager.add("showComment", function () {
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
