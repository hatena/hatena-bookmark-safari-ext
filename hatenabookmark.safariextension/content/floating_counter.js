(function() {
    if (window.top !== window) return;
    if (document.documentURI.indexOf('https://') === 0) return;
    var counter;
    function createCounter() {
        counter = document.createElement('iframe');
        counter.id = 'hatena-bookmark-safari-counter-window';
        counter.src = safari.extension.baseURI + "background/floating_counter.html"
            + '?url=' + encodeURIComponent(document.documentURI);
        document.body.appendChild(counter);
    }

    // キャッシュ作ろうとする
    Connect()
        .send("HTTPCache.entry.get", document.documentURI).recv(function (ev) {
        })
        .close();

    document.addEventListener('DOMContentLoaded', function(event) {
        createCounter();
    }, false);


    // XXX: popup_managerに同じようなのがある
    function extractOrigin(str) {
        var matched = str.match(/([a-z-]+:\/\/[^\/]+)/);
        return matched[1];
    }

    window.addEventListener("message", function (ev) {
        var res;

        var myOrigin = extractOrigin(safari.extension.baseURI).toLowerCase();
        if (ev.origin !== myOrigin)
            return;

        if (ev.data.match(/^resizeCounter/)) {
            ev.data.split('?')[1].split('&').forEach(function(param) {
                var pair = param.split('=');
                var key = pair[0];
                var value = pair[1];
                counter.style.setProperty(key, value, 'important');
            });
            counter.style.setProperty('visibility', 'visible', 'important');
        }
    }, false);
})();
