(function() {
    if (window.top !== window) return;

    safari.self.addEventListener("message", performMessage, false);

    document.body.addEventListener("click", closeIframe, false);

    var iframe;

    function extractOrigin(str) {
        var matched = str.match(/([a-z-]+:\/\/[^/]+)/);
        return matched[1];
    }

    window.addEventListener("message", function (ev) {
        var res;

        var myOrigin = extractOrigin(safari.extension.baseURI).toLowerCase();
        if (ev.origin !== myOrigin)
            return;

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
        var res = {};

        res.url   = location.href;
        res.title = document.title;

        var cannonical = getCannonical();
        if (cannonical)
            res.cannonical = cannonical;

        var images = getImages();
        if (images && images.length)
            res.images = images;

        return res;
    }

    function getCannonical() {
            var link = document.evaluate(
                '/h:html/h:head/h:link[translate(@rel, "CANONICAL", "canonical") = "canonical"]',
                document,
                function () { return document.documentElement.namespaceURI || ""; },
                XPathResult.FIRST_ORDERED_NODE_TYPE,
                null
            ).singleNodeValue;
        if (!link || !link.href) return null;
        var url = link.href;
        if (location.href == url) return null;
        return url;
    }

    function getImages() {
        var images = Array.prototype.filter.call(
            document.getElementsByTagName("img"),
            function (img) { return (img instanceof HTMLImageElement); }
        );

        var maxCount = 20;
        if (images.length > maxCount) {
            images = images.map(function (image, index) {
                var size = Math.min(image.naturalWidth,
                                    image.naturalHeight);
                return { image: image, size: size, index: index };
            }).sort(function (a, b) { return b.size - a.size; })
                .slice(0, maxCount)
                .sort(function(a, b) { return a.index - b.index; })
                .map(function (item) { return item.image; });
        }
        return images.filter(function(image) { return image && image.src; }).map(function(image) { return image.src; });
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
