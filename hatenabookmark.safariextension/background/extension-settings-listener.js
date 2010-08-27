safari.extension.settings.addEventListener("change", function (ev) {
    Config.set(ev.key, ev.newValue);

    // ショートカットキーの変更は各ウィンドウの各タブに通知したい
    if (/^shortcut\./.test(ev.key)) {
        safari.application.browserWindows.forEach(function (win) {
            win.tabs.forEach(function (tab) {
                tab.page.dispatchMessage("keyboardShortcutChanged", ev);
            });
        });
    }
}, false);
