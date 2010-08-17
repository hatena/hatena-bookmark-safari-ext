(function() {
    if (window.top !== window) return;

    safari.self.addEventListener("message", performMessage, false);

    document.body.addEventListener("click", closeIframe, false);

    var iframe;

    window.addEventListener("message", function (ev) {
        var res;

        switch (ev.data) {
        case "getInfo":
            res = getInfo(ev);
            break;
        case "closeIframe":
            res = closeIframe(ev);
        }

        ev.source.postMessage(res, ev.origin);
    }, false);

    function getInfo(ev) {
        var res   = {};
        res.url   = location.href;
        res.title = document.title;

        return res;
    }

    function closeIframe(ev) {
        if (!iframe) return;
        iframe.style.display = 'none';
    }

    function performMessage(event) {
        switch (event.name) {
        case "insertIframe":
            if (!iframe)
                performInsertIframe(event);
            else
                showIframe(event);
            break;
        }
    }

    function performInsertIframe(event) {
        console.log('performInsertIframe');
        iframe = document.createElement('iframe');
        iframe.src = getSrc(event);

        with (iframe.style) {
            position   = 'fixed';
            right      = '0px';
            top        = '0px';
            height     = '100%';
            width      = '600px';
            background = 'white';
            zIndex     = 2147483647;
        }

        document.body.appendChild(iframe);
    }

    function showIframe(event) {
        with(iframe.style) {
            display = 'block';
        }
        iframe.src = getSrc(event);
    }

    function getSrc(event) {
        return safari.extension.baseURI + event.message + '?url=' + encodeURIComponent(location.href) + '&title=' + encodeURIComponent(document.title) +'&faviconUrl=' + encodeURIComponent((document.querySelector('link[rel~="icon"]')|| { href: '' }).href);
    }
})();
