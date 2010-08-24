safari.extension.settings.addEventListener("change", function (ev) {
    Config.set(ev.key, ev.newValue);
}, false);
