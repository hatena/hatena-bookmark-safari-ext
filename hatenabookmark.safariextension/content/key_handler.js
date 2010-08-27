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

            return (settings[prefix]["key"]   == key)
                && (settings[prefix]["shift"] == ev.shiftKey)
                && (settings[prefix]["ctrl"]  == ev.ctrlKey)
                && (settings[prefix]["alt"]   == ev.altKey)
                && (settings[prefix]["meta"]  == ev.metaKey);
        },

        execCommand: function (prefix, ev) {
            this.commands[prefix](ev);
        },

        inputtingText: function (ev) {
            var elem = ev.target;
            var tag  = elem.localName.toLowerCase();

            if (tag === 'textarea')
                return true;

            if (tag === 'input') {
                var type = elem.getAttribute('type');

                if (!type || type === 'text' || type === 'password')
                    return true;
            }

            return false;
        },

        handleEvent: function (ev) {
            if (this.inputtingText(ev))
                return;

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

    Connect()
        .send("Config.get.shortcuts").recv(function (ev) {
            settings = ev.message;

            if (settings["shortcut.addBookmark.key"] !== "disabled") {
                KeyManager.add("addBookmark", function () {
                    Connect().send("PopupManager.show", {
                        url  : document.documentURI,
                        view : "bookmark"
                    }).recv(function () {}).close();
                });
            }

            if (settings["shortcut.showComment.key"] !== "disabled") {
                KeyManager.add("showComment", function () {
                    Connect().send("PopupManager.show", {
                        url  : document.documentURI,
                        view : "comment"
                    }).recv(function () {}).close();
                });
            }

            if (settings["shortcut.addBookmark.key"] !== "disabled" &&
                settings["shortcut.showComment.key"] !== "disabled") {
                KeyManager.start();
            }
        })
        .close();

    safari.self.addEventListener("message", function (ev) {
        if (ev.name === "keyboardShortcutChanged") {
            var message = ev.message;
            var key     = message.key;
            var value   = message.newValue;

            var fragments = key.split(".");

            if (fragments.length !== 3)
                return;

            var commandName = fragments[1];
            var commandKey  = fragments[2];

            settings[commandName][commandKey] = value;
        }
    }, false);
})();
