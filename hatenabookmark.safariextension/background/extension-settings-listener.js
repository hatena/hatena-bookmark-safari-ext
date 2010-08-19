safari.extension.settings.addEventListener("change", function (ev) {
    console.log(sprintf("Settings [%s] changed (%s => %s)", ev.key, ev.oldValue, ev.newValue));
    Config.set(ev.key, ev.newValue);
}, false);
