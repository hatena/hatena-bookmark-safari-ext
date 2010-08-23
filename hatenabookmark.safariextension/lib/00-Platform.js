function onPlatform(context) {
    var platform = navigator.platform;

    if (platform.match(/mac/i)) {
        context.mac();
    } else if (platform.match(/win/i)) {
        context.windows();
    }
}
