(function() {
    if (window.top !== window) return;

    safari.self.addEventListener("message", performMessage, false);

    document.body.addEventListener("click", performClick, false);

    var iframe;

    window.addEventListener("message", function (ev) {
        if (ev.data !== "getInfo")
            return;

        var res   = {};
        res.url   = location.href;
        res.title = document.title;

        ev.source.postMessage(res, ev.origin);
    }, false);

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
            position = 'fixed';
            right = '0px';
            top = '0px';
            height = '100%';
            width = '600px';
            background = 'white';
        }

        document.body.appendChild(iframe);
    }

    function showIframe(event) {
        with(iframe.style) {
            display = 'block';
        }
        iframe.src = getSrc(event);
    }

    function performClick(event) {
        if (!iframe) return;
        iframe.style.display = 'none';
    }

    function getSrc(event) {
        return safari.extension.baseURI + event.message + '?url=' + encodeURIComponent(location.href) + '&title=' + encodeURIComponent(document.title) +'&faviconUrl=' + encodeURIComponent((document.querySelector('link[rel~="icon"]')|| { href: '' }).href);
    }
})();
